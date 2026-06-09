/* RofanAi mobile export helper + exporter
 * Add this file next to index.html, then load it from index.html.
 * - On this app page: injects a small helper panel in "채팅방 전체 백업".
 * - On rofan.ai chat pages: exports the whole chat through /api/chat/GetChatLogs.
 */
(function(){
  "use strict";

  var SCRIPT_FILE_NAME = "rofan-mobile-export.js";
  var ROFAN_HOST_RE = /(^|\.)rofan\.ai$/i;

  if (ROFAN_HOST_RE.test(location.hostname)) {
    runRofanExporter();
    return;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installAppHelper);
  } else {
    installAppHelper();
  }

  function installAppHelper(){
    if (document.getElementById("rofanMobileExportHelper")) return;

    var chatPaste = document.getElementById("chatPaste");
    if (!chatPaste) return;

    var editorBox = chatPaste.closest ? chatPaste.closest(".editorBox") : null;
    if (!editorBox) return;

    installAppHelperStyle();

    var scriptUrl = getCurrentScriptUrl();
    var bookmarklet = buildLoaderBookmarklet(scriptUrl);
    var isLocalFile = /^file:/i.test(scriptUrl);

    var wrap = document.createElement("details");
    wrap.className = "filePicker fileExtractFold";
    wrap.id = "rofanMobileExportHelper";

    var summary = document.createElement("summary");
    summary.innerHTML = "<span>RofanAi 모바일 간편 백업</span><span class=\"fileNameText\">MHT 없이 .rofan.md 저장</span>";
    wrap.appendChild(summary);

    var body = document.createElement("div");
    body.className = "fileExtractBody rofanMobileExportBody";

    var intro = document.createElement("div");
    intro.className = "hint";
    intro.textContent = "RofanAi 채팅방에서 실행할 북마클릿을 만들어 줍니다. 실행하면 /api/chat/GetChatLogs를 offset 순서로 불러와 .rofan.md 파일로 저장합니다.";
    body.appendChild(intro);

    if (isLocalFile) {
      var localWarn = document.createElement("div");
      localWarn.className = "emptyState rofanMobileExportWarn";
      localWarn.textContent = "현재 index.html을 로컬 파일로 열어서 북마클릿 주소가 file://로 만들어졌습니다. GitHub Pages에 올린 뒤 열린 페이지에서 다시 복사하면 모바일에서 사용할 수 있습니다.";
      body.appendChild(localWarn);
    }

    var actions = document.createElement("div");
    actions.className = "optionRow compactControls rofanMobileExportActions";

    var copyBookmarkletBtn = document.createElement("button");
    copyBookmarkletBtn.type = "button";
    copyBookmarkletBtn.className = "btn primary";
    copyBookmarkletBtn.textContent = "북마클릿 코드 복사";
    copyBookmarkletBtn.addEventListener("click", function(){
      copyText(bookmarklet, "북마클릿 코드를 복사했습니다.");
    });

    var copyScriptUrlBtn = document.createElement("button");
    copyScriptUrlBtn.type = "button";
    copyScriptUrlBtn.className = "btn subtle";
    copyScriptUrlBtn.textContent = "스크립트 주소 복사";
    copyScriptUrlBtn.addEventListener("click", function(){
      copyText(scriptUrl, "스크립트 주소를 복사했습니다.");
    });

    var toggleCodeBtn = document.createElement("button");
    toggleCodeBtn.type = "button";
    toggleCodeBtn.className = "btn subtle";
    toggleCodeBtn.textContent = "코드 보기";
    toggleCodeBtn.addEventListener("click", function(){
      codeBox.hidden = !codeBox.hidden;
      toggleCodeBtn.textContent = codeBox.hidden ? "코드 보기" : "코드 숨기기";
    });

    actions.appendChild(copyBookmarkletBtn);
    actions.appendChild(copyScriptUrlBtn);
    actions.appendChild(toggleCodeBtn);
    body.appendChild(actions);

    var steps = document.createElement("ol");
    steps.className = "rofanMobileExportSteps";
    [
      "북마클릿 코드 복사 버튼을 누릅니다.",
      "모바일 브라우저에서 즐겨찾기 하나를 만든 뒤, 주소를 복사한 코드로 바꿉니다.",
      "RofanAi 채팅방 페이지를 열고 그 즐겨찾기를 실행합니다.",
      "저장된 .rofan.md 파일을 위의 저장 파일 불러오기로 넣습니다."
    ].forEach(function(text){
      var li = document.createElement("li");
      li.textContent = text;
      steps.appendChild(li);
    });
    body.appendChild(steps);

    var codeBox = document.createElement("pre");
    codeBox.className = "rofanMobileExportCode";
    codeBox.hidden = true;
    codeBox.textContent = bookmarklet;
    body.appendChild(codeBox);

    var note = document.createElement("div");
    note.className = "hint";
    note.textContent = "북마클릿은 RofanAi에 로그인된 같은 브라우저에서 실행해야 합니다. GitHub Pages 쪽에서 URL만 붙여넣어 직접 불러오는 방식은 CORS 때문에 막힐 수 있어 이 방식을 씁니다.";
    body.appendChild(note);

    wrap.appendChild(body);

    var firstPicker = editorBox.querySelector(".filePicker");
    if (firstPicker && firstPicker.nextSibling) {
      editorBox.insertBefore(wrap, firstPicker.nextSibling);
    } else {
      editorBox.insertBefore(wrap, chatPaste);
    }
  }

  function installAppHelperStyle(){
    if (document.getElementById("rofanMobileExportHelperStyle")) return;
    var style = document.createElement("style");
    style.id = "rofanMobileExportHelperStyle";
    style.textContent = [
      "#rofanMobileExportHelper{margin-top:12px}",
      "#rofanMobileExportHelper .rofanMobileExportActions{margin-top:10px}",
      "#rofanMobileExportHelper .rofanMobileExportSteps{margin:10px 0 0;padding-left:20px;color:var(--sub);font-size:12px;line-height:1.7}",
      "#rofanMobileExportHelper .rofanMobileExportCode{margin:10px 0 0;padding:10px;border:1px solid var(--line2);border-radius:12px;background:#fff;color:var(--ink);font-size:11px;line-height:1.55;white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-all;max-height:160px;overflow:auto}",
      "#rofanMobileExportHelper .rofanMobileExportWarn{margin-top:10px}",
      "@media(max-width:640px){#rofanMobileExportHelper .rofanMobileExportActions .btn{width:100%}}"
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
    var code =
      "(function(){var u=" + JSON.stringify(src) + ";u+=(u.indexOf('?')>-1?'&':'?')+'v='+Date.now();var s=document.createElement('script');s.src=u;s.dataset.rofanMobileExporter='1';(document.head||document.documentElement).appendChild(s);})();";
    return "javascript:" + code;
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

  async function runRofanExporter(){
    if (window.__rofanMobileExporterActive) {
      alert("이미 RofanAi 로그 내보내기를 실행 중입니다.");
      return;
    }
    window.__rofanMobileExporterActive = true;

    var ui = createRofanStatusBox();

    try {
      if (!/\/chat\/[^/?#]+/i.test(location.pathname)) {
        throw new Error("RofanAi 채팅방 페이지에서 실행해 주세요.");
      }

      var pageProps = getRofanPageProps();
      var chatId = getRofanChatId(pageProps);
      if (!chatId) throw new Error("chatId를 찾지 못했습니다.");

      var limit = 20;
      var offset = 0;
      var all = [];
      var seen = new Set();
      var emptyStreak = 0;

      ui.set("로그 수집을 시작합니다.", "chatId: " + chatId);

      while (true) {
        ui.set("로그를 불러오는 중입니다.", "offset " + offset + " / 현재 " + all.length + "개");
        var logs = await fetchRofanLogs(chatId, offset, limit);

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

      var title = getRofanTitle(pageProps);
      var markdown = buildStructuredMarkdown(all, chatId, title);
      var fileName = safeFileName(title || "rofan-chat") + ".rofan.md";

      downloadTextFile(fileName, markdown);

      ui.done("완료: " + all.length + "개 로그를 저장했습니다.", function(){
        downloadTextFile(fileName, markdown);
      });
    } catch (err) {
      console.error("[rofan-mobile-export]", err);
      ui.fail(err && err.message ? err.message : String(err));
    } finally {
      window.__rofanMobileExporterActive = false;
    }
  }

  function getRofanPageProps(){
    var next = window.__NEXT_DATA__ || {};
    return (
      next.props && next.props.pageProps ||
      next.props && next.props.initialProps && next.props.initialProps.pageProps ||
      next.pageProps ||
      {}
    );
  }

  function getRofanChatId(pageProps){
    var fromPath = (location.pathname.match(/\/chat\/([^/?#]+)/i) || [])[1] || "";
    return (
      pageProps.chatId ||
      pageProps.oriChatData && pageProps.oriChatData.chat_id ||
      pageProps.chatData && pageProps.chatData.chat_id ||
      fromPath
    );
  }

  function getRofanTitle(pageProps){
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

  async function fetchRofanLogs(chatId, offset, limit){
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

  function buildStructuredMarkdown(logs, chatId, title){
    var parts = [];
    for (var i = 0; i < logs.length; i++) {
      var log = logs[i] || {};
      var blockBase = safeMeta(log.log_id || log.pk || ("log-" + (i + 1)));

      var userText = cleanText(log.user_chat);
      var botText = cleanText(log.bot_chat);

      if (userText) {
        parts.push("<!-- rofan:block=" + blockBase + "-user;owner=user;kind=dialogue -->\n" + userText);
      }

      if (botText) {
        parts.push("<!-- rofan:block=" + blockBase + "-bot;owner=character;kind=normal -->\n" + botText);
      }
    }

    return [
      "<!-- rofan:export=GetChatLogs;chatId=" + safeMeta(chatId) + ";count=" + logs.length + ";exportedAt=" + new Date().toISOString() + " -->",
      "# " + cleanText(title || "rofan-chat").replace(/^#\s*/, ""),
      "",
      parts.join("\n\n"),
      ""
    ].join("\n");
  }

  function cleanText(value){
    return String(value == null ? "" : value)
      .replace(/\r/g, "")
      .replace(/\u00a0/g, " ")
      .trim();
  }

  function safeMeta(value){
    return cleanText(value)
      .replace(/-->/g, "--＞")
      .replace(/[;\n\r]/g, "_");
  }

  function safeFileName(value){
    return cleanText(value)
      .replace(/[\\/:*?"<>|]+/g, "_")
      .replace(/\s+/g, " ")
      .slice(0, 80) || "rofan-chat";
  }

  function downloadTextFile(fileName, text){
    var blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
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

  function createRofanStatusBox(){
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
      done: function(message, downloadAgain){
        main.textContent = message || "완료했습니다.";
        sub.textContent = "다운로드가 보이지 않으면 아래 버튼을 다시 눌러 주세요.";
        var retry = document.createElement("button");
        retry.type = "button";
        retry.textContent = "다시 다운로드";
        retry.style.cssText = buttonCss(true);
        retry.addEventListener("click", function(){
          if (typeof downloadAgain === "function") downloadAgain();
        });
        actions.insertBefore(retry, closeBtn);
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
})();
