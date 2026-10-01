(() => {
  "use strict";

  const HEIGHT_KEY = "ai-log-editor-heights-v1";
  const ENCODING_KEY = "ai-log-file-encodings-v1";
  const DEFAULT_PERCENT = 80;
  const HEIGHT_MIN = 50;
  const HEIGHT_MAX = 160;
  const HEIGHT_STEP = 10;
  const FILE_CHUNK = 3072;
  const TAIL_BYTES = 65536;
  const ACCEPTED = /\.(txt|log|md|markdown|json|jsonl|csv|tsv|xml|html?|mht|mhtml)$/i;
  const loadEncodingPrefs = () => {
    try {
      const value = JSON.parse(localStorage.getItem(ENCODING_KEY) || "{}");
      return value && typeof value === "object" ? value : {};
    } catch (_) { return {}; }
  };
  const encodingPrefs = loadEncodingPrefs();
  const saveEncodingPrefs = () => {
    try { localStorage.setItem(ENCODING_KEY, JSON.stringify(encodingPrefs)); } catch (_) {}
  };
  const state = {
    files: [],
    previews: new Map(),
    previewJobs: new Map(),
    renaming: "",
    busy: false,
    path: ""
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const sleep = () => new Promise(resolve => setTimeout(resolve, 0));
  const nativePrompt = command => {
    try { return window.prompt(command, "") || ""; }
    catch (_) { return ""; }
  };
  const utf8ToB64 = value => {
    const bytes = new TextEncoder().encode(String(value == null ? "" : value));
    let binary = "";
    for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(binary);
  };
  const bytesToB64 = bytes => {
    let binary = "";
    for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(binary);
  };
  const b64ToBytes = value => {
    const binary = atob(String(value || ""));
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
    return out;
  };
  const b64ToUtf8 = value => new TextDecoder("utf-8").decode(b64ToBytes(value));
  const normalizeEncodingLabel = value => {
    const label = String(value || "").trim().toLowerCase().replace(/["']/g, "").replace(/_/g, "-");
    if (!label) return "";
    if (/^(?:utf-?8|unicode-1-1-utf-8)$/.test(label)) return "utf-8";
    if (/^(?:utf-?16le|unicodefffe)$/.test(label)) return "utf-16le";
    if (/^(?:utf-?16be|unicodefeff)$/.test(label)) return "utf-16be";
    if (/^(?:euc-?kr|cp-?949|ms-?949|windows-?949|x-windows-949|ks-c-5601-1987|ks-c-5601-1989|ksc5601|korean)$/.test(label)) return "euc-kr";
    return "";
  };
  const byteAsciiProbe = bytes => {
    const limit = Math.min(bytes?.length || 0, 131072);
    let out = "";
    for (let i = 0; i < limit; i += 0x8000) {
      out += String.fromCharCode.apply(null, bytes.subarray(i, Math.min(limit, i + 0x8000)));
    }
    return out;
  };
  const declaredEncodingFromBytes = bytes => {
    const probe = byteAsciiProbe(bytes);
    const patterns = [
      /(?:charset|encoding)\s*=\s*["']?\s*([a-z0-9._-]+)/i,
      /<\?xml[^>]*encoding\s*=\s*["']\s*([^"']+)/i,
      /content-type\s*:[^\r\n;]+;[^\r\n]*charset\s*=\s*["']?\s*([a-z0-9._-]+)/i
    ];
    for (const pattern of patterns) {
      const match = pattern.exec(probe);
      const normalized = normalizeEncodingLabel(match && match[1]);
      if (normalized) return normalized;
    }
    return "";
  };
  const hasBom = bytes => {
    if (!bytes || !bytes.length) return "";
    if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) return "utf-8";
    if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) return "utf-16le";
    if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) return "utf-16be";
    return "";
  };
  const looksUtf16 = bytes => {
    const limit = Math.min(bytes?.length || 0, 8192);
    if (limit < 8) return "";
    let evenZero = 0, oddZero = 0, pairs = 0;
    for (let i = 0; i + 1 < limit; i += 2) {
      if (bytes[i] === 0) evenZero++;
      if (bytes[i + 1] === 0) oddZero++;
      pairs++;
    }
    if (oddZero > pairs * 0.28 && evenZero < pairs * 0.08) return "utf-16le";
    if (evenZero > pairs * 0.28 && oddZero < pairs * 0.08) return "utf-16be";
    return "";
  };
  const canDecodeFatal = (bytes, encoding, allowStartCut = false, allowEndCut = false) => {
    const startMax = allowStartCut ? Math.min(4, bytes.length) : 0;
    const endMax = allowEndCut ? Math.min(4, bytes.length) : 0;
    for (let start = 0; start <= startMax; start++) {
      for (let end = 0; end <= endMax && start + end <= bytes.length; end++) {
        try {
          new TextDecoder(encoding, { fatal: true }).decode(bytes.subarray(start, bytes.length - end));
          return true;
        } catch (_) {}
      }
    }
    return false;
  };
  const detectTextEncoding = (headBytes, tailBytes = headBytes) => {
    const head = headBytes || new Uint8Array();
    const tail = tailBytes || head;
    const explicit = hasBom(head) || declaredEncodingFromBytes(head) || looksUtf16(head);
    if (explicit) return explicit;
    const headUtf8 = canDecodeFatal(head, "utf-8", false, true);
    const tailUtf8 = canDecodeFatal(tail, "utf-8", true, false);
    if (headUtf8 && tailUtf8) return "utf-8";
    try { new TextDecoder("euc-kr").decode(new Uint8Array()); return "euc-kr"; }
    catch (_) { return "utf-8"; }
  };
  const decodedTextScore = value => {
    const text = String(value || "");
    const replacements = (text.match(/�/g) || []).length;
    const controls = (text.match(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g) || []).length;
    const mojibake = (text.match(/[ÃÂìëêíîïðñòóôõö]/g) || []).length;
    return replacements * 1000 + controls * 80 + mojibake * 3;
  };
  const decodeUtf16BeFallback = bytes => {
    const even = bytes.length - (bytes.length % 2);
    const swapped = new Uint8Array(even);
    for (let i = 0; i < even; i += 2) { swapped[i] = bytes[i + 1]; swapped[i + 1] = bytes[i]; }
    return new TextDecoder("utf-16le").decode(swapped);
  };
  const decodeBytesWithEncoding = (bytes, encoding, absoluteOffset = 0) => {
    let source = bytes || new Uint8Array();
    const enc = normalizeEncodingLabel(encoding) || "utf-8";
    if ((enc === "utf-16le" || enc === "utf-16be") && (Number(absoluteOffset) & 1) && source.length) source = source.subarray(1);
    if (enc === "utf-8" && absoluteOffset > 0) {
      for (let skip = 0; skip <= Math.min(4, source.length); skip++) {
        try { return new TextDecoder("utf-8", { fatal: true }).decode(source.subarray(skip)).replace(/^\uFEFF/, ""); }
        catch (_) {}
      }
    }
    if (enc === "euc-kr" && absoluteOffset > 0 && source.length > 1) {
      const candidates = [0, 1].map(skip => {
        try {
          const value = new TextDecoder("euc-kr").decode(source.subarray(skip));
          return { value, score: decodedTextScore(value) + skip * 0.25 };
        } catch (_) { return { value: "", score: Number.POSITIVE_INFINITY }; }
      }).sort((a, b) => a.score - b.score);
      return candidates[0].value.replace(/^\uFEFF/, "");
    }
    try { return new TextDecoder(enc).decode(source).replace(/^\uFEFF/, ""); }
    catch (_) {
      if (enc === "utf-16be") return decodeUtf16BeFallback(source).replace(/^\uFEFF/, "");
      return new TextDecoder("utf-8").decode(source).replace(/^\uFEFF/, "");
    }
  };
  const decodeSmartResult = (bytes, options = {}) => {
    const source = bytes || new Uint8Array();
    const head = options.head || source.subarray(0, Math.min(source.length, 131072));
    const tail = options.tail || source.subarray(Math.max(0, source.length - 131072));
    const encoding = normalizeEncodingLabel(options.encoding) || detectTextEncoding(head, tail);
    return { text: decodeBytesWithEncoding(source, encoding, Number(options.absoluteOffset) || 0), encoding };
  };
  const decodeSmart = bytes => decodeSmartResult(bytes).text;
  const encodingDisplayName = encoding => ({ "utf-8": "UTF-8", "utf-16le": "UTF-16 LE", "utf-16be": "UTF-16 BE", "euc-kr": "CP949/EUC-KR" }[encoding] || encoding || "자동");
  const toast = message => {
    if (typeof showToast === "function") showToast(message);
    else nativePrompt("__NATIVE_TOAST__\t" + utf8ToB64(message));
  };
  const formatBytes = value => {
    const n = Number(value) || 0;
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(n < 10240 ? 1 : 0)} KB`;
    if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(n < 10 * 1024 * 1024 ? 1 : 0)} MB`;
    return `${(n / 1024 / 1024 / 1024).toFixed(1)} GB`;
  };
  const formatDate = value => {
    const n = Number(value) || 0;
    if (!n) return "";
    try { return new Intl.DateTimeFormat("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(n)); }
    catch (_) { return ""; }
  };
  const safeName = value => String(value || "log.txt").replace(/[\\/:*?"<>|\u0000-\u001f]/g, "_").replace(/[ .]+$/g, "").slice(0, 180) || "log.txt";
  const escapeHtml = value => String(value == null ? "" : value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const mimeForName = name => {
    const lower = String(name || "").toLowerCase();
    if(/\.(mht|mhtml)$/.test(lower)) return "multipart/related";
    if(/\.(html|htm)$/.test(lower)) return "text/html";
    if(/\.(md|markdown)$/.test(lower)) return "text/markdown";
    if(/\.(json|jsonl)$/.test(lower)) return "application/json";
    if(/\.csv$/.test(lower)) return "text/csv";
    if(/\.tsv$/.test(lower)) return "text/tab-separated-values";
    if(/\.xml$/.test(lower)) return "application/xml";
    return "text/plain";
  };
  const fileFromStoredBytes = (bytes, name, modified) => {
    const cleanName = safeName(name);
    const options = {type:mimeForName(cleanName), lastModified:Number(modified) || Date.now()};
    try { return new File([bytes], cleanName, options); }
    catch (_) {
      const blob = new Blob([bytes], {type:options.type});
      try { Object.defineProperty(blob, "name", {value:cleanName, configurable:true}); } catch (_) { blob.name = cleanName; }
      try { Object.defineProperty(blob, "lastModified", {value:options.lastModified, configurable:true}); } catch (_) { blob.lastModified = options.lastModified; }
      return blob;
    }
  };
  const icon = name => ({
    folder: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 6.5h6l2 2h9v9.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/><path d="M3.5 9h17"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>',
    upload: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4m0 0-4 4m4-4 4 4"/><path d="M5 14v5h14v-5"/></svg>',
    load: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m0 0-4-4m4 4 4-4"/><path d="M5 19h14"/></svg>',
    edit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 20 4.2-1 10-10-3.2-3.2-10 10z"/><path d="m13.8 7 3.2 3.2"/></svg>',
    trash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M9 7V4h6v3m-8 0 1 13h8l1-13M10 11v5m4-5v5"/></svg>'
  })[name] || "";

  function loadHeightState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(HEIGHT_KEY) || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (_) { return {}; }
  }
  const heights = loadHeightState();
  const heightTargets = [
    { key: "classicInput", el: () => $("#inputText") },
    { key: "classicOutput", el: () => $("#outputTextPreview") },
    { key: "chatInput", el: () => $("#chatPaste") },
    { key: "chatOutput", el: () => $("#chatOutputTextPreview") }
  ];
  function baseHeight() { return matchMedia("(max-width:860px)").matches ? 360 : 440; }
  function normalizedPercent(key) {
    const n = Number(heights[key]);
    return Number.isFinite(n) ? Math.max(HEIGHT_MIN, Math.min(HEIGHT_MAX, Math.round(n / HEIGHT_STEP) * HEIGHT_STEP)) : DEFAULT_PERCENT;
  }
  function saveHeights() {
    try { localStorage.setItem(HEIGHT_KEY, JSON.stringify(heights)); } catch (_) {}
  }
  function applyHeight(item) {
    const el = item.el();
    if (!el) return;
    const percent = normalizedPercent(item.key);
    const px = Math.max(160, Math.round(baseHeight() * percent / 100));
    el.style.setProperty("height", `${px}px`, "important");
    el.style.setProperty("max-height", `${px}px`, "important");
    el.style.setProperty("min-height", "0", "important");
    el.style.setProperty("--synced-result-height", `${px}px`);
    const box = el.closest(".resultBox");
    if (box) {
      box.style.setProperty("height", "auto", "important");
      box.style.setProperty("min-height", "0", "important");
    }
    const value = document.querySelector(`[data-editor-size-value="${item.key}"]`);
    if (value) value.textContent = `${percent}%`;
  }
  function applyAllHeights() { heightTargets.forEach(applyHeight); }
  function changeHeight(key, delta) {
    heights[key] = Math.max(HEIGHT_MIN, Math.min(HEIGHT_MAX, normalizedPercent(key) + delta));
    saveHeights();
    const item = heightTargets.find(v => v.key === key);
    if (item) applyHeight(item);
  }
  function resetHeight(key) {
    heights[key] = DEFAULT_PERCENT;
    saveHeights();
    const item = heightTargets.find(v => v.key === key);
    if (item) applyHeight(item);
  }
  function installSizeControl(item) {
    const el = item.el();
    if (!el) return;
    const box = el.closest(".editorBox");
    const label = box && box.querySelector(":scope > .editorLabel");
    if (!label || label.dataset.sizeControlInstalled === "1") return;
    label.dataset.sizeControlInstalled = "1";
    label.classList.add("editorLabelWithSize");
    const text = document.createElement("div");
    text.className = "editorLabelText";
    Array.from(label.children).forEach(child => text.appendChild(child));
    const controls = document.createElement("div");
    controls.className = "editorSizeControl";
    controls.setAttribute("aria-label", "편집칸 높이 조절");
    controls.innerHTML = `<button type="button" class="editorSizeBtn" data-editor-size-key="${item.key}" data-editor-size-delta="-${HEIGHT_STEP}" aria-label="높이 줄이기">−</button><button type="button" class="editorSizeValue" data-editor-size-value="${item.key}" aria-label="기본 80%로 되돌리기">${normalizedPercent(item.key)}%</button><button type="button" class="editorSizeBtn" data-editor-size-key="${item.key}" data-editor-size-delta="${HEIGHT_STEP}" aria-label="높이 늘리기">+</button>`;
    label.append(text, controls);
  }
  function installSizing() {
    heightTargets.forEach(installSizeControl);
    applyAllHeights();
    document.addEventListener("click", event => {
      const deltaBtn = event.target.closest("[data-editor-size-delta]");
      if (deltaBtn) {
        changeHeight(deltaBtn.dataset.editorSizeKey, Number(deltaBtn.dataset.editorSizeDelta));
        event.preventDefault();
        return;
      }
      const valueBtn = event.target.closest("[data-editor-size-value]");
      if (valueBtn) {
        resetHeight(valueBtn.dataset.editorSizeValue);
        event.preventDefault();
      }
    });
    const override = () => applyAllHeights();
    try { window.syncActiveResultHeight = override; syncActiveResultHeight = override; } catch (_) { window.syncActiveResultHeight = override; }
    ["resize", "orientationchange"].forEach(type => addEventListener(type, () => setTimeout(applyAllHeights, 80), { passive: true }));
    setTimeout(applyAllHeights, 100);
    setTimeout(applyAllHeights, 600);
  }

  function modalMarkup() {
    return `<div class="logLibraryModal" id="logLibraryModal" hidden aria-hidden="true"><section class="logLibraryDialog" role="dialog" aria-modal="true" aria-labelledby="logLibraryTitle"><header class="logLibraryHead"><div class="logLibraryTitleWrap"><div class="logLibraryTitle" id="logLibraryTitle">로그 파일 보관함</div><div class="logLibraryPath" id="logLibraryPath">앱 전용 저장 경로를 확인하는 중</div></div><div class="logLibraryHeadActions"><button type="button" class="logLibraryIconBtn" id="logLibraryClose" aria-label="닫기">${icon("close")}</button></div></header><div class="logLibraryToolbar"><button type="button" class="logLibraryImportBtn" id="logLibraryImport">${icon("upload")}<span>파일 추가</span></button><input id="logLibraryFileInput" type="file" multiple hidden accept=".txt,.log,.md,.markdown,.json,.jsonl,.csv,.tsv,.xml,.html,.htm,.mht,.mhtml,text/*,application/json,application/octet-stream"><div class="logLibraryStatus" id="logLibraryStatus">여러 파일을 한 번에 선택해 추가할 수 있습니다.</div></div><div class="logLibraryList" id="logLibraryList"></div><footer class="logLibraryFoot">선택한 파일은 원본을 유지한 채 앱 전용 <b>AI_Log_EPUB/logs</b> 폴더에 복사됩니다. 보관함에서 삭제하면 이 폴더의 실제 파일도 영구 삭제됩니다.</footer></section></div>`;
  }
  function installLibraryUi() {
    const themeButton = $("#themeToggleButton");
    if (themeButton && !$("#logLibraryButton")) {
      const button = document.createElement("button");
      button.className = "themeIconButton";
      button.id = "logLibraryButton";
      button.type = "button";
      button.setAttribute("aria-label", "로그 파일 보관함");
      button.title = "로그 파일 보관함";
      button.innerHTML = icon("folder");
      themeButton.before(button);
    }
    if (!$("#logLibraryModal")) {
      document.body.insertAdjacentHTML("beforeend", modalMarkup());
      /* 이 모달이 v6 의 것임을 표시해 둔다. log_library_tabs_v38.js 가 설치되면
         이 모달을 지우고 자기 것을 새로 꽂는데, 그때도 v6 의 document 리스너는
         살아 있어서 v38 모달을 자기 것인 양 닫아 버렸다(작업 중인데 ESC 로 닫히던 사고). */
      $("#logLibraryModal")?.setAttribute("data-library-owner", "v6");
    }
    $("#logLibraryButton")?.addEventListener("click", openLibrary);
    $("#logLibraryClose")?.addEventListener("click", () => closeLibrary());   /* 이벤트 객체가 인자로 새지 않게 감싼다 */
    $("#logLibraryModal")?.addEventListener("click", event => { if (event.target.id === "logLibraryModal") closeLibrary(); });
    $("#logLibraryImport")?.addEventListener("click", openLogFilePicker);
    $("#logLibraryFileInput")?.addEventListener("change", async event => {
      const input = event.currentTarget;
      const files = [];
      const list = input && input.files;
      for (let i = 0; list && i < list.length; i++) {
        const file = list.item ? list.item(i) : list[i];
        if (file) files.push(file);
      }
      if (!files.length) {
        setStatus("선택된 파일이 없습니다.");
        return;
      }
      // Android WebView에서는 value를 먼저 비우면 content URI 권한이 풀려
      // FileReader가 실패할 수 있다. 모든 파일 처리가 끝난 뒤에만 초기화한다.
      try { await importFiles(files); }
      finally { if (input) input.value = ""; }
    });
    $("#logLibraryList")?.addEventListener("click", onListClick);
    /* ESC 는 document 전역이라, v38 이 설치된 뒤에도 이 리스너가 계속 돈다.
       내가 만든 모달일 때만 반응한다. 남의 모달은 그쪽 규칙(작업 중 잠금 등)에 맡긴다. */
    document.addEventListener("keydown", event => { const modal = ownModal(); if (event.key === "Escape" && modal && !modal.hidden) closeLibrary(); });
  }
  /* v6 이 직접 꽂은 보관함 모달만 돌려준다. v38 이 갈아 끼웠으면 null 이라 아무 것도 건드리지 않는다. */
  function ownModal() { const modal = $("#logLibraryModal"); return modal && modal.getAttribute("data-library-owner") === "v6" ? modal : null; }
  function setStatus(text) { const el = $("#logLibraryStatus"); if (el) el.textContent = text; }
  function setBusy(value) {
    state.busy = !!value;
    $(".logLibraryDialog")?.classList.toggle("logLibraryBusy", state.busy);
    // 선택된 File 객체를 읽는 동안 input을 disabled로 바꾸면 일부 Android WebView에서
    // content URI 접근이 끊길 수 있으므로 파일 input은 그대로 유지한다.
    const button = $("#logLibraryImport");
    if (button) button.disabled = state.busy;
  }
  async function openLibrary() {
    const modal = $("#logLibraryModal");
    if (!modal) return;
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    const pathReply = nativePrompt("__LOG_PATH__");
    if (pathReply) {
      try { state.path = b64ToUtf8(pathReply); } catch (_) { state.path = "AI_Log_EPUB/logs"; }
    }
    const pathEl = $("#logLibraryPath");
    if (pathEl) { pathEl.textContent = state.path || "앱 전용 AI_Log_EPUB/logs 폴더"; pathEl.title = state.path || ""; }
    await refreshFiles();
  }
  function closeLibrary() {
    const modal = ownModal();   /* 남의(v38) 모달은 닫지 않는다 */
    if (!modal || state.busy) return;
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    state.renaming = "";
  }
  async function refreshFiles() {
    const raw = nativePrompt("__LOG_LIST__");
    state.files = String(raw || "").split("\n").filter(Boolean).map(line => {
      const [nameB64, size, modified] = line.split("\t");
      try { return { name: b64ToUtf8(nameB64), size: Number(size) || 0, modified: Number(modified) || 0 }; }
      catch (_) { return null; }
    }).filter(Boolean).sort((a, b) => (b.modified - a.modified) || a.name.localeCompare(b.name, "ko"));
    renderFiles();
    setStatus(state.files.length ? `${state.files.length}개 파일 · 이름 수정과 불러오기 가능` : "여러 파일을 한 번에 선택해 추가할 수 있습니다.");
  }
  const encodingOptions = selected => [
    ["auto", "자동"],
    ["utf-8", "UTF-8"],
    ["windows-949", "CP949"],
    ["utf-16le", "UTF-16 LE"],
    ["utf-16be", "UTF-16 BE"]
  ].map(([value, label]) => `<option value="${value}"${selected === value ? " selected" : ""}>${label}</option>`).join("");
  const fileEncoding = name => encodingPrefs[name] || "auto";
  function renderFiles() {
    const list = $("#logLibraryList");
    if (!list) return;
    if (!state.files.length) {
      list.innerHTML = '<div class="logLibraryEmpty">보관된 로그가 없습니다.<br>위의 파일 추가 버튼으로 여러 파일을 한 번에 넣어 보세요.</div>';
      return;
    }
    list.innerHTML = state.files.map(file => {
      const preview = state.previews.get(file.name);
      const rename = state.renaming === file.name;
      return `<article class="logFileItem" data-log-name="${escapeHtml(file.name)}"><div class="logFileMain"><div class="logFileInfo"><div class="logFileName" title="${escapeHtml(file.name)}">${escapeHtml(file.name)}</div><div class="logFileMetaRow"><div class="logFileMeta">${formatBytes(file.size)}${file.modified ? ` · ${escapeHtml(formatDate(file.modified))}` : ""} · 원본 FileReader·안전 분할 저장</div></div></div><div class="logFileActions"><button type="button" class="logFileAction" data-action="preview" title="정리된 마지막 부분 미리보기" aria-label="정리된 마지막 부분 미리보기">${preview ? "−" : "+"}</button><button type="button" class="logFileAction" data-action="load" title="원본 로그 입력칸으로 불러오기" aria-label="원본 로그 입력칸으로 불러오기">${icon("load")}</button><button type="button" class="logFileAction" data-action="rename" title="파일 이름 수정" aria-label="파일 이름 수정">${icon("edit")}</button><button type="button" class="logFileAction danger" data-action="delete" title="삭제" aria-label="삭제">${icon("trash")}</button></div></div>${rename ? `<div class="logRenameRow"><input class="logRenameInput" value="${escapeHtml(file.name)}" aria-label="새 파일 이름"><button type="button" class="logRenameButton primary" data-action="rename-save">저장</button><button type="button" class="logRenameButton" data-action="rename-cancel">취소</button></div>` : ""}${preview ? `<div class="logFilePreview"><div class="logFilePreviewMeta">${escapeHtml(preview.meta)}</div><pre class="logFilePreviewText">${escapeHtml(preview.text)}</pre></div>` : ""}</article>`;
    }).join("");

    // Android WebView에 따라 innerHTML 교체 직후 미리보기 본문 노드만
    // 누락되는 경우가 있다. 버튼이 − 상태라면 본문을 DOM으로 다시 보장한다.
    list.querySelectorAll(".logFileItem").forEach(item => {
      const name = item.dataset.logName || "";
      const preview = state.previews.get(name);
      if (!preview) return;
      let panel = item.querySelector(".logFilePreview");
      if (!panel) {
        panel = document.createElement("div");
        panel.className = "logFilePreview";
        const meta = document.createElement("div");
        meta.className = "logFilePreviewMeta";
        const text = document.createElement("pre");
        text.className = "logFilePreviewText";
        panel.append(meta, text);
        item.appendChild(panel);
      }
      panel.hidden = false;
      panel.removeAttribute("hidden");
      panel.style.display = "block";
      const meta = panel.querySelector(".logFilePreviewMeta");
      const text = panel.querySelector(".logFilePreviewText");
      if (meta) meta.textContent = String(preview.meta || "");
      if (text) text.textContent = String(preview.text || "");
    });

    // 일부 Android WebView에서 동적 목록의 위임 click이 누락되는 경우가 있어
    // 미리보기 버튼만 렌더링 직후 직접 연결한다. 다른 액션은 기존 위임 처리 유지.
    list.querySelectorAll('button[data-action="preview"]').forEach(button => {
      button.onclick = event => {
        event.preventDefault();
        event.stopPropagation();
        const item = button.closest(".logFileItem");
        const name = item?.dataset.logName;
        if (name) void togglePreview(name);
      };
    });

    if (state.renaming) {
      const row = Array.from(list.querySelectorAll(".logFileItem")).find(node => node.dataset.logName === state.renaming);
      const input = row && row.querySelector(".logRenameInput");
      if (input) { input.focus(); input.setSelectionRange(0, input.value.lastIndexOf(".") > 0 ? input.value.lastIndexOf(".") : input.value.length); }
    }
  }
  function onEncodingChange(event) {
    const select = event.target.closest(".logEncodingSelect");
    if (!select || state.busy) return;
    const item = select.closest(".logFileItem");
    const name = item?.dataset.logName;
    if (!name) return;
    const value = select.value || "auto";
    if (value === "auto") delete encodingPrefs[name];
    else encodingPrefs[name] = value;
    saveEncodingPrefs();
    state.previews.delete(name);
    toast(value === "auto" ? "문자 인코딩을 자동 감지로 바꿨습니다." : `${select.options[select.selectedIndex]?.text || value}로 읽도록 설정했습니다.`);
  }
  function openLogFilePicker() {
    const input = $("#logLibraryFileInput");
    if (!input || state.busy) return;
    // 일부 Android WebView는 DOM 생성 시점의 속성을 캐시하므로 열기 직전에 다시 보장한다.
    input.multiple = true;
    input.setAttribute("multiple", "");
    input.value = "";
    try {
      if (typeof input.showPicker === "function") input.showPicker();
      else input.click();
    } catch (_) {
      try { input.click(); }
      catch (error) {
        console.error(error);
        toast("파일 선택기를 열지 못했습니다.");
      }
    }
  }
  function readSelectedFileBytesLikeOriginal(file) {
    // 원본 탭에서 실제로 사용하는 FileReader 경로를 그대로 우선 사용한다.
    try {
      if (typeof readFileAsArrayBuffer === "function") {
        return Promise.resolve(readFileAsArrayBuffer(file)).then(buffer => new Uint8Array(buffer));
      }
    } catch (_) {}
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try { resolve(new Uint8Array(reader.result)); }
        catch (error) { reject(error); }
      };
      reader.onerror = () => reject(reader.error || new Error("파일을 읽지 못했습니다."));
      reader.onabort = () => reject(new Error("파일 읽기가 취소됐습니다."));
      reader.readAsArrayBuffer(file);
    });
  }
  async function importFiles(files) {
    const source = Array.from(files || []).filter(Boolean);
    const supported = source.filter(file => ACCEPTED.test(file.name || "") || String(file.type || "").startsWith("text/") || file.type === "application/json" || !file.type);
    if (!supported.length) { toast("읽을 수 있는 로그 파일을 선택해 주세요."); return; }
    setBusy(true);
    let completed = 0;
    const failed = [];
    try {
      for (let index = 0; index < supported.length; index++) {
        const file = supported[index];
        let id = "";
        let finished = false;
        let storedName = safeName(file.name);
        try {
          setStatus(`${file.name} 읽는 중 · ${index + 1}/${supported.length}`);
          const bytes = await readSelectedFileBytesLikeOriginal(file);
          const begin = nativePrompt(`__LOG_BEGIN__\t${utf8ToB64(storedName)}\t${bytes.length}`);
          const beginParts = String(begin || "").split("\t");
          id = beginParts[0] || "";
          if (beginParts[1]) {
            try { storedName = b64ToUtf8(beginParts[1]) || storedName; } catch (_) {}
          }
          if (!id) throw new Error("앱의 로그 저장 폴더를 열지 못했습니다.");

          if (!bytes.length) {
            setStatus(`${file.name} 빈 파일 저장 중 · ${index + 1}/${supported.length}`);
          }
          for (let offset = 0; offset < bytes.length; offset += FILE_CHUNK) {
            const chunk = bytes.subarray(offset, Math.min(bytes.length, offset + FILE_CHUNK));
            const ok = nativePrompt(`__LOG_WRITE__\t${id}\t${bytesToB64(chunk)}`);
            if (ok !== "1") throw new Error("파일 데이터를 저장하지 못했습니다.");
            const sent = offset + chunk.length;
            setStatus(`${file.name} 저장 중 · ${Math.min(100, Math.round(sent / Math.max(1, bytes.length) * 100))}% · ${index + 1}/${supported.length}`);
            if (((offset / FILE_CHUNK) & 15) === 0) await sleep();
          }
          if (nativePrompt(`__LOG_FINISH__\t${id}`) !== "1") throw new Error("파일 저장을 마치지 못했습니다.");
          finished = true;

          // 저장 직후 전체 목록을 다시 조회해 검증하면 일부 Android WebView에서
          // 긴 prompt 응답이 잘리면서 정상 파일까지 실패로 오인해 삭제될 수 있다.
          // FINISH 성공을 저장 완료 기준으로 삼고 목록은 전체 작업 후 한 번만 갱신한다.
          completed += 1;
        } catch (error) {
          console.error("log library import failed", file && file.name, error);
          if (id && !finished) nativePrompt(`__LOG_CANCEL__\t${id}`);
          failed.push({ name: file && file.name ? file.name : "이름 없는 파일", message: error && error.message ? error.message : "저장 실패" });
          setStatus(`${file && file.name ? file.name : "파일"} 실패 · ${error && error.message ? error.message : "저장 실패"}`);
        }
      }

      if (completed && !failed.length) {
        toast(`${completed}개 로그 파일을 보관함에 추가했습니다.`);
      } else if (completed) {
        toast(`${completed}개 추가, ${failed.length}개 실패했습니다.`);
      } else {
        const reason = failed[0] && failed[0].message ? ` ${failed[0].message}` : "";
        toast(`파일을 추가하지 못했습니다.${reason}`);
      }
    } finally {
      setBusy(false);
      await refreshFiles();
      if (failed.length) {
        const names = failed.slice(0, 3).map(item => item.name).join(", ");
        setStatus(`${completed}개 추가 · ${failed.length}개 실패${names ? ` (${names}${failed.length > 3 ? " 외" : ""})` : ""}`);
      }
    }
  }
  async function onListClick(event) {
    const button = event.target.closest("[data-action]");
    if (!button || state.busy) return;
    const item = button.closest(".logFileItem");
    const name = item?.dataset.logName;
    if (!name) return;
    const action = button.dataset.action;
    if (action === "preview") return togglePreview(name);
    if (action === "load") return loadFile(name);
    if (action === "rename") { state.renaming = name; renderFiles(); return; }
    if (action === "rename-cancel") { state.renaming = ""; renderFiles(); return; }
    if (action === "rename-save") return saveRename(name, item.querySelector(".logRenameInput")?.value || "");
    if (action === "delete") return deleteFile(name);
  }
  function normalizePreviewDetailsTags(value) {
    return String(value || "")
      .replace(/&lt;\s*(\/?)\s*(details\b[^&<>]*?)&gt;/gi, (_m, slash, body) => `<${slash || ""}${String(body || "").trim()}>`)
      .replace(/&lt;\s*(\/?)\s*(summary\b[^&<>]*?)&gt;/gi, (_m, slash, body) => `<${slash || ""}${String(body || "").trim()}>`);
  }
  function stripFoldedDetailsForPreview(value) {
    let text = normalizePreviewDetailsTags(value).replace(/<!--\s*rofan:[\s\S]*?-->/gi, "\n");
    text = text.replace(/<summary\b[^>]*>[\s\S]*?<\/summary\s*>/gi, "\n");
    for (let i = 0; i < 12; i++) {
      const next = text.replace(/<details\b[^>]*>[\s\S]*?<\/details\s*>/gi, "\n");
      if (next === text) break;
      text = next;
    }
    const firstOpen = text.search(/<details\b/i);
    const firstClose = text.search(/<\/details\s*>/i);
    if (firstClose >= 0 && (firstOpen < 0 || firstClose < firstOpen)) {
      const closeMatch = /<\/details\s*>/i.exec(text.slice(firstClose));
      text = text.slice(firstClose + (closeMatch ? closeMatch[0].length : 0));
    }
    text = text.replace(/<details\b[^>]*>[\s\S]*$/gi, "\n");
    return text.replace(/<\/?(?:details|summary)\b[^>]*>/gi, "\n");
  }
  function decodePreviewEntities(value) {
    const box = document.createElement("textarea");
    box.innerHTML = String(value || "");
    return box.value;
  }
  function stripDoubleBraceBlocksForPreview(value) {
    const source = String(value || "");
    let output = "";
    let depth = 0;
    let index = 0;
    while (index < source.length) {
      if (source.startsWith("{{", index)) {
        depth += 1;
        index += 2;
        continue;
      }
      if (depth > 0 && source.startsWith("}}", index)) {
        depth -= 1;
        index += 2;
        if (depth === 0) output += "\n";
        continue;
      }
      if (depth === 0) output += source[index];
      index += 1;
    }
    return output;
  }
  function outputStylePreview(value) {
    let text = stripDoubleBraceBlocksForPreview(stripFoldedDetailsForPreview(value))
      .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, "\n")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, "\n")
      .replace(/<!--[\s\S]*?-->/g, "\n")
      .replace(/<br\s*\/?\s*>/gi, "\n")
      .replace(/<\/(?:p|div|li|tr|h[1-6]|blockquote|section|article)\s*>/gi, "\n")
      .replace(/<li\b[^>]*>/gi, "• ")
      .replace(/<[^>]+>/g, "")
      .replace(/<[^>\n]*$/g, "");
    text = decodePreviewEntities(text)
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/__(.*?)__/g, "$1")
      .replace(/\u00a0/g, " ")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n[ \t]+/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    const lines = text.split(/\r?\n/);
    return lines.length > 140 ? lines.slice(-140).join("\n") : text;
  }
  const parseReadReply = reply => {
    const tab = String(reply || "").indexOf("\t");
    if (tab < 0) throw new Error("파일을 읽지 못했습니다.");
    return { total: Number(reply.slice(0, tab)) || 0, bytes: b64ToBytes(reply.slice(tab + 1)) };
  };
  const readHeadSample = (name, total) => {
    const wanted = Math.max(1024, Math.min(131072, Number(total) || 131072));
    return parseReadReply(nativePrompt(`__LOG_READ__\t${utf8ToB64(name)}\t0\t${wanted}`)).bytes;
  };
  const waitForPreviewPaint = () => new Promise(resolve => {
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    } else setTimeout(resolve, 0);
  });
  const PREVIEW_TAIL_BYTES = 131072;
  const PREVIEW_HEAD_BYTES = 16384;
  const PREVIEW_READ_CHUNK = 16384;
  const PREVIEW_TURN_LIMIT = 5;
  function readStoredRange(name, startOffset, wantedLength) {
    const pieces = [];
    let offset = Math.max(0, Number(startOffset) || 0);
    let remaining = Math.max(0, Number(wantedLength) || 0);
    let total = 0;
    let read = 0;
    while (remaining > 0) {
      const requestSize = Math.min(PREVIEW_READ_CHUNK, remaining);
      const parsed = parseReadReply(nativePrompt(`__LOG_READ__\t${utf8ToB64(name)}\t${offset}\t${requestSize}`));
      total = parsed.total || total;
      const bytes = parsed.bytes;
      if (!bytes.length) break;
      pieces.push(bytes);
      offset += bytes.length;
      read += bytes.length;
      remaining -= bytes.length;
      if (bytes.length < requestSize) break;
    }
    const merged = new Uint8Array(read);
    let pos = 0;
    pieces.forEach(bytes => { merged.set(bytes, pos); pos += bytes.length; });
    return { total, bytes: merged };
  }
  function readPreviewSamples(name, expectedSize) {
    let total = Math.max(0, Number(expectedSize) || 0);
    const headRequest = Math.min(PREVIEW_HEAD_BYTES, total || PREVIEW_HEAD_BYTES);
    const headResult = readStoredRange(name, 0, headRequest);
    total = headResult.total || total;
    const tailOffset = Math.max(0, total - PREVIEW_TAIL_BYTES);
    const tailLength = total ? Math.min(PREVIEW_TAIL_BYTES, total - tailOffset) : PREVIEW_TAIL_BYTES;
    const tailResult = tailOffset === 0 && headResult.bytes.length >= tailLength
      ? { total, bytes: headResult.bytes.subarray(0, tailLength) }
      : readStoredRange(name, tailOffset, tailLength);
    total = tailResult.total || total;
    return { total, head: headResult.bytes, tail: tailResult.bytes, tailOffset };
  }
  function previewTurnKey(block) {
    const id = String(block?.getAttribute?.("data-block-id") || "").trim();
    const matched = id.match(/^(.*?)-(?:user|bot|character)(?:-|$)/i);
    return matched ? matched[1] : "";
  }
  function extractStructuredPreviewTurns(raw, limit = PREVIEW_TURN_LIMIT) {
    if (!/<(?:div|article|main|section)\b/i.test(String(raw || ""))) return "";
    const holder = document.createElement("div");
    try { holder.innerHTML = String(raw || ""); }
    catch (_) { return ""; }
    const blocks = Array.from(holder.querySelectorAll('.rofan-block[data-owner], [data-owner][data-kind]'));
    if (!blocks.length) return "";

    const groups = [];
    let current = null;
    for (const block of blocks) {
      const owner = String(block.getAttribute("data-owner") || "").toLowerCase();
      const key = previewTurnKey(block);
      const text = outputStylePreview(block.innerHTML || block.textContent || "");
      if (!text) continue;

      const startsNew = !current
        || (key && current.key && key !== current.key)
        || (!key && owner === "user" && current.parts.length > 0 && current.seenOwner);
      if (startsNew) {
        current = { key, parts: [], seenOwner: false };
        groups.push(current);
      }
      current.parts.push(text);
      if (owner === "user" || owner === "character" || owner === "bot") current.seenOwner = true;
    }
    const complete = groups
      .map(group => group.parts.join("\n\n").trim())
      .filter(Boolean);
    return complete.slice(-Math.max(1, Number(limit) || PREVIEW_TURN_LIMIT)).join("\n\n");
  }
  function extractApproximatePreviewTurns(raw, limit = PREVIEW_TURN_LIMIT) {
    const structured = extractStructuredPreviewTurns(raw, limit);
    if (structured) return structured;
    const cleaned = outputStylePreview(raw);
    if (!cleaned) return "";
    const sections = cleaned.split(/\n{2,}/).map(value => value.trim()).filter(Boolean);
    const responseCount = Math.max(2, (Math.max(1, Number(limit) || PREVIEW_TURN_LIMIT)) * 2);
    return sections.length > responseCount ? sections.slice(-responseCount).join("\n\n") : cleaned;
  }
  async function togglePreview(name) {
    if (state.previews.has(name)) {
      state.previewJobs.delete(name);
      state.previews.delete(name);
      renderFiles();
      return;
    }
    const file = state.files.find(v => v.name === name);
    const job = {};
    state.previewJobs.set(name, job);

    state.previews.set(name, {
      text: "끝부분 미리보기를 불러오는 중입니다…",
      meta: "정리 결과 미리보기 · 끝부분 읽는 중"
    });
    renderFiles();
    await waitForPreviewPaint();
    if (state.previewJobs.get(name) !== job) return;
    const opened = Array.from(document.querySelectorAll(".logFileItem")).find(node => node.dataset.logName === name);
    opened?.querySelector(".logFilePreview")?.scrollIntoView({ block: "nearest", behavior: "auto" });

    try {
      const sample = readPreviewSamples(name, file?.size || 0);
      if (state.previewJobs.get(name) !== job) return;
      if (!sample.tail.length && Number(file?.size || 0) > 0) throw new Error("저장된 파일 끝부분을 읽지 못했습니다.");

      const selected = fileEncoding(name);
      const encoding = selected === "auto"
        ? detectTextEncoding(sample.head, sample.tail)
        : normalizeEncodingLabel(selected);
      const raw = decodeBytesWithEncoding(sample.tail, encoding || "utf-8", sample.tailOffset);
      const text = extractApproximatePreviewTurns(raw, PREVIEW_TURN_LIMIT);
      if (state.previewJobs.get(name) !== job) return;

      state.previews.set(name, {
        text: text || "(details·접힘 토큰·HTML·{{…}} 제거 후 표시할 내용 없음)",
        meta: `정리 결과 미리보기 · 마지막 약 ${PREVIEW_TURN_LIMIT}턴 · ${encodingDisplayName(encoding)} · ${formatBytes(sample.tail.length)}만 읽음 · details/접힘 토큰/HTML/{{…}} 제거`
      });
      renderFiles();
    } catch (error) {
      console.error(error);
      if (state.previewJobs.get(name) !== job) return;
      state.previews.set(name, {
        text: "미리보기를 불러오지 못했습니다. − 버튼으로 닫은 뒤 다시 시도해 주세요.",
        meta: `정리 결과 미리보기 · 오류: ${error && error.message ? error.message : "파일 읽기 실패"}`
      });
      renderFiles();
      toast("정리 결과 미리보기를 불러오지 못했습니다.");
    } finally {
      if (state.previewJobs.get(name) === job) state.previewJobs.delete(name);
      setStatus(`${state.files.length}개 파일`);
    }
  }
  async function readWholeFile(name, expectedSize) {
    const pieces = [];
    let offset = 0;
    let total = Number(expectedSize) || 0;
    while (!total || offset < total) {
      const reply = nativePrompt(`__LOG_READ__\t${utf8ToB64(name)}\t${offset}\t${FILE_CHUNK}`);
      const tab = reply.indexOf("\t");
      if (tab < 0) throw new Error("파일 읽기 실패");
      total = Number(reply.slice(0, tab)) || total;
      const bytes = b64ToBytes(reply.slice(tab + 1));
      if (!bytes.length) break;
      pieces.push(bytes); offset += bytes.length;
      setStatus(`${name} 불러오는 중 · ${total ? Math.min(100, Math.round(offset / total * 100)) : "…"}%`);
      await sleep();
    }
    const merged = new Uint8Array(offset);
    let pos = 0; pieces.forEach(bytes => { merged.set(bytes, pos); pos += bytes.length; });
    return merged;
  }
  async function loadFile(name) {
    const file = state.files.find(v => v.name === name);
    setBusy(true);
    try {
      const bytes = await readWholeFile(name, file?.size || 0);
      const storedFile = fileFromStoredBytes(bytes, name, file?.modified);
      if(typeof window.loadClassicFileObject !== "function") throw new Error("원본 파일 불러오기 함수를 찾지 못했습니다.");
      const loaded = await window.loadClassicFileObject(storedFile, {activate:true, silentSuccess:true});
      if(!loaded) throw new Error("원본 탭 파일 불러오기가 완료되지 않았습니다.");
      closeLibraryForce();
      toast(`${name} 파일을 원본 탭과 동일한 방식으로 불러왔습니다.`);
    } catch (error) { console.error(error); toast("파일을 원본 로그 입력칸으로 불러오지 못했습니다."); }
    finally { setBusy(false); setStatus(`${state.files.length}개 파일`); }
  }
  function closeLibraryForce() {
    const modal = ownModal();   /* 남의(v38) 모달은 닫지 않는다 */
    if (!modal) return;
    modal.hidden = true; modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  function loadTextIntoCurrentInput(name, raw, bytes) {
    const current = typeof activeMode !== "undefined" ? activeMode : ($("#chatPanel")?.classList.contains("hidden") ? "classic" : "chat");
    if (current === "chat") {
      let sanitized = "";
      const lower = name.toLowerCase();
      const mht = /\.(mht|mhtml)$/i.test(lower) || /MIME-Version:\s*1\.0/i.test(raw) || /Content-Type:\s*multipart\/related/i.test(raw);
      const html = /<!doctype\s+html\b|<html\b|<body\b|<(div|p|span)\b/i.test(raw);
      const markdown = /<!--\s*rofan:/i.test(raw) || /\.(md|markdown)$/i.test(lower);
      try {
        if (markdown && typeof structuredMarkdownToHtml === "function") sanitized = structuredMarkdownToHtml(raw) || (typeof plainTextToHtml === "function" ? plainTextToHtml(raw) : escapeHtml(raw));
        else if ((mht || html) && typeof sanitizePastedHTML === "function") {
          const source = mht && typeof window.extractHTMLFromMHTBytes === "function"
            ? (window.extractHTMLFromMHTBytes(bytes) || (typeof extractHTMLFromMHT === "function" ? extractHTMLFromMHT(raw) : raw))
            : (mht && typeof extractHTMLFromMHT === "function" ? extractHTMLFromMHT(raw) : raw);
          sanitized = sanitizePastedHTML(typeof extractLikelyChatHTML === "function" ? extractLikelyChatHTML(source) : source);
        } else sanitized = typeof plainTextToHtml === "function" ? plainTextToHtml(raw) : escapeHtml(raw).replace(/\n/g, "<br>");
      } catch (_) { sanitized = typeof plainTextToHtml === "function" ? plainTextToHtml(raw) : escapeHtml(raw).replace(/\n/g, "<br>"); }
      if (typeof resetReviewDecisions === "function") resetReviewDecisions();
      if (typeof chatPaste !== "undefined" && chatPaste) {
        chatPaste.innerHTML = sanitized;
        // 접힘 토큰과 숨김 표시를 풀어야 안쪽 코드와 글이 살아난다
        if (typeof openAllFolds === "function") openAllFolds(chatPaste);
      }
      try { cachedChatFileName = name; } catch (_) {}
    } else {
      if (current === "epubedit") $(".tab[data-tab='classic']")?.click();
      let chunks = null;
      try { chunks = typeof fileContentToChunks === "function" ? fileContentToChunks(raw, name, bytes) : null; } catch (_) {}
      try {
        classicLoadedChunks = chunks && chunks.length ? chunks : null;
        classicLoadedFileText = chunks && chunks.length && typeof chunksDisplayText === "function" ? chunksDisplayText(chunks) : String(raw || "");
        if (typeof applyClassicExcerpt === "function") applyClassicExcerpt();
        else if (typeof input !== "undefined" && input) input.value = classicLoadedFileText;
      } catch (_) {
        const target = $("#inputText"); if (target) target.value = String(raw || "");
      }
    }
    if (typeof transformText === "function") transformText();
    if (typeof updateChapterDividerPanel === "function") updateChapterDividerPanel();
    if (typeof scheduleAutosave === "function") scheduleAutosave();
    applyAllHeights();
  }
  async function saveRename(oldName, requested) {
    const next = safeName(requested);
    if (!next || next === oldName) { state.renaming = ""; renderFiles(); return; }
    const reply = nativePrompt(`__LOG_RENAME__\t${utf8ToB64(oldName)}\t${utf8ToB64(next)}`);
    if (reply === "E_EXISTS") { toast("같은 이름의 파일이 이미 있습니다."); return; }
    if (!reply || reply === "0") { toast("파일 이름을 바꾸지 못했습니다."); return; }
    state.previews.delete(oldName);
    if (encodingPrefs[oldName]) {
      encodingPrefs[next] = encodingPrefs[oldName];
      delete encodingPrefs[oldName];
      saveEncodingPrefs();
    }
    state.renaming = "";
    toast("파일 이름을 수정했습니다.");
    await refreshFiles();
  }
  async function deleteFile(name) {
    if (!window.confirm(`“${name}” 파일을 삭제하시겠습니까?\n\n앱 보관함 경로의 실제 파일이 영구 삭제됩니다. 원래 위치의 파일은 삭제되지 않습니다.`)) return;
    if (nativePrompt(`__LOG_DELETE__\t${utf8ToB64(name)}`) !== "1") { toast("파일을 삭제하지 못했습니다."); return; }
    state.previews.delete(name);
    if (encodingPrefs[name]) { delete encodingPrefs[name]; saveEncodingPrefs(); }
    toast("파일을 삭제했습니다.");
    await refreshFiles();
  }

  function boot() {
    installSizing();
    installLibraryUi();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
