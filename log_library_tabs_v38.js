(() => {
  "use strict";
  if (window.__aiLogSharedLibraryV38) return;
  window.__aiLogSharedLibraryV38 = true;

  const bridge = () => window.RofanNativeBridge;
  const nativePrompt = command => { try { return window.prompt(command, "") || ""; } catch (_) { return ""; } };
  const te = new TextEncoder();
  const td = new TextDecoder("utf-8");
  const ACCEPTED = /\.(txt|log|md|markdown|json|jsonl|csv|tsv|xml|html?|mht|mhtml)$/i;
  const PREVIEW_HEAD = 4096;
  const PREVIEW_TAIL = 49152;
  const PREVIEW_TURNS = 5;
  const LEGACY_MIGRATION_KEY = "ai-log-shared-import-migrated-v38";
  const AUTO_SEEN_KEY = "ai-log-export-last-seen-v38";
  const ENCODING_KEY = "ai-log-shared-encodings-v38";
  const categories = {
    full: { label: "전체 발췌", folder: "전체 범위 발췌", empty: "전체 범위 발췌 파일이 없습니다.", add: false },
    selected: { label: "선택 발췌", folder: "선택 범위 발췌", empty: "선택 범위 발췌 파일이 없습니다.", add: false },
    import: { label: "불러오기", folder: "불러오기", empty: "불러온 로그 파일이 없습니다.", add: true }
  };
  const state = { category: "import", files: [], previews: new Map(), renaming: "", busy: false, opened: false, selectMode: false, selected: new Set() };
  const $ = (selector, root = document) => root.querySelector(selector);
  const esc = value => String(value == null ? "" : value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  /* 180자를 넘으면 뒤를 자르는데 확장자가 뒤에 있어 .html 이 통째로 날아갔다.
     (확장자가 없어지면 mimeFor 가 text/plain 을 돌려줘 다시 불러올 때 파싱이 달라진다)
     확장자를 떼어 두고 이름만 줄인 뒤 다시 붙인다. */
  const safeName = value => {
    const cleaned = String(value || "log.txt").replace(/[\\/:*?"<>|\u0000-\u001f]/g, "_").replace(/[ .]+$/g, "");
    if (!cleaned) return "log.txt";
    if (cleaned.length <= 180) return cleaned;
    const dot = cleaned.lastIndexOf(".");
    const ext = dot > 0 && cleaned.length - dot <= 12 ? cleaned.slice(dot) : "";
    return (cleaned.slice(0, 180 - ext.length) + ext) || "log.txt";
  };
  const toast = message => { if (typeof showToast === "function") showToast(message); else nativePrompt("__NATIVE_TOAST__\t" + btoa(unescape(encodeURIComponent(String(message))))); };
  const icon = name => ({
    folder:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 6.5h6l1.8 2h9.2v9.5a2 2 0 0 1-2 2h-15z"/><path d="M3.5 6.5v-2h6l1.8 2"/></svg>',
    upload:'<svg viewBox="0 0 24 24"><path d="M12 16V4m0 0-4 4m4-4 4 4M4 15v4h16v-4"/></svg>',
    close:'<svg viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg>',
    load:'<svg viewBox="0 0 24 24"><path d="M12 3v12m0 0 4-4m-4 4-4-4M4 18v2h16v-2"/></svg>',
    edit:'<svg viewBox="0 0 24 24"><path d="m4 16-.8 4 4-.8L18 8.4 15.6 6zM14.5 7.1l2.4 2.4"/></svg>',
    trash:'<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 4v5m4-5v5"/></svg>'
  }[name] || "");
  const formatBytes = value => { const n = Number(value) || 0; if (n < 1024) return `${n} B`; if (n < 1048576) return `${(n/1024).toFixed(n<10240?1:0)} KB`; return `${(n/1048576).toFixed(n<10485760?1:0)} MB`; };
  const formatDate = value => { try { return new Intl.DateTimeFormat("ko-KR", { month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit" }).format(new Date(Number(value)||0)); } catch (_) { return ""; } };
  const mimeFor = name => /\.html?$/i.test(name) ? "text/html" : /\.m(?:d|arkdown)$/i.test(name) ? "text/markdown" : /\.jsonl?$/i.test(name) ? "application/json" : /\.csv$/i.test(name) ? "text/csv" : /\.png$/i.test(name) ? "image/png" : "text/plain";
  const encPrefs = (() => { try { return JSON.parse(localStorage.getItem(ENCODING_KEY) || "{}") || {}; } catch (_) { return {}; } })();
  const saveEncPrefs = () => { try { localStorage.setItem(ENCODING_KEY, JSON.stringify(encPrefs)); } catch (_) {} };
  const fileKey = file => `${file.category}:${file.id}`;

  function modalMarkup() {
    return `<div class="logLibraryModal" id="logLibraryModal" hidden aria-hidden="true"><section class="logLibraryDialog sharedLibraryDialog" role="dialog" aria-modal="true" aria-labelledby="logLibraryTitle">
      <header class="logLibraryHead"><div class="logLibraryTitleWrap"><div class="logLibraryTitle" id="logLibraryTitle">로그 파일 보관함</div><div class="logLibraryPath" id="logLibraryPath"></div></div><div class="logLibraryHeadActions"><button type="button" class="logLibraryIconBtn" id="logLibraryClose" aria-label="닫기">${icon("close")}</button></div></header>
      <nav class="logLibraryTabs" aria-label="보관함 종류">${Object.entries(categories).map(([key, value]) => `<button type="button" class="logLibraryTab${key === "import" ? " active" : ""}" data-library-tab="${key}">${value.label}</button>`).join("")}</nav>
      <div class="logLibraryToolbar"><button type="button" class="logLibraryImportBtn" id="logLibraryImport">${icon("upload")}<span>파일 추가</span></button><button type="button" class="logLibraryImportBtn" id="logLibrarySelDel"><span>선택 삭제</span></button><input id="logLibraryFileInput" type="file" multiple hidden accept=".txt,.log,.md,.markdown,.json,.jsonl,.csv,.tsv,.xml,.html,.htm,.mht,.mhtml,text/*,application/json,application/octet-stream"><div class="logLibraryStatus" id="logLibraryStatus"></div></div>
      <div class="logLibraryList" id="logLibraryList"></div>
      <footer class="logLibraryFoot" id="logLibraryFoot"></footer>
    </section></div>`;
  }

  function installUi() {
    const oldButton = $("#logLibraryButton");
    if (oldButton) {
      const clone = oldButton.cloneNode(true);
      oldButton.replaceWith(clone);
    } else {
      const theme = $("#themeToggleButton");
      if (theme) {
        const button = document.createElement("button"); button.type = "button"; button.className = "themeIconButton"; button.id = "logLibraryButton"; button.title = "로그 파일 보관함"; button.setAttribute("aria-label", button.title); button.innerHTML = icon("folder"); theme.before(button);
      }
    }
    $("#logLibraryModal")?.remove();
    document.body.insertAdjacentHTML("beforeend", modalMarkup());
    $("#logLibraryButton")?.addEventListener("click", openLibrary);
    $("#logLibraryClose")?.addEventListener("click", () => closeLibrary());   /* 이벤트 객체가 force 로 넘어가지 않게 감싼다 */
    $("#logLibraryModal")?.addEventListener("click", event => { if (event.target.id === "logLibraryModal") closeLibrary(); });
    $("#logLibraryImport")?.addEventListener("click", openPicker);
    $("#logLibraryFileInput")?.addEventListener("change", async event => {
      const input = event.currentTarget;
      const files = Array.from(input?.files || []);
      try { if (files.length) await importFiles(files); }
      finally { if (input) input.value = ""; }
    });
    $(".logLibraryTabs")?.addEventListener("click", event => {
      const button = event.target.closest("[data-library-tab]");
      if (!button || state.busy) return;
      switchTab(button.dataset.libraryTab);
    });
    $("#logLibraryList")?.addEventListener("click", onListClick);
    document.addEventListener("keydown", event => { if (event.key === "Escape" && !$("#logLibraryModal")?.hidden) closeLibrary(); });
    updateChrome();
  }

  function setStatus(value) { const el = $("#logLibraryStatus"); if (el) el.textContent = String(value || ""); }
  function setBusy(value) { state.busy = !!value; $(".sharedLibraryDialog")?.classList.toggle("logLibraryBusy", state.busy); const add = $("#logLibraryImport"); if (add) add.disabled = state.busy; }
  function updateChrome() {
    const cfg = categories[state.category];
    document.querySelectorAll("[data-library-tab]").forEach(node => node.classList.toggle("active", node.dataset.libraryTab === state.category));
    const path = `Download/로그 발췌기/${cfg.folder}`;
    const pathEl = $("#logLibraryPath"); if (pathEl) { pathEl.textContent = path; pathEl.title = path; }
    const add = $("#logLibraryImport"); if (add) add.hidden = !cfg.add; exitSelectMode(); wireSelectDelete();
    const foot = $("#logLibraryFoot"); if (foot) foot.innerHTML = state.category === "import"
      ? `선택한 파일의 앱 관리본은 <b>${esc(path)}</b> 폴더에 저장됩니다. 원래 위치의 파일은 유지됩니다.`
      : `<b>${esc(path)}</b> 폴더의 실제 파일을 표시합니다. 이름 수정과 삭제도 해당 파일에 바로 반영됩니다.`;
  }

  async function openLibrary() {
    const modal = $("#logLibraryModal"); if (!modal) return;
    modal.hidden = false; modal.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden"; state.opened = true;
    updateChrome();
    if (state.category === "import") await migrateLegacyOnce();
    await refreshFiles();
  }
  /* force: 앱이 스스로 닫을 때. 사용자가 작업 중에 닫는 것만 막아야 하는데,
     불러오기 성공 직후의 자동 닫기도 여기 걸려(그 시점은 아직 busy 다) 모달이 남아 있었다. */
  function closeLibrary(force) { if (state.busy && !force) return; const modal = $("#logLibraryModal"); if (modal) { modal.hidden = true; modal.setAttribute("aria-hidden", "true"); } document.body.style.overflow = ""; state.renaming = ""; state.opened = false; }
  async function switchTab(category) { if (!categories[category] || category === state.category) return; state.category = category; state.previews.clear(); state.renaming = ""; updateChrome(); await refreshFiles(); }

  async function refreshFiles() {
    try {
      setStatus("폴더를 확인하는 중…");
      // 구형 브리지(이 기능이 없는 앱)에서는 안내 자체를 띄우지 않는다
      try {
        state.storageGranted = typeof bridge().storageStatus === "function"
          ? await bridge().storageStatus() : null;
      } catch (_) { state.storageGranted = null; }
      state.files = (await bridge().listShared(state.category)).sort((a,b) => (b.modified-a.modified) || String(b.id).localeCompare(String(a.id)));
      /* 비었을 때 이유를 말할 수 있게, 앱이 본 것을 함께 받아 둔다. */
      state.probe = null;
      if (!state.files.length) {
        try { state.probe = await bridge().probeShared(state.category); } catch (_) { }
      }
      renderFiles();
      setStatus(state.files.length ? `${state.files.length}개 파일 · 최근 수정 순` : categories[state.category].empty);
    } catch (error) { console.error(error); state.files = []; renderFiles(); setStatus(error.message || "폴더를 읽지 못했습니다."); }
  }

  function renderFiles() { setTimeout(updateSelDelUi, 0);
    const list = $("#logLibraryList"); if (!list) return;
    if (!state.files.length) {
      /* 앱을 지웠다 다시 깔면 Download 아래 예전 파일이 그대로 있어도 목록에 안 뜬다.
         소유자 기록이 끊겨 MediaStore 가 남의 파일로 보기 때문이다.
         폴더를 직접 읽을 권한을 켜면 되살아나므로, 비었을 때만 그 길을 안내한다. */
      const probe = state.probe;
      let why;
      if (state.storageGranted === false) {
        why = `예전에 저장한 파일이 폴더에 남아 있을 수 있습니다.<br>
               앱을 다시 설치하면 목록에서 빠지는데, <b>다운로드 › 로그 발췌기</b> 폴더를 한 번 골라 주면 다시 보입니다.`;
      } else if (probe && !probe.폴더있음) {
        why = `연결된 폴더 <b>${esc(probe.연결된폴더 || "?")}</b> 안에 <b>${esc(probe.찾던폴더)}</b> 폴더가 없습니다.<br>
               ${probe.하위폴더 ? `그 안에 있는 폴더: ${esc(probe.하위폴더)}` : "그 안에 폴더가 하나도 없습니다."}<br>
               <b>다운로드 › 로그 발췌기</b> 를 골라야 합니다(그 아래 폴더를 고르면 안 됩니다).`;
      } else if (probe) {
        why = `연결된 폴더 <b>${esc(probe.연결된폴더 || "?")}</b> 의 <b>${esc(probe.찾던폴더)}</b> 폴더가 비어 있습니다.`;
      } else {
        why = `예전 파일이 폴더에 남아 있으면 <b>다운로드 › 로그 발췌기</b> 를 연결해 불러올 수 있습니다.`;
      }
      /* 연결한 뒤에도 창구를 남긴다 — 엉뚱한 폴더를 골랐을 때 다시 고를 길이 있어야 한다. */
      const hint = `<div class="logLibraryEmptyFix">${why}
             <button type="button" id="logLibraryGrant" style="margin-top:8px;padding:8px 12px;border:1px solid var(--ai-accent,#7FB2D6);border-radius:10px;background:transparent;color:inherit;font:inherit;cursor:pointer">${state.storageGranted === false ? "저장 폴더 연결" : "저장 폴더 다시 고르기"}</button></div>`;
      list.innerHTML = `<div class="logLibraryEmpty">${esc(categories[state.category].empty)}${categories[state.category].add ? "<br>파일 추가 버튼으로 여러 개를 한 번에 넣을 수 있습니다." : ""}${hint}</div>`;
      const grant = $("#logLibraryGrant");
      if (grant) grant.addEventListener("click", async () => {
        try {
          await bridge().requestStorage();
          toast("‘다운로드 › 로그 발췌기’ 폴더를 고르시면 목록이 새로 고쳐집니다.");
        } catch (error) { console.warn("folder pick", error); toast(error.message || "폴더 선택 화면을 열지 못했습니다."); }
      });
      return;
    }
    list.innerHTML = state.files.map(file => {
      const key = fileKey(file), preview = state.previews.get(key), renaming = state.renaming === key;
      return `<article class="logFileItem" data-file-id="${esc(file.id)}" data-file-category="${esc(file.category)}">
        <div class="logFileMain"><div class="logFileInfo"><div class="logFileName" title="${esc(file.name)}">${esc(file.name)}</div><div class="logFileMetaRow"><div class="logFileMeta">${formatBytes(file.size)}${file.modified ? ` · ${esc(formatDate(file.modified))}` : ""} · ${esc(categories[file.category].label)}</div></div></div>
        <div class="logFileActions"><button type="button" class="logFileAction" data-action="preview" title="마지막 약 5턴 미리보기">${preview ? "−" : "+"}</button><button type="button" class="logFileAction" data-action="load" title="발췌기에 불러오기">${icon("load")}</button><button type="button" class="logFileAction" data-action="rename" title="이름 수정">${icon("edit")}</button><button type="button" class="logFileAction danger" data-action="delete" title="삭제">${icon("trash")}</button></div></div>
        ${renaming ? `<div class="logRenameRow"><input class="logRenameInput" value="${esc(file.name)}"><button class="logRenameButton primary" data-action="rename-save">저장</button><button class="logRenameButton" data-action="rename-cancel">취소</button></div>` : ""}
        ${preview ? `<div class="logFilePreview"><div class="logFilePreviewMeta">${esc(preview.meta)}</div><pre class="logFilePreviewText${preview.code?" asCode":""}">${esc(preview.text)}</pre></div>` : ""}
      </article>`;
    }).join("");
    if (state.renaming) {
      const row = Array.from(list.querySelectorAll(".logFileItem")).find(node => `${node.dataset.fileCategory}:${node.dataset.fileId}` === state.renaming);
      const input = row?.querySelector(".logRenameInput"); if (input) { input.focus(); const dot = input.value.lastIndexOf("."); input.setSelectionRange(0, dot > 0 ? dot : input.value.length); }
    }
  }

  function currentFileFromButton(button) {
    const item = button.closest(".logFileItem");
    if (!item) return null;
    return state.files.find(file => String(file.id) === String(item.dataset.fileId) && String(file.category) === String(item.dataset.fileCategory)) || null;
  }
  async function onListClick(event) {
    const button = event.target.closest("[data-action]");
    /* 파일 이름·정보 영역을 눌러도 아무 반응이 없었다(선택 모드일 때만 반응).
       미리보기 열기로 이어 준다 — 가장 덜 놀라운 동작이고 파일을 건드리지 않는다. */
    if (!button && !state.selectMode && !state.busy) {
      const item = event.target.closest(".logFileItem");
      const info = event.target.closest(".logFileInfo, .logFileName");
      if (item && info) {
        const file = state.files.find(f => String(f.id) === String(item.dataset.fileId) && String(f.category) === String(item.dataset.fileCategory));
        if (file) return togglePreview(file);
      }
    }
    if (!button || state.busy) return;
    const file = currentFileFromButton(button); if (!file) return;
    const action = button.dataset.action, key = fileKey(file);
    if (action === "preview") return togglePreview(file);
    if (action === "load") return loadSharedFile(file, { closeLibrary: true, source: "manual" });
    if (action === "rename") { state.renaming = key; renderFiles(); return; }
    if (action === "rename-cancel") { state.renaming = ""; renderFiles(); return; }
    if (action === "rename-save") return renameFile(file, button.closest(".logFileItem")?.querySelector(".logRenameInput")?.value || "");
    if (action === "delete") { button.disabled = true; return deleteFile(file).finally(() => { try { button.disabled = false; } catch (_) {} }); }   /* 연타로 shared_delete 가 두 번 나가던 것 */
  }

  function wireSelectDelete(){
    const b=selDelBtn();
    if(b && !b.__wired){
      b.__wired=true;
      b.addEventListener("click", async ()=>{
        if(!state.selectMode){ state.selectMode=true; state.selected.clear(); updateSelDelUi(); toast("삭제할 파일들을 눌러 고른 뒤, 같은 버튼으로 삭제하세요."); return; }
        if(state.selected.size===0){ exitSelectMode(); return; }
        await runSelectedDelete();
      });
    }
    const list=$("#logLibraryList");
    if(list && !list.__selWired){
      list.__selWired=true;
      list.addEventListener("click", e=>{
        if(!state.selectMode) return;
        const item=e.target.closest(".logFileItem");
        if(!item) return;
        e.preventDefault(); e.stopPropagation();
        const id=item.dataset.fileId;
        if(state.selected.has(id)) state.selected.delete(id); else state.selected.add(id);
        updateSelDelUi();
      }, true);
    }
    if(!document.getElementById("logLibSelDelCss")){
      const st=document.createElement("style"); st.id="logLibSelDelCss";
      st.textContent=".logFileItem.selMode{cursor:pointer}"
        +".logFileItem.selPick{outline:2px solid rgba(214,90,90,.85);background:rgba(235,120,120,.12);border-radius:10px}"
        +"#logLibrarySelDel.selArm{background:rgba(235,120,120,.16);border-color:rgba(214,90,90,.6)}";
      document.head.appendChild(st);
    }
  }
  function openPicker() {
    const input = $("#logLibraryFileInput"); if (!input || state.busy || state.category !== "import") return;
    input.multiple = true; input.setAttribute("multiple", ""); input.value = "";
    try { if (typeof input.showPicker === "function") input.showPicker(); else input.click(); }
    catch (_) { input.click(); }
  }
  async function readFileBytes(file) {
    try { if (typeof readFileAsArrayBuffer === "function") return new Uint8Array(await readFileAsArrayBuffer(file)); } catch (_) {}
    return new Uint8Array(await file.arrayBuffer());
  }
  async function importFiles(files) {
    const supported = files.filter(file => ACCEPTED.test(file.name || "") || String(file.type || "").startsWith("text/") || !file.type || file.type === "application/json");
    if (!supported.length) { toast("읽을 수 있는 로그 파일을 선택해 주세요."); return; }
    setBusy(true); let done = 0, failed = 0;
    try {
      for (let i = 0; i < supported.length; i++) {
        const file = supported[i];
        try {
          setStatus(`${file.name} 읽는 중 · ${i+1}/${supported.length}`);
          const bytes = await readFileBytes(file);
          setStatus(`${file.name} 저장 중 · ${i+1}/${supported.length}`);
          await bridge().saveShared("import", bytes, safeName(file.name), file.type || mimeFor(file.name)); done++;
        } catch (error) { console.error(error); failed++; }
      }
      toast(failed ? `${done}개 추가, ${failed}개 실패했습니다.` : `${done}개 파일을 불러오기 폴더에 추가했습니다.`);
      await refreshFiles();
    } finally { setBusy(false); }
  }

  function hasBom(bytes) { if (bytes.length>=3&&bytes[0]===0xef&&bytes[1]===0xbb&&bytes[2]===0xbf) return "utf-8"; if(bytes.length>=2&&bytes[0]===0xff&&bytes[1]===0xfe)return "utf-16le"; if(bytes.length>=2&&bytes[0]===0xfe&&bytes[1]===0xff)return "utf-16be"; return ""; }
  function detectEncoding(head, tail) {
    const bom = hasBom(head); if (bom) return bom;
    const ascii = String.fromCharCode(...head.subarray(0, Math.min(head.length, 8192)));
    const match = ascii.match(/(?:charset|encoding)\s*=\s*["']?\s*([a-z0-9._-]+)/i);
    if (match && /(?:euc-?kr|cp-?949|windows-?949|ksc5601)/i.test(match[1])) return "euc-kr";
    if (match && /utf-?16le/i.test(match[1])) return "utf-16le";
    if (match && /utf-?16be/i.test(match[1])) return "utf-16be";
    try { new TextDecoder("utf-8", {fatal:true}).decode(head); new TextDecoder("utf-8", {fatal:true}).decode(tail); return "utf-8"; } catch (_) {}
    try { new TextDecoder("euc-kr").decode(new Uint8Array()); return "euc-kr"; } catch (_) { return "utf-8"; }
  }
  function decodeBytes(bytes, encoding, offset = 0) {
    let source = bytes;
    if (encoding === "utf-8" && offset > 0) {
      for (let skip=0; skip<=Math.min(4,source.length); skip++) { try { return new TextDecoder("utf-8",{fatal:true}).decode(source.subarray(skip)); } catch (_) {} }
    }
    if (encoding === "euc-kr" && offset > 0 && source.length>1) {
      const a = new TextDecoder("euc-kr").decode(source), b = new TextDecoder("euc-kr").decode(source.subarray(1));
      return (a.match(/�/g)||[]).length <= (b.match(/�/g)||[]).length ? a : b;
    }
    try { return new TextDecoder(encoding || "utf-8").decode(source).replace(/^\uFEFF/,""); }
    catch (_) { return td.decode(source).replace(/^\uFEFF/,""); }
  }
  function normalizePreviewDetailsTags(value) { return String(value||"").replace(/&lt;\s*(\/?)\s*(details\b[^&<>]*?)&gt;/gi,(_m,s,b)=>`<${s||""}${String(b||"").trim()}>`).replace(/&lt;\s*(\/?)\s*(summary\b[^&<>]*?)&gt;/gi,(_m,s,b)=>`<${s||""}${String(b||"").trim()}>`); }
  function stripFolded(value) { let text=normalizePreviewDetailsTags(value).replace(/<!--\s*rofan:[\s\S]*?-->/gi,"\n").replace(/<summary\b[^>]*>[\s\S]*?<\/summary\s*>/gi,"\n"); for(let i=0;i<12;i++){const next=text.replace(/<details\b[^>]*>[\s\S]*?<\/details\s*>/gi,"\n");if(next===text)break;text=next;} return text.replace(/<details\b[^>]*>[\s\S]*$/gi,"\n").replace(/<\/?(?:details|summary)\b[^>]*>/gi,"\n"); }
  function stripBraces(value) { const s=String(value||"");let out="",depth=0;for(let i=0;i<s.length;){if(s.startsWith("{{",i)){depth++;i+=2;continue}if(depth&&s.startsWith("}}",i)){depth--;i+=2;if(!depth)out+="\n";continue}if(!depth)out+=s[i];i++}return out; }
  function outputPreview(value) { let text=stripBraces(stripFolded(value)).replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi,"\n").replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi,"\n").replace(/<!--[\s\S]*?-->/g,"\n").replace(/<br\s*\/?\s*>/gi,"\n").replace(/<\/(?:p|div|li|tr|h[1-6]|blockquote|section|article)\s*>/gi,"\n").replace(/<li\b[^>]*>/gi,"• ").replace(/<[^>]+>/g,"").replace(/<[^>\n]*$/g,""); const box=document.createElement("textarea");box.innerHTML=text;text=box.value.replace(/\*\*(.*?)\*\*/g,"$1").replace(/__(.*?)__/g,"$1").replace(/\u00a0/g," ").replace(/[ \t]+\n/g,"\n").replace(/\n[ \t]+/g,"\n").replace(/\n{3,}/g,"\n\n").trim();const lines=text.split(/\r?\n/);return lines.length>140?lines.slice(-140).join("\n"):text; }
  function turnKey(block){const id=String(block.getAttribute?.("data-block-id")||"");const m=id.match(/^(.*?)-(?:user|bot|character)(?:-|$)/i);return m?m[1]:"";}
  function extractPreview(raw){ if(/<(?:div|article|main|section)\b/i.test(raw)){const holder=document.createElement("div");holder.innerHTML=raw;const blocks=[...holder.querySelectorAll(".rofan-block[data-owner],[data-owner][data-kind]")];if(blocks.length){const groups=[];let current=null;for(const block of blocks){const owner=(block.getAttribute("data-owner")||"").toLowerCase(),key=turnKey(block),text=outputPreview(block.innerHTML||block.textContent||"");if(!text)continue;const next=!current||(key&&current.key&&key!==current.key)||(!key&&owner==="user"&&current.parts.length&&current.seen);if(next){current={key,parts:[],seen:false};groups.push(current)}current.parts.push(text);if(["user","character","bot"].includes(owner))current.seen=true}return groups.map(g=>g.parts.join("\n\n").trim()).filter(Boolean).slice(-PREVIEW_TURNS).join("\n\n");}} const cleaned=outputPreview(raw),parts=cleaned.split(/\n{2,}/).map(v=>v.trim()).filter(Boolean);return parts.length>PREVIEW_TURNS*2?parts.slice(-PREVIEW_TURNS*2).join("\n\n"):cleaned; }

  async function readSharedRange(file, offset, length) {
    const total = Math.max(0, Math.min(Number(length) || 0, Math.max(0, (Number(file.size) || 0) - (Number(offset) || 0))));
    const parts = [];
    let done = 0;
    const CHUNK = 12288;
    while (done < total) {
      const bytes = await bridge().readShared(file.category, file.id, Number(offset) + done, Math.min(CHUNK, total - done));
      if (!bytes.length) break;
      parts.push(bytes);
      done += bytes.length;
      if (parts.length % 4 === 0) await new Promise(resolve => setTimeout(resolve, 0));
    }
    const out = new Uint8Array(done);
    let at = 0;
    for (const part of parts) { out.set(part, at); at += part.length; }
    return out;
  }

  /* 발췌본(.rofan.html)은 1MB 안팎이라, 꼬리 48KB 가 커다란 응답 '한가운데'에서
     시작하는 일이 잦다. 그러면 온전한 블록 여는 태그가 하나도 없어 추출이 빈손이 되고,
     상자만 열리고 내용이 없는 것처럼 보였다 — 발췌 두 탭에서만 나던 증상의 정체다.
     ① 문서 장식(style/script/head)을 먼저 걷어내고
     ② 잘린 앞부분을 버려 첫 온전한 블록부터 읽고
     ③ 빈손이면 꼬리를 4배로 넓혀 한 번 더 시도하고
     ④ 그래도 없으면 글자만이라도 보여 준다. 어떤 경우에도 빈 상자로 끝나지 않는다. */
  function trimPartialHtml(raw){
    let out=String(raw||"")
      .replace(/<style[\s\S]*?<\/style>/gi,"")
      .replace(/<script[\s\S]*?<\/script>/gi,"")
      .replace(/<head[\s\S]*?<\/head>/gi,"");
    const first=out.search(/<(?:div|article|section)\b[^>]*\bdata-owner\b/i);
    if(first>0) out=out.slice(first);
    else if(first<0){
      const anyTag=out.search(/<(?:div|article|section|p)\b/i);
      if(anyTag>0) out=out.slice(anyTag);
    }
    return out;
  }
  async function readPreviewSlice(file, tailBytes){
    const head=await readSharedRange(file,0,Math.min(PREVIEW_HEAD,file.size));
    const tailOffset=Math.max(0,file.size-tailBytes);
    const tail=await readSharedRange(file,tailOffset,Math.min(tailBytes,file.size));
    const key=fileKey(file);
    const pref=encPrefs[key]||"auto";
    /* 꼬리 조각만 보고 판정하면 UTF-8 한글이 EUC-KR 로 잘못 잡혀 글자가 깨진다.
       머리의 charset 선언과 우리 발췌본 확장자를 먼저 믿는다. */
    let encoding=pref==="auto"?detectEncoding(head,tail):pref;
    if(pref==="auto"){
      const declared=String.fromCharCode(...head.subarray(0,Math.min(head.length,4096)));
      if(/charset\s*=\s*["']?\s*utf-?8/i.test(declared)) encoding="utf-8";
      else if(/\.rofan\.html?$/i.test(String(file.name||""))) encoding="utf-8";
    }
    const raw=decodeBytes(tail,encoding,tailOffset);
    return {raw:trimPartialHtml(raw),encoding,bytes:tail.length};
  }
  async function togglePreview(file) {
    const key=fileKey(file); if(state.previews.has(key)){state.previews.delete(key);renderFiles();return;}
    state.previews.set(key,{meta:"정리 결과 미리보기 · 준비 중",text:"마지막 약 5턴을 가볍게 읽는 중입니다…"});renderFiles();
    try {
      let slice=await readPreviewSlice(file,PREVIEW_TAIL);
      let text=extractPreview(slice.raw);
      if(!String(text||"").trim() && file.size>PREVIEW_TAIL){
        slice=await readPreviewSlice(file,PREVIEW_TAIL*4);      // 큰 응답 하나가 꼬리를 다 차지한 경우
        text=extractPreview(slice.raw);
      }
      let code=false;
      if(!String(text||"").trim()){
        const bare=slice.raw.replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim();
        text=bare.slice(-4000);
        code=!text;
        if(!text) text="이 파일에서는 미리볼 문장을 찾지 못했습니다. ("
          +Math.round(slice.bytes/1024)+"KB 읽음 · "+slice.encoding.toUpperCase()+")";
      }
      const meta=`마지막 약 ${PREVIEW_TURNS}턴 · ${slice.encoding.toUpperCase()} · ${formatBytes(slice.bytes)}만 읽음 · details/HTML/{{…}} 제거`;
      state.previews.set(key,{meta,text,code});renderFiles();
    } catch(error){console.error(error);state.previews.set(key,{meta:"미리보기 오류",text:error.message||"파일을 읽지 못했습니다."});renderFiles();}
  }

  function fileFromBytes(bytes,file){try{return new File([bytes],file.name,{type:file.mime||mimeFor(file.name),lastModified:file.modified||Date.now()});}catch(_){const blob=new Blob([bytes],{type:file.mime||mimeFor(file.name)});Object.defineProperty(blob,"name",{value:file.name});return blob;}}
  async function loadSharedFile(file, options={}) {
    setBusy(true);
    try {
      setStatus(`${file.name} 불러오는 중…`);
      const bytes=await bridge().readSharedWhole(file,(done,total)=>setStatus(`${file.name} · ${Math.min(100,Math.round(done/Math.max(1,total)*100))}%`));
      if(typeof window.loadClassicFileObject!=="function")throw new Error("원본 파일 불러오기 기능을 찾지 못했습니다.");
      const loaded=await window.loadClassicFileObject(fileFromBytes(bytes,file),{activate:true,silentSuccess:true});
      if(!loaded)throw new Error("파일 불러오기가 완료되지 않았습니다.");
      if(options.closeLibrary)closeLibrary(true);
      toast(`${file.name} 파일을 발췌기에 불러왔습니다.`);return true;
    }catch(error){console.error(error);toast(error.message||"파일을 불러오지 못했습니다.");return false;}
    finally{setBusy(false);if(state.opened)setStatus(`${state.files.length}개 파일 · 최근 수정 순`);}
  }
  async function renameFile(file,requested){
    /* 빈 값·공백만 넣으면 safeName 이 "log.txt" 를 채워 넣어, 경고도 없이 이름이 바뀌었다.
       여러 파일에 반복하면 전부 log.txt 로 뭉개진다. 빈 이름은 아예 거부한다. */
    if(!String(requested||"").trim()){toast("파일 이름을 입력해 주세요.");return;}
    const next=safeName(requested);if(!next||next===file.name){state.renaming="";renderFiles();return;}try{await bridge().renameShared(file.category,file.id,next);state.renaming="";state.previews.delete(fileKey(file));toast("파일 이름을 수정했습니다.");await refreshFiles();}catch(error){toast(error.message||"이름을 수정하지 못했습니다.");}}
  function selDelBtn(){ return $("#logLibrarySelDel"); }
  function updateSelDelUi(){
    const b=selDelBtn(); if(!b) return;
    const n=state.selected.size;
    b.querySelector("span").textContent = state.selectMode ? (n ? `선택 삭제(${n})` : "선택 취소") : "선택 삭제";
    b.classList.toggle("selArm", state.selectMode);
    document.querySelectorAll(".logFileItem").forEach(el=>{
      el.classList.toggle("selPick", state.selectMode && state.selected.has(el.dataset.fileId));
      el.classList.toggle("selMode", state.selectMode);
    });
  }
  function exitSelectMode(){ state.selectMode=false; state.selected.clear(); updateSelDelUi(); }
  async function runSelectedDelete(){
    const ids=[...state.selected];
    const files=state.files.filter(f=>ids.includes(f.id));
    if(!files.length){ exitSelectMode(); return; }
    if(!confirm(`선택한 ${files.length}개 파일을 삭제하시겠습니까?\n실제 폴더의 파일이 삭제됩니다.`)) return;
    let done=0;
    for(const f of files){
      try{ await bridge().deleteShared(f.category, f.id); state.previews.delete(fileKey(f)); done++; }
      catch(err){ console.warn("선택 삭제", f.name, err); }
    }
    exitSelectMode();
    toast(done===files.length ? `${done}개 파일을 삭제했습니다.` : `${done}개 삭제, ${files.length-done}개 실패`);
    await refreshFiles();
  }
  async function deleteFile(file){if(!confirm(`“${file.name}” 파일을 삭제하시겠습니까?\n\nDownload/로그 발췌기/${categories[file.category].folder} 폴더의 실제 파일이 삭제됩니다.`))return;try{await bridge().deleteShared(file.category,file.id);state.previews.delete(fileKey(file));toast("파일을 삭제했습니다.");await refreshFiles();}catch(error){toast(error.message||"삭제하지 못했습니다.");}}

  function b64ToBytes(value){const raw=atob(String(value||"")),out=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i);return out;}
  function b64ToText(value){return td.decode(b64ToBytes(value));}
  async function readLegacyWhole(name,size){const out=new Uint8Array(size);let offset=0;while(offset<size){const reply=nativePrompt(`__LOG_READ__\t${bridge().textArg(name)}\t${offset}\t${Math.min(3072,size-offset)}`);const tab=reply.indexOf("\t");if(tab<0)throw new Error("이전 보관함 파일 읽기 실패");const bytes=b64ToBytes(reply.slice(tab+1));if(!bytes.length)break;out.set(bytes,offset);offset+=bytes.length;await new Promise(r=>setTimeout(r,0));}return out.slice(0,offset);}
  async function migrateLegacyOnce(){if(localStorage.getItem(LEGACY_MIGRATION_KEY)==="1")return;const raw=nativePrompt("__LOG_LIST__");const legacy=String(raw||"").split("\n").filter(Boolean).map(line=>{const[n,s,m]=line.split("\t");try{return{name:b64ToText(n),size:Number(s)||0,modified:Number(m)||0}}catch(_){return null}}).filter(Boolean);if(!legacy.length){localStorage.setItem(LEGACY_MIGRATION_KEY,"1");return;}try{const existing=new Set((await bridge().listShared("import")).map(file=>file.name));let copied=0;for(const file of legacy){if(existing.has(file.name))continue;setStatus(`이전 보관함 이동 중 · ${file.name}`);const bytes=await readLegacyWhole(file.name,file.size);await bridge().saveShared("import",bytes,file.name,mimeFor(file.name));copied++;}localStorage.setItem(LEGACY_MIGRATION_KEY,"1");if(copied)toast(`이전 보관함 파일 ${copied}개를 불러오기 폴더에 복사했습니다.`);}catch(error){console.error(error);setStatus("이전 보관함 이동을 다음에 다시 시도합니다.");}}

  function hasWorkingFile(){const input=$("#inputText"),chat=$("#chatPaste");if((input?.value||"").trim())return true;if((chat?.textContent||"").trim())return true;try{if(typeof classicLoadedFileText!=="undefined"&&String(classicLoadedFileText||"").trim())return true;}catch(_){}return false;}
  async function findFileByPending(pending){const [category,id,modified]=String(pending||"").split("|");if(!["full","selected"].includes(category)||!id)return null;const files=await bridge().listShared(category);return files.find(file=>file.id===id)||files.find(file=>String(file.modified)===String(modified))||files[0]||null;}
  async function checkNewExports(){
    if(document.visibilityState==="hidden")return;
    /* 여러 시점에서 부르므로 겹쳐 돌 수 있다. 앞의 확인이 끝나기 전에 또 들어오면
       같은 파일로 물음 상자가 두 번 뜬다. 한 번에 하나만 돌게 막는다. */
    if(checkNewExports.busy)return;
    checkNewExports.busy=true;
    try{
      let pending=await bridge().getConfig("pending_export","");
      let file=pending?await findFileByPending(pending):null;
      if(!file){
        const [full,selected]=await Promise.all([bridge().listShared("full"),bridge().listShared("selected")]);
        const latest=[full[0],selected[0]].filter(Boolean).sort((a,b)=>b.modified-a.modified)[0];
        const seen=localStorage.getItem(AUTO_SEEN_KEY)||"";
        if(latest&&seen&&seen!==`${latest.category}:${latest.id}:${latest.modified}`)file=latest;
        if(!seen&&latest)localStorage.setItem(AUTO_SEEN_KEY,`${latest.category}:${latest.id}:${latest.modified}`);
      }
      if(!file)return;
      const marker=`${file.category}:${file.id}:${file.modified}`;
      const accept=!hasWorkingFile()||confirm(`새로운 ${categories[file.category].label} 파일이 확인되었습니다.\n\n${file.name}\n\n기존 작업을 초기화하고 발췌 내용을 불러오시겠습니까?`);
      localStorage.setItem(AUTO_SEEN_KEY,marker);await bridge().setConfig("pending_export","");
      if(accept)await loadSharedFile(file,{closeLibrary:false,source:"auto"});
    }catch(error){console.error("new export check",error);}finally{checkNewExports.busy=false;}
  }
  window.__checkNewRofanExports=checkNewExports;
  /* 화면이 새로 그려지며 들어온 경우에는 focus 도 visibilitychange 도
     안 뜰 수 있다. 그러면 사용자가 화면을 한 번 건드릴 때까지 확인이 미뤄져,
     발췌한 파일을 불러오겠냐는 물음이 한참 뒤에야 나온다.
     그래서 들어오자마자 한 번 직접 확인한다. 브리지가 늦게 붙는 경우를 위해
     짧게 두 번 더 본다. checkNewExports 는 처리한 표시를 남기므로 중복 실행은 무해하다. */
  /* 권한 설정 화면에 다녀오면 목록이 달라진다 — 보관함이 열려 있으면 다시 읽는다 */
  addEventListener("focus",()=>setTimeout(()=>{
    try{ const m=$("#logLibraryModal"); if(m && !m.hidden && !state.busy) refreshFiles(); }catch(_){}
  },120));
  addEventListener("focus",()=>setTimeout(checkNewExports,60));
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")setTimeout(checkNewExports,60)});
  addEventListener("ai-log-native-bridge-ready",()=>setTimeout(checkNewExports,0));
  [0,400,1200].forEach(ms=>setTimeout(checkNewExports,ms));

  function boot(){ if(!bridge())return; installUi(); }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();
