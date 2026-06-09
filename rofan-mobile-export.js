/* RofanAi mobile export helper + exporter
 * Add this file next to index.html, then load it from index.html.
 * - On this app page: injects a helper panel into both log-cleaning and full-backup inputs.
 * - On rofan.ai chat pages: exports the whole chat through /api/chat/GetChatLogs.
 */
(function(){
  "use strict";

  var SCRIPT_FILE_NAME = "rofan-mobile-export.js";
  var ROFAN_HOST_RE = /(^|\.)rofan\.ai$/i;

  if (ROFAN_HOST_RE.test(location.hostname)) {
    directRofanExporter();
    return;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installAppHelper);
  } else {
    installAppHelper();
  }

  function installAppHelper(){
    var chatPaste = document.getElementById("chatPaste");
    var inputText = document.getElementById("inputText");
    if (!chatPaste && !inputText) return;

    installAppHelperStyle();

    if (inputText) {
      var classicBox = inputText.closest ? inputText.closest(".editorBox") : null;
      var classicFold = classicBox ? classicBox.querySelector("details.fileExtractFold") : null;
      installOneHelper({
        id: "rofanMobileExportHelperClassic",
        targetBox: classicBox,
        insertAfter: classicFold,
        fallbackBefore: inputText,
        finalStep: "저장된 .rofan.html 또는 .rofan.md 파일을 위의 파일 선택으로 넣습니다."
      });
    }

    if (chatPaste) {
      var chatBox = chatPaste.closest ? chatPaste.closest(".editorBox") : null;
      var chatPicker = chatBox ? chatBox.querySelector(".filePicker") : null;
      installOneHelper({
        id: "rofanMobileExportHelperChat",
        targetBox: chatBox,
        insertAfter: chatPicker,
        fallbackBefore: chatPaste,
        finalStep: "저장된 .rofan.html 또는 .rofan.md 파일을 위의 저장 파일 불러오기로 넣습니다."
      });
    }
  }

  function installOneHelper(opts){
    if (!opts || !opts.targetBox || document.getElementById(opts.id)) return;

    var scriptUrl = getCurrentScriptUrl();
    var directBookmarklet = buildDirectBookmarklet();
    var loaderBookmarklet = buildLoaderBookmarklet(scriptUrl);
    var isLocalFile = /^file:/i.test(scriptUrl);

    var wrap = document.createElement("details");
    wrap.className = "filePicker fileExtractFold rofanMobileExportHelper";
    wrap.id = opts.id;

    var summary = document.createElement("summary");
    summary.innerHTML = "<span>RofanAi 모바일 간편 백업</span><span class=\"fileNameText\">MHT 없이 .rofan.html / .rofan.md 저장</span>";
    wrap.appendChild(summary);

    var body = document.createElement("div");
    body.className = "fileExtractBody rofanMobileExportBody";

    var intro = document.createElement("div");
    intro.className = "hint";
    intro.textContent = "RofanAi 채팅방에서 실행할 즐겨찾기 코드를 만들어 줍니다. 실행하면 전체 로그를 구조 보존 HTML/Markdown으로 저장합니다.";
    body.appendChild(intro);

    if (isLocalFile) {
      var localWarn = document.createElement("div");
      localWarn.className = "emptyState rofanMobileExportWarn";
      localWarn.textContent = "현재 index.html을 로컬 파일로 열어서 짧은 코드 주소가 file://로 만들어졌습니다. GitHub Pages에 올린 뒤 열린 페이지에서 다시 복사하면 모바일에서 사용할 수 있습니다.";
      body.appendChild(localWarn);
    }

    var actions = document.createElement("div");
    actions.className = "optionRow compactControls rofanMobileExportActions";

    var copyDirectBtn = document.createElement("button");
    copyDirectBtn.type = "button";
    copyDirectBtn.className = "btn primary";
    copyDirectBtn.textContent = "공백 없는 코드 복사";
    copyDirectBtn.addEventListener("click", function(){
      copyText(directBookmarklet, "북마클릿 코드를 복사했습니다.");
    });

    var copyLoaderBtn = document.createElement("button");
    copyLoaderBtn.type = "button";
    copyLoaderBtn.className = "btn subtle";
    copyLoaderBtn.textContent = "짧은 코드 복사";
    copyLoaderBtn.addEventListener("click", function(){
      copyText(loaderBookmarklet, "짧은 북마클릿 코드를 복사했습니다.");
    });

    var toggleCodeBtn = document.createElement("button");
    toggleCodeBtn.type = "button";
    toggleCodeBtn.className = "btn subtle";
    toggleCodeBtn.textContent = "코드 보기";
    toggleCodeBtn.addEventListener("click", function(){
      codeBox.hidden = !codeBox.hidden;
      toggleCodeBtn.textContent = codeBox.hidden ? "코드 보기" : "코드 숨기기";
    });

    actions.appendChild(copyDirectBtn);
    actions.appendChild(copyLoaderBtn);
    actions.appendChild(toggleCodeBtn);
    body.appendChild(actions);

    var steps = document.createElement("ol");
    steps.className = "rofanMobileExportSteps";
    [
      "공백 없는 코드 복사 버튼을 누릅니다.",
      "모바일 브라우저에서 즐겨찾기 하나를 만든 뒤, 주소를 복사한 코드로 바꿉니다.",
      "RofanAi 채팅방 페이지를 열고 그 즐겨찾기를 실행합니다.",
      opts.finalStep || "저장된 파일을 불러옵니다."
    ].forEach(function(text){
      var li = document.createElement("li");
      li.textContent = text;
      steps.appendChild(li);
    });
    body.appendChild(steps);

    var mini = document.createElement("div");
    mini.className = "hint rofanMobileExportMini";
    mini.textContent = "완료 화면에서 HTML 저장을 누르면 MHT처럼 구조와 지문/대사 구분을 보존한 파일이 저장됩니다. Markdown 저장은 앱에서 내려받는 .md와 비슷한 구조 보존 형식입니다.";
    body.appendChild(mini);

    var codeBox = document.createElement("pre");
    codeBox.className = "rofanMobileExportCode";
    codeBox.hidden = true;
    codeBox.textContent = directBookmarklet;
    body.appendChild(codeBox);

    wrap.appendChild(body);

    if (opts.insertAfter && opts.insertAfter.parentNode) {
      opts.insertAfter.parentNode.insertBefore(wrap, opts.insertAfter.nextSibling);
    } else if (opts.fallbackBefore && opts.fallbackBefore.parentNode) {
      opts.fallbackBefore.parentNode.insertBefore(wrap, opts.fallbackBefore);
    } else {
      opts.targetBox.appendChild(wrap);
    }
  }

  function installAppHelperStyle(){
    if (document.getElementById("rofanMobileExportHelperStyle")) return;
    var style = document.createElement("style");
    style.id = "rofanMobileExportHelperStyle";
    style.textContent = [
      ".rofanMobileExportHelper{margin-top:8px;margin-bottom:10px;padding:0}",
      ".rofanMobileExportHelper summary{padding:13px 16px}",
      ".rofanMobileExportHelper .rofanMobileExportBody{padding-top:10px}",
      ".rofanMobileExportHelper .rofanMobileExportActions{margin-top:8px;gap:7px}",
      ".rofanMobileExportHelper .rofanMobileExportSteps{margin:8px 0 0;padding-left:20px;color:var(--sub);font-size:12px;line-height:1.62}",
      ".rofanMobileExportHelper .rofanMobileExportMini{margin-top:8px}",
      ".rofanMobileExportHelper .rofanMobileExportCode{margin:8px 0 0;padding:10px;border:1px solid var(--line2);border-radius:12px;background:#fff;color:var(--ink);font-size:11px;line-height:1.55;white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-all;max-height:160px;overflow:auto}",
      ".rofanMobileExportHelper .rofanMobileExportWarn{margin-top:8px}",
      "@media(max-width:640px){.rofanMobileExportHelper{margin-top:6px;margin-bottom:8px}.rofanMobileExportHelper summary{padding:12px 14px}.rofanMobileExportHelper .rofanMobileExportActions .btn{width:100%}.rofanMobileExportHelper .rofanMobileExportSteps{font-size:11.5px;line-height:1.55}}"
    ].join("");
    document.head.appendChild(style);
  }

  function getCurrentScriptUrl(){
    var current = document.currentScript && document.currentScript.src;
    if (current) return stripHash(current);

    var scripts = Array.prototype.slice.call(document.scripts || []);
    for (var i = scripts.length - 1; i >= 0; i--) {
      var src = scripts[i].src || "";
      if (new RegExp(SCRIPT_FILE_NAME.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?:[?#].*)?$").test(src)) {
        return stripHash(src);
      }
    }

    try {
      return new URL(SCRIPT_FILE_NAME, location.href).href;
    } catch (_err) {
      return SCRIPT_FILE_NAME;
    }
  }

  function stripHash(url){
    return String(url || "").replace(/#.*$/, "");
  }

  function buildLoaderBookmarklet(scriptUrl){
    var src = String(scriptUrl || SCRIPT_FILE_NAME);
    var code = "(()=>{var u=" + JSON.stringify(src) + ";u+=(u.indexOf('?')>-1?'&':'?')+'v='+Date.now();var s=document.createElement('script');s.src=u;s.dataset.rofanMobileExporter='1';(document.head||document.documentElement).appendChild(s)})()";
    return "javascript:" + encodeURIComponent(code);
  }

  function buildDirectBookmarklet(){
    var code = "(" + directRofanExporter.toString() + ")();";
    return "javascript:" + encodeURIComponent(code);
  }

  function copyText(text, okMessage){
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function(){
        toast(okMessage || "복사했습니다.");
      }).catch(function(){
        fallbackCopy(text, okMessage);
      });
      return;
    }
    fallbackCopy(text, okMessage);
  }

  function fallbackCopy(text, okMessage){
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "readonly");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    ta.style.top = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand("copy");
      toast(okMessage || "복사했습니다.");
    } catch (_err) {
      window.prompt("아래 내용을 복사해 주세요.", text);
    }
    ta.remove();
  }

  function toast(message){
    if (typeof window.showToast === "function") {
      window.showToast(message);
    } else {
      alert(message);
    }
  }

  async function directRofanExporter(){
    "use strict";

    var ROFAN_HOST_RE = /(^|\.)rofan\.ai$/i;
    if (!ROFAN_HOST_RE.test(location.hostname)) {
      alert("RofanAi 채팅방 페이지에서 실행해 주세요.");
      return;
    }
    if (window.__rofanMobileExporterActive) {
      alert("이미 RofanAi 로그 내보내기를 실행 중입니다.");
      return;
    }
    window.__rofanMobileExporterActive = true;

    var ui = createStatusBox();

    try {
      if (!/\/chat\/[^/?#]+/i.test(location.pathname)) {
        throw new Error("RofanAi 채팅방 페이지에서 실행해 주세요.");
      }

      var pageProps = getPageProps();
      var chatId = getChatId(pageProps);
      if (!chatId) throw new Error("chatId를 찾지 못했습니다.");

      var limit = 20;
      var offset = 0;
      var all = [];
      var seen = new Set();
      var emptyStreak = 0;

      ui.set("로그 수집을 시작합니다.", "chatId: " + chatId);

      while (true) {
        ui.set("로그를 불러오는 중입니다.", "offset " + offset + " / 현재 " + all.length + "개");
        var logs = await fetchLogs(chatId, offset, limit);

        if (!logs.length) emptyStreak += 1;
        else emptyStreak = 0;

        for (var i = 0; i < logs.length; i++) {
          var log = logs[i] || {};
          var key = String(log.log_id || log.pk || "");
          if (!key || seen.has(key)) continue;
          seen.add(key);
          all.push(log);
        }

        ui.set("로그를 불러오는 중입니다.", "offset " + offset + "에서 " + logs.length + "개 / 누적 " + all.length + "개");

        if (logs.length < limit || emptyStreak >= 2) break;

        offset += limit;
        if (offset > 500000) throw new Error("안전 한도에 도달해 중단했습니다.");
        await sleep(120);
      }

      if (!all.length && Array.isArray(pageProps.initialChatLogs)) {
        for (var j = 0; j < pageProps.initialChatLogs.length; j++) {
          var initLog = pageProps.initialChatLogs[j] || {};
          var initKey = String(initLog.log_id || initLog.pk || "");
          if (!initKey || seen.has(initKey)) continue;
          seen.add(initKey);
          all.push(initLog);
        }
      }

      if (!all.length) throw new Error("저장할 로그를 찾지 못했습니다.");

      all.sort(function(a, b){
        var ap = Number(a && a.pk || 0);
        var bp = Number(b && b.pk || 0);
        return ap - bp;
      });

      var title = getTitle(pageProps);
      var items = logsToStructuredItems(all);
      var html = buildStructuredHtml(items, chatId, title, all.length);
      var markdown = buildStructuredMarkdown(items, chatId, title, all.length);
      var baseName = safeFileName(title || "rofan-chat");
      var htmlName = baseName + ".rofan.html";
      var mdName = baseName + ".rofan.md";

      ui.done("완료: " + all.length + "개 로그를 변환했습니다.", "아래 버튼으로 저장해 주세요.", [
        {label:"HTML 저장", primary:true, action:function(){ downloadTextFile(htmlName, html, "text/html;charset=utf-8"); }},
        {label:"Markdown 저장", primary:false, action:function(){ downloadTextFile(mdName, markdown, "text/markdown;charset=utf-8"); }}
      ]);

      if (!isLikelyMobile()) {
        downloadTextFile(htmlName, html, "text/html;charset=utf-8");
      }
    } catch (err) {
      console.error("[rofan-mobile-export]", err);
      ui.fail(err && err.message ? err.message : String(err));
    } finally {
      window.__rofanMobileExporterActive = false;
    }

    function getPageProps(){
      var next = window.__NEXT_DATA__ || {};
      return (
        next.props && next.props.pageProps ||
        next.props && next.props.initialProps && next.props.initialProps.pageProps ||
        next.pageProps ||
        {}
      );
    }

    function getChatId(pageProps){
      var fromPath = (location.pathname.match(/\/chat\/([^/?#]+)/i) || [])[1] || "";
      return (
        pageProps.chatId ||
        pageProps.oriChatData && pageProps.oriChatData.chat_id ||
        pageProps.chatData && pageProps.chatData.chat_id ||
        fromPath
      );
    }

    function getTitle(pageProps){
      var title = (
        pageProps.oriChatData && pageProps.oriChatData.chat_title ||
        pageProps.chatData && pageProps.chatData.chat_title ||
        pageProps.botDetail && (pageProps.botDetail.name || pageProps.botDetail.bot_name || pageProps.botDetail.title) ||
        pageProps.oriBotDetail && (pageProps.oriBotDetail.name || pageProps.oriBotDetail.bot_name || pageProps.oriBotDetail.title) ||
        document.title ||
        "rofan-chat"
      );
      return cleanText(title).replace(/\s*\|\s*로판\s*AI\s*$/i, "").trim() || "rofan-chat";
    }

    async function fetchLogs(chatId, offset, limit){
      var res = await fetch("/api/chat/GetChatLogs", {
        method: "POST",
        credentials: "include",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chatId: chatId,
          offset: offset,
          limit: limit
        })
      });

      if (!res.ok) {
        throw new Error("GetChatLogs 요청 실패: HTTP " + res.status);
      }

      var data = await res.json();
      if (!Array.isArray(data)) {
        throw new Error("GetChatLogs 응답 형식이 배열이 아닙니다.");
      }

      return data;
    }

    function logsToStructuredItems(logs){
      var out = [];
      for (var i = 0; i < logs.length; i++) {
        var log = logs[i] || {};
        var base = safeMeta(log.log_id || log.pk || ("log-" + (i + 1)));
        appendMessage(out, base + "-user", "user", log.user_chat);
        appendMessage(out, base + "-bot", "character", log.bot_chat);
      }
      return out;
    }

    function appendMessage(out, baseBlockId, owner, text){
      var segments = splitRoleplayText(text);
      for (var i = 0; i < segments.length; i++) {
        var seg = segments[i];
        if (!seg || !cleanText(seg.text)) continue;
        out.push({
          blockId: baseBlockId + "-" + String(i + 1).padStart(2, "0"),
          owner: owner,
          kind: seg.kind || "normal",
          text: cleanText(seg.text)
        });
      }
    }

    function splitRoleplayText(value){
      var text = cleanText(value);
      if (!text) return [];
      var paragraphs = text.split(/\n\s*\n+/).map(function(p){ return p.trim(); }).filter(Boolean);
      var out = [];
      for (var i = 0; i < paragraphs.length; i++) {
        var pieces = splitParagraph(paragraphs[i]);
        for (var j = 0; j < pieces.length; j++) {
          if (pieces[j] && cleanText(pieces[j].text)) out.push(pieces[j]);
        }
      }
      return mergeNearbySegments(out);
    }

    function splitParagraph(paragraph){
      var p = cleanText(paragraph);
      if (!p) return [];

      var whole = p.match(/^(\*{1,3}|_{1,3})([\s\S]*?)\1$/);
      if (whole && cleanText(whole[2])) {
        return [{kind:"scene", text:cleanText(whole[2])}];
      }

      var re = /(\*{1,3}|_{1,3})([\s\S]+?)\1/g;
      var out = [];
      var last = 0;
      var match;
      while ((match = re.exec(p))) {
        var before = p.slice(last, match.index).trim();
        var inner = cleanText(match[2]);
        if (before) out.push({kind:"normal", text:before});
        if (inner) out.push({kind:"scene", text:inner});
        last = re.lastIndex;
      }
      var rest = p.slice(last).trim();
      if (rest) out.push({kind:"normal", text:rest});
      return out.length ? out : [{kind:"normal", text:p}];
    }

    function mergeNearbySegments(items){
      var out = [];
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (!item || !cleanText(item.text)) continue;
        var last = out[out.length - 1];
        if (last && last.kind === item.kind) {
          last.text = [last.text, item.text].filter(Boolean).join("\n\n");
        } else {
          out.push({kind:item.kind || "normal", text:cleanText(item.text)});
        }
      }
      return out;
    }

    function buildStructuredMarkdown(items, chatId, title, logCount){
      var parts = [];
      for (var i = 0; i < items.length; i++) {
        var item = items[i] || {};
        var body = cleanText(item.text);
        if (!body) continue;
        parts.push("<!-- rofan:block=" + safeMeta(item.blockId || ("block-" + i)) + ";owner=" + safeMeta(item.owner || "character") + ";kind=" + safeMeta(item.kind || "normal") + " -->\n" + body);
      }

      return [
        "<!-- rofan:export=GetChatLogs;format=structured-markdown;chatId=" + safeMeta(chatId) + ";logCount=" + safeMeta(logCount) + ";itemCount=" + safeMeta(items.length) + ";exportedAt=" + new Date().toISOString() + " -->",
        "# " + cleanText(title || "rofan-chat").replace(/^#\s*/, ""),
        "",
        parts.join("\n\n"),
        ""
      ].join("\n");
    }

    function buildStructuredHtml(items, chatId, title, logCount){
      var blocks = [];
      for (var i = 0; i < items.length; i++) {
        var item = items[i] || {};
        var body = cleanText(item.text);
        if (!body) continue;
        var paragraphs = body.split(/\n+/).map(function(line){ return line.trim(); }).filter(Boolean).map(function(line){
          return "<p>" + escapeHTML(line) + "</p>";
        }).join("\n");
        var owner = item.owner || "character";
        var kind = item.kind || "normal";
        var inlineStyle = blockInlineStyle(owner, kind);
        blocks.push("<div class=\"rofan-block\" data-block-id=\"" + escapeAttr(item.blockId || ("block-" + i)) + "\" data-owner=\"" + escapeAttr(owner) + "\" data-kind=\"" + escapeAttr(kind) + "\" style=\"" + escapeAttr(inlineStyle) + "\">\n" + paragraphs + "\n</div>");
      }

      var safeTitle = cleanText(title || "rofan-chat").replace(/^#\s*/, "");
      return [
        "<!doctype html>",
        "<html lang=\"ko\">",
        "<head>",
        "<meta charset=\"utf-8\">",
        "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">",
        "<title>" + escapeHTML(safeTitle) + "</title>",
        "<meta name=\"rofan-export\" content=\"GetChatLogs\">",
        "<meta name=\"rofan-chat-id\" content=\"" + escapeAttr(chatId) + "\">",
        "<meta name=\"rofan-log-count\" content=\"" + escapeAttr(logCount) + "\">",
        "<style>",
        ":root{color-scheme:light;--ink:#1f2d36;--sub:#496574;--line:#cfe4ee;--paper:#fff;--user:#eef2ff;--bot:#fff8d6;}",
        "body{margin:0;background:#eef7fb;color:var(--ink);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Noto Sans KR',sans-serif;line-height:1.75;}",
        ".rofan-export{max-width:860px;margin:0 auto;padding:22px;}",
        "h1{font-size:22px;line-height:1.35;margin:0 0 18px;}",
        ".rofan-block{margin:0 0 13px;padding:12px 14px;border:1px solid var(--line);border-radius:16px;background:var(--paper);white-space:normal;overflow-wrap:anywhere;}",
        ".rofan-block[data-owner='user']{background:var(--user);margin-left:8%;}",
        ".rofan-block[data-owner='character']{background:var(--bot);margin-right:8%;}",
        ".rofan-block[data-kind='scene']{font-style:italic;color:var(--sub);}",
        ".rofan-block p{margin:.35em 0;}",
        "@media(max-width:640px){.rofan-export{padding:14px}.rofan-block{margin-bottom:10px}.rofan-block[data-owner='user']{margin-left:3%}.rofan-block[data-owner='character']{margin-right:3%}}",
        "</style>",
        "</head>",
        "<body>",
        "<!-- rofan:export=GetChatLogs;format=structured-html;chatId=" + safeMeta(chatId) + ";logCount=" + safeMeta(logCount) + ";itemCount=" + safeMeta(items.length) + ";exportedAt=" + new Date().toISOString() + " -->",
        "<main class=\"rofan-export\">",
        "<h1>" + escapeHTML(safeTitle) + "</h1>",
        blocks.join("\n"),
        "</main>",
        "</body>",
        "</html>",
        ""
      ].join("\n");
    }

    function blockInlineStyle(owner, kind){
      var styles = [
        "margin:0 0 13px",
        "padding:12px 14px",
        "border:1px solid #cfe4ee",
        "border-radius:16px",
        "white-space:normal",
        "overflow-wrap:anywhere",
        "background:#ffffff"
      ];
      if (owner === "user") {
        styles.push("background:#eef2ff", "margin-left:8%");
      } else if (owner === "character") {
        styles.push("background:#fff8d6", "margin-right:8%");
      }
      if (kind === "scene") {
        styles.push("font-style:italic", "color:#496574");
      }
      return styles.join(";");
    }

    function cleanText(value){
      return String(value == null ? "" : value)
        .replace(/\r/g, "")
        .replace(/\u00a0/g, " ")
        .replace(/\u200b/g, "")
        .trim();
    }

    function safeMeta(value){
      return cleanText(value)
        .replace(/-->/g, "--＞")
        .replace(/[;\n\r>]/g, "_");
    }

    function safeFileName(value){
      return cleanText(value)
        .replace(/[\\/:*?"<>|]+/g, "_")
        .replace(/\s+/g, " ")
        .slice(0, 80) || "rofan-chat";
    }

    function escapeHTML(value){
      return String(value == null ? "" : value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function escapeAttr(value){
      return escapeHTML(value).replace(/`/g, "&#096;");
    }

    function downloadTextFile(fileName, text, mime){
      var blob = new Blob([text], { type: mime || "text/plain;charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      setTimeout(function(){
        URL.revokeObjectURL(url);
        a.remove();
      }, 1500);
    }

    function sleep(ms){
      return new Promise(function(resolve){ setTimeout(resolve, ms); });
    }

    function isLikelyMobile(){
      return /Android|iPhone|iPad|iPod|Mobile|SamsungBrowser/i.test(navigator.userAgent || "");
    }

    function createStatusBox(){
      var old = document.getElementById("rofanMobileExporterStatus");
      if (old) old.remove();

      var box = document.createElement("div");
      box.id = "rofanMobileExporterStatus";
      box.style.cssText = [
        "position:fixed",
        "left:12px",
        "right:12px",
        "bottom:12px",
        "z-index:2147483647",
        "padding:14px",
        "border-radius:16px",
        "background:#ffffff",
        "color:#1f2d36",
        "box-shadow:0 10px 36px rgba(0,0,0,.22)",
        "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
        "font-size:14px",
        "line-height:1.55",
        "word-break:keep-all"
      ].join(";");

      var title = document.createElement("div");
      title.style.cssText = "font-weight:800;margin-bottom:4px";
      title.textContent = "RofanAi 로그 내보내기";

      var main = document.createElement("div");
      main.textContent = "준비 중입니다.";

      var sub = document.createElement("div");
      sub.style.cssText = "margin-top:4px;color:#496574;font-size:12px";

      var actions = document.createElement("div");
      actions.style.cssText = "display:flex;gap:8px;flex-wrap:wrap;margin-top:10px";

      var closeBtn = document.createElement("button");
      closeBtn.type = "button";
      closeBtn.textContent = "닫기";
      closeBtn.style.cssText = buttonCss(false);
      closeBtn.addEventListener("click", function(){ box.remove(); });

      actions.appendChild(closeBtn);
      box.appendChild(title);
      box.appendChild(main);
      box.appendChild(sub);
      box.appendChild(actions);
      document.body.appendChild(box);

      return {
        set: function(message, detail){
          main.textContent = message || "";
          sub.textContent = detail || "";
        },
        done: function(message, detail, buttons){
          main.textContent = message || "완료했습니다.";
          sub.textContent = detail || "아래 버튼으로 저장해 주세요.";
          if (Array.isArray(buttons)) {
            buttons.forEach(function(btn){
              var b = document.createElement("button");
              b.type = "button";
              b.textContent = btn.label || "저장";
              b.style.cssText = buttonCss(!!btn.primary);
              b.addEventListener("click", function(){ if (typeof btn.action === "function") btn.action(); });
              actions.insertBefore(b, closeBtn);
            });
          }
        },
        fail: function(message){
          main.textContent = "실패했습니다.";
          sub.textContent = message || "";
        }
      };
    }

    function buttonCss(primary){
      return [
        "border:0",
        "border-radius:12px",
        "padding:8px 12px",
        "font-weight:800",
        "background:" + (primary ? "#4f8aa4" : "#eef7fb"),
        "color:" + (primary ? "#fff" : "#1f2d36")
      ].join(";");
    }
  }
})();
