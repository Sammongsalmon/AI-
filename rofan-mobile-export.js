/* RofanAi mobile export helper + exporter
 * Add this file next to index.html, then load it from index.html.
 * - On this app page: injects small helper panels in "로그 다듬기" and "채팅방 전체 백업".
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
    document.addEventListener("DOMContentLoaded", installAppHelpers);
  } else {
    installAppHelpers();
  }

  function installAppHelpers(){
    installAppHelperStyle();
    installClassicHelper();
    installChatHelper();
  }

  function installClassicHelper(){
    var input = document.getElementById("inputText");
    if (!input) return;
    var editorBox = input.closest ? input.closest(".editorBox") : null;
    if (!editorBox) return;
    var fileFold = editorBox.querySelector("details.filePicker, .filePicker");
    var panel = createHelperPanel({
      id: "rofanMobileExportHelperClassic",
      title: "RofanAi 모바일 간편 백업",
      subtitle: "MHT 없이 .rofan.html 저장",
      intro: "RofanAi 채팅방에서 실행할 북마클릿 코드를 복사합니다. 전체 로그를 우리 앱이 읽을 수 있는 구조 보존 .rofan.html로 저장합니다.",
      finalStep: "저장된 .rofan.html 파일을 위의 파일에서 발췌로 불러오거나 원본 로그에 붙여넣습니다."
    });
    if (fileFold) fileFold.classList.add("rofanMobileExportBefore");
    if (fileFold && fileFold.nextSibling) editorBox.insertBefore(panel, fileFold.nextSibling);
    else editorBox.insertBefore(panel, input);
  }

  function installChatHelper(){
    var chatPaste = document.getElementById("chatPaste");
    if (!chatPaste) return;
    var editorBox = chatPaste.closest ? chatPaste.closest(".editorBox") : null;
    if (!editorBox) return;
    var filePicker = editorBox.querySelector(".filePicker");
    var panel = createHelperPanel({
      id: "rofanMobileExportHelperChat",
      title: "RofanAi 모바일 간편 백업",
      subtitle: "MHT 없이 .rofan.html 저장",
      intro: "RofanAi 채팅방에서 실행할 북마클릿 코드를 복사합니다. 실행하면 전체 로그를 우리 앱이 읽을 수 있는 구조 보존 .rofan.html로 저장합니다.",
      finalStep: "저장된 .rofan.html 파일을 위의 저장 파일 불러오기로 넣습니다."
    });
    if (filePicker) filePicker.classList.add("rofanMobileExportBefore");
    if (filePicker && filePicker.nextSibling) editorBox.insertBefore(panel, filePicker.nextSibling);
    else editorBox.insertBefore(panel, chatPaste);
  }

  function createHelperPanel(options){
    var old = document.getElementById(options.id);
    if (old) old.remove();

    var directBookmarklet = buildDirectBookmarklet(false);
    var encodedBookmarklet = buildDirectBookmarklet(true);
    var loaderBookmarklet = buildLoaderBookmarklet(getCurrentScriptUrl());

    var wrap = document.createElement("details");
    wrap.className = "filePicker fileExtractFold rofanMobileExportHelper";
    wrap.id = options.id;

    var summary = document.createElement("summary");
    summary.innerHTML = "<span>" + escapeHTML(options.title) + "</span><span class=\"fileNameText\">" + escapeHTML(options.subtitle) + "</span>";
    wrap.appendChild(summary);

    var body = document.createElement("div");
    body.className = "fileExtractBody rofanMobileExportBody";

    var intro = document.createElement("div");
    intro.className = "hint rofanMobileExportIntro";
    intro.textContent = options.intro;
    body.appendChild(intro);


    var actions = document.createElement("div");
    actions.className = "optionRow compactControls rofanMobileExportActions";

    var copyDirectBtn = document.createElement("button");
    copyDirectBtn.type = "button";
    copyDirectBtn.className = "btn primary";
    copyDirectBtn.textContent = "북마클릿 코드 복사";
    copyDirectBtn.addEventListener("click", function(){
      copyText(directBookmarklet, "북마클릿 코드를 복사했습니다.");
    });

    var copyEncodedBtn = document.createElement("button");
    copyEncodedBtn.type = "button";
    copyEncodedBtn.className = "btn subtle";
    copyEncodedBtn.textContent = "인코딩 코드 복사";
    copyEncodedBtn.addEventListener("click", function(){
      copyText(encodedBookmarklet, "인코딩된 직접 실행 코드를 복사했습니다.");
    });

    var toggleCodeBtn = document.createElement("button");
    toggleCodeBtn.type = "button";
    toggleCodeBtn.className = "btn subtle";
    toggleCodeBtn.textContent = "코드 보기";
    toggleCodeBtn.addEventListener("click", function(){
      codeBox.hidden = !codeBox.hidden;
      toggleCodeBtn.textContent = codeBox.hidden ? "코드 보기" : "코드 숨기기";
    });

    var copyLoaderBtn = document.createElement("button");
    copyLoaderBtn.type = "button";
    copyLoaderBtn.className = "btn subtle rofanMobileExportAdvanced";
    copyLoaderBtn.textContent = "짧은 로더 복사";
    copyLoaderBtn.addEventListener("click", function(){
      copyText(loaderBookmarklet, "짧은 로더 코드를 복사했습니다. 직접 코드가 너무 길 때만 써 보세요.");
    });

    actions.appendChild(copyDirectBtn);
    actions.appendChild(copyEncodedBtn);
    actions.appendChild(toggleCodeBtn);
    actions.appendChild(copyLoaderBtn);
    body.appendChild(actions);

    var steps = document.createElement("ol");
    steps.className = "rofanMobileExportSteps";
    [
      "북마클릿 코드 복사 버튼을 누릅니다. 주소칸에 끝까지 안 붙으면 인코딩 코드 복사나 짧은 로더 복사를 사용합니다.",
      "모바일 브라우저에서 즐겨찾기 하나를 만든 뒤, 주소를 복사한 코드로 바꿉니다. 제목은 로판백업처럼 짧게 저장하면 편합니다.",
      "모바일에서는 RofanAi 채팅방을 열어 둔 상태로 주소창/검색창에 즐겨찾기 이름을 검색하고, 검색 결과에 뜬 즐겨찾기를 선택해 실행합니다.",
      "실행되면 화면 아래에 Rofan_export_start 또는 loading_offset 문구가 떠야 합니다.",
      options.finalStep
    ].forEach(function(text){
      var li = document.createElement("li");
      li.textContent = text;
      steps.appendChild(li);
    });
    body.appendChild(steps);

    var codeBox = document.createElement("pre");
    codeBox.className = "rofanMobileExportCode";
    codeBox.hidden = true;
    codeBox.textContent = directBookmarklet;
    body.appendChild(codeBox);


    wrap.appendChild(body);
    return wrap;
  }

  function installAppHelperStyle(){
    if (document.getElementById("rofanMobileExportHelperStyle")) return;
    var style = document.createElement("style");
    style.id = "rofanMobileExportHelperStyle";
    style.textContent = [
      ".filePicker.rofanMobileExportBefore{margin-bottom:0!important;border-bottom-left-radius:0!important;border-bottom-right-radius:0!important}",
      ".filePicker.rofanMobileExportBefore+.rofanMobileExportHelper{margin-top:-1px!important;border-top-left-radius:0!important;border-top-right-radius:0!important}",
      ".rofanMobileExportHelper{margin-top:0;margin-bottom:10px;padding:0}",
      ".rofanMobileExportHelper summary{padding:13px 16px}",
      ".rofanMobileExportHelper .fileExtractBody{padding:0 16px 14px}",
      ".rofanMobileExportIntro{margin-top:10px}",
      ".rofanMobileExportHelper .rofanMobileExportActions{margin-top:10px;gap:7px}",
      ".rofanMobileExportHelper .rofanMobileExportActions .btn{min-height:34px;padding:7px 11px;border-radius:11px;font-size:12px}",
      ".rofanMobileExportHelper .rofanMobileExportSteps{margin:10px 0 0;padding-left:18px;color:var(--sub);font-size:12px;line-height:1.62}",
      ".rofanMobileExportHelper .rofanMobileExportSteps li{margin:2px 0}",
      ".rofanMobileExportHelper .rofanMobileExportCode{margin:10px 0 0;padding:10px;border:1px solid var(--line2);border-radius:12px;background:#fff;color:var(--ink);font-size:11px;line-height:1.45;white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-all;max-height:150px;overflow:auto}",
      "@media(max-width:640px){.rofanMobileExportHelper{margin-top:0;margin-bottom:8px}.rofanMobileExportHelper summary{padding:12px 14px}.rofanMobileExportHelper .fileExtractBody{padding:0 14px 12px}.rofanMobileExportHelper .rofanMobileExportActions .btn{width:100%}}"
    ].join("");
    document.head.appendChild(style);
  }

  function buildDirectBookmarklet(encoded){
    var code = "(async()=>{try{if(!/(^|[.])rofan[.]ai$/i.test(location.hostname)||location.pathname.indexOf('/chat/')<0)throw'open_rofan_chat';Z=document.createElement('div');Z.style='position:fixed;left:8px;right:8px;bottom:8px;z-index:2147483647;padding:12px;border-radius:12px;background:#fff;color:#111;font:14px sans-serif;line-height:1.5';Z.textContent='Rofan_export_start';document.body.appendChild(Z);P=(window.__NEXT_DATA__&&window.__NEXT_DATA__.props&&window.__NEXT_DATA__.props.pageProps)||{};N=String.fromCharCode;C=v=>String(v==null?'':v).split(N(13)).join('').split(N(160)).join(' ').trim();E=v=>C(v).replace(/[&<>\"]/g,c=>c=='&'?'&amp;':c=='<'?'&lt;':c=='>'?'&gt;':'&quot;');M=v=>C(v).split('-->').join('--＞').replace(/[;\"<>]/g,'_').split(N(10)).join('_').split(N(13)).join('_');id=P.chatId||(P.oriChatData&&P.oriChatData.chat_id)||(P.chatData&&P.chatData.chat_id)||location.pathname.split('/').filter(Boolean).pop();if(!id)throw'no_chatId';T=C((P.oriChatData&&P.oriChatData.chat_title)||(P.chatData&&P.chatData.chat_title)||document.title||'rofan-chat')||'rofan-chat';T=T.replace(/ *[|] *로판 *AI *$/i,'');Q=T.split(/ +x +/i);BN=o=>o&&(o.name||o.bot_name||o.character_name);UN=o=>o&&(o.name||o.nickname||o.character_name);CH=C((P.oriChatData&&P.oriChatData.char)||(P.chatData&&P.chatData.char)||BN(P.botDetail)||BN(P.oriBotDetail)||BN(P.botData)||BN(P.oriBotData)||Q[0]||'캐릭터');US=C((P.oriChatData&&P.oriChatData.user)||(P.chatData&&P.chatData.user)||UN(P.userCharacter)||UN(P.oriUserCharacter)||UN(P.chatUser)||UN(P.userDetail)||UN(P.user)||UN(P.me)||Q[1]||'유저');FM=C((P.oriBotDetail&&P.oriBotDetail.first_message)||(P.botDetail&&P.botDetail.first_message)||(P.oriBotData&&P.oriBotData.first_message)||(P.botData&&P.botData.first_message)||'').split('{{char}}').join(CH).split('{{user}}').join(US);L=50;A=[];S={};for(o=0;;o+=L){Z.textContent='loading_offset_'+o+'_saved_'+A.length;r=await fetch('/api/chat/GetChatLogs',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({chatId:id,offset:o,limit:L})});if(!r.ok)throw'HTTP_'+r.status;d=await r.json();if(!Array.isArray(d))throw'bad_response';for(i=0;i<d.length;i++){x=d[i];k=x.log_id||x.pk;if(k&&!S[k]){S[k]=1;A.push(x)}}if(d.length<L)break;await new Promise(v=>setTimeout(v,120))}if(!A.length&&Array.isArray(P.initialChatLogs))A=P.initialChatLogs;A.sort((a,b)=>Number(a.pk||0)-Number(b.pk||0));H=[];B=(bid,ow,ki,tx,em)=>{tx=C(tx);if(!tx)return;R=tx.split(N(10)).map(C).filter(Boolean).map(y=>'<p>'+(em?'<em>'+E(y)+'</em>':E(y))+'</p>').join('');if(R)H.push('<div class=rofan-block data-block-id=\"'+E(bid)+'\" data-owner=\"'+ow+'\" data-kind=\"'+ki+'\">'+R+'</div>')};F=(tx,ow,b)=>{tx=C(tx);if(!tx)return;re=/([*][*][^]+?[*][*]|[*][^]+?[*])/g;n=0;last=0;while(m=re.exec(tx)){if(m.index>last)B(b+'-'+n++,ow,'normal',tx.slice(last,m.index),0);B(b+'-'+n++,ow,'scene',m[0].replace(/^[*]+|[*]+$/g,''),1);last=re.lastIndex}if(last<tx.length)B(b+'-'+n++,ow,'normal',tx.slice(last),0)};if(FM&&C(FM)!=C(A[0]&&A[0].bot_chat))F(FM,'character','first-message');for(i=0;i<A.length;i++){x=A[i];b=M(x.log_id||x.pk||i);F(x.user_chat,'user',b+'-user');F(x.bot_chat,'character',b+'-bot')}HTML='<!doctype html><meta charset=utf-8><title>'+E(T)+'</title><main data-rofan-export=GetChatLogs data-chat-id=\"'+E(id)+'\"><h1>'+E(T)+'</h1>'+H.join('')+'</main>';a=document.createElement('a');a.href=URL.createObjectURL(new Blob([HTML],{type:'text/html;charset=utf-8'}));a.download=(T.replace(/[\/:*?\"<>|]+/g,'_').replace(/ +/g,'_').slice(0,80)||'rofan-chat')+'.rofan.html';document.body.appendChild(a);a.click();Z.textContent='done_'+A.length}catch(e){alert('Rofan_export_fail:'+(e.message||e));console.error(e)}})()";
    return "javascript:" + (encoded ? encodeURIComponent(code) : code);
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
    var code = "(u=>{u+=(u.includes('?')?'&':'?')+'v='+Date.now();s=document.createElement('script');s.src=u;s.dataset.rofanMobileExporter='1';(document.head||document.documentElement).appendChild(s)})(" + JSON.stringify(src) + ")";
    return "javascript:" + code.replace(/\s+/g, "");
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

  function escapeHTML(value){
    return String(value == null ? "" : value).replace(/[&<>"]/g, function(ch){
      return ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[ch];
    });
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
      var seen = {};
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
          if (!key || seen[key]) continue;
          seen[key] = true;
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
          if (!initKey || seen[initKey]) continue;
          seen[initKey] = true;
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
      var characterName = getRofanCharacterName(pageProps, title);
      var userCharacterName = getRofanUserCharacterName(pageProps, title);
      var firstMessage = resolveRofanTemplateVars(getRofanFirstMessage(pageProps), characterName, userCharacterName);
      var html = buildStructuredHTML(all, title, chatId, firstMessage);
      var fileName = safeFileName(title || "rofan-chat") + ".rofan.html";

      downloadTextFile(fileName, html);

      ui.done("완료: " + all.length + "개 로그를 저장했습니다.", function(){
        downloadTextFile(fileName, html);
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

  function getRofanFirstMessage(pageProps){
    return cleanText(
      pageProps.oriBotDetail && pageProps.oriBotDetail.first_message ||
      pageProps.botDetail && pageProps.botDetail.first_message ||
      pageProps.oriBotData && pageProps.oriBotData.first_message ||
      pageProps.botData && pageProps.botData.first_message ||
      ""
    );
  }

  function getRofanCharacterName(pageProps, title){
    var fromTitle = splitRofanTitleNames(title).character;
    return cleanText(
      pageProps.oriChatData && pageProps.oriChatData.char ||
      pageProps.chatData && pageProps.chatData.char ||
      pageProps.botDetail && (pageProps.botDetail.name || pageProps.botDetail.bot_name || pageProps.botDetail.character_name) ||
      pageProps.oriBotDetail && (pageProps.oriBotDetail.name || pageProps.oriBotDetail.bot_name || pageProps.oriBotDetail.character_name) ||
      pageProps.botData && (pageProps.botData.name || pageProps.botData.bot_name || pageProps.botData.character_name) ||
      pageProps.oriBotData && (pageProps.oriBotData.name || pageProps.oriBotData.bot_name || pageProps.oriBotData.character_name) ||
      pageProps.bot && (pageProps.bot.name || pageProps.bot.bot_name || pageProps.bot.character_name) ||
      fromTitle
    );
  }

  function getRofanUserCharacterName(pageProps, title){
    var fromTitle = splitRofanTitleNames(title).user;
    return cleanText(
      pageProps.oriChatData && pageProps.oriChatData.user ||
      pageProps.chatData && pageProps.chatData.user ||
      pageProps.userCharacter && (pageProps.userCharacter.name || pageProps.userCharacter.nickname || pageProps.userCharacter.character_name) ||
      pageProps.oriUserCharacter && (pageProps.oriUserCharacter.name || pageProps.oriUserCharacter.nickname || pageProps.oriUserCharacter.character_name) ||
      pageProps.chatUser && (pageProps.chatUser.name || pageProps.chatUser.nickname || pageProps.chatUser.character_name) ||
      pageProps.userDetail && (pageProps.userDetail.name || pageProps.userDetail.nickname || pageProps.userDetail.character_name) ||
      pageProps.user && (pageProps.user.name || pageProps.user.nickname || pageProps.user.character_name) ||
      pageProps.me && (pageProps.me.name || pageProps.me.nickname || pageProps.me.character_name) ||
      fromTitle
    );
  }

  function splitRofanTitleNames(title){
    var base = cleanText(title).replace(/\s*\|\s*로판\s*AI\s*$/i, "");
    var parts = base.split(/\s+(?:x|×)\s+/i);
    if (parts.length < 2) parts = base.split(/\s*[x×]\s*/i);
    return {
      character: cleanText(parts[0] || ""),
      user: cleanText(parts.length > 1 ? parts.slice(1).join(" x ") : "")
    };
  }

  function resolveRofanTemplateVars(text, characterName, userCharacterName){
    var resolved = cleanText(text);
    if (!resolved) return "";
    var charValue = cleanText(characterName);
    var userValue = cleanText(userCharacterName);
    if (charValue) resolved = resolved.replace(/\{\{\s*char\s*\}\}/gi, charValue);
    if (userValue) resolved = resolved.replace(/\{\{\s*user\s*\}\}/gi, userValue);
    return resolved;
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

  function buildStructuredMarkdown(logs){
    var parts = [];
    for (var i = 0; i < logs.length; i++) {
      var log = logs[i] || {};
      var blockBase = safeMeta(log.log_id || log.pk || ("log-" + (i + 1)));

      var userText = cleanText(log.user_chat);
      var botText = cleanText(log.bot_chat);

      if (userText) {
        parts.push("<!--rofan:block=" + blockBase + "-user;owner=user;kind=dialogue-->\n" + userText);
      }

      if (botText) {
        parts.push("<!--rofan:block=" + blockBase + "-bot;owner=character;kind=normal-->\n" + botText);
      }
    }

    return parts.join("\n\n") + "\n";
  }


  function buildStructuredHTML(logs, title, chatId, firstMessage){
    var parts = [];
    var firstText = cleanText(firstMessage);
    var firstBotText = logs && logs.length ? cleanText(logs[0] && logs[0].bot_chat) : "";
    if (firstText && firstText !== firstBotText) {
      pushHtmlSegments(parts, firstText, "character", "first-message", "normal");
    }
    for (var i = 0; i < logs.length; i++) {
      var log = logs[i] || {};
      var blockBase = safeMeta(log.log_id || log.pk || ("log-" + (i + 1)));
      pushHtmlSegments(parts, log.user_chat, "user", blockBase + "-user", "normal");
      pushHtmlSegments(parts, log.bot_chat, "character", blockBase + "-bot", "normal");
    }
    var safeTitle = escapeHTML(title || "rofan-chat");
    return "<html><head><meta charset=\"utf-8\"><title>" + safeTitle + "</title>" +
      "<style>body{font-family:sans-serif;line-height:1.8;word-break:keep-all;overflow-wrap:break-word}.rofan-block{margin-bottom:1em}.rofan-block[data-owner=user]{color:#818CF8}.rofan-block[data-owner=character]{color:#111}.rofan-block[data-kind=scene]{font-style:italic;color:#555}p{margin-bottom:.85em}</style>" +
      "</head><body><main data-rofan-export=\"GetChatLogs\" data-chat-id=\"" + escapeHTML(chatId || "") + "\"><h1>" + safeTitle + "</h1>" +
      parts.join("") + "</main></body></html>";
  }

  function pushHtmlSegments(parts, value, owner, blockBase, defaultKind){
    var text = cleanText(value);
    if (!text) return;
    var re = /(\*\*[\s\S]+?\*\*|\*[\s\S]+?\*)/g;
    var last = 0;
    var seq = 0;
    var match;
    while ((match = re.exec(text))) {
      if (match.index > last) {
        pushHtmlBlock(parts, blockBase + "-" + (seq++), owner, defaultKind || "normal", text.slice(last, match.index), false);
      }
      pushHtmlBlock(parts, blockBase + "-" + (seq++), owner, "scene", match[0].replace(/^\*+|\*+$/g, ""), true);
      last = re.lastIndex;
    }
    if (last < text.length) {
      pushHtmlBlock(parts, blockBase + "-" + (seq++), owner, defaultKind || "normal", text.slice(last), false);
    }
  }

  function pushHtmlBlock(parts, blockId, owner, kind, text, scene){
    var body = cleanText(text);
    if (!body) return;
    var paragraphs = body.split(/\n+/).map(cleanText).filter(Boolean).map(function(line){
      var inner = escapeHTML(line);
      if (scene) inner = "<em>" + inner + "</em>";
      return "<p>" + inner + "</p>";
    }).join("");
    if (!paragraphs) return;
    parts.push("<div class=\"rofan-block\" data-block-id=\"" + escapeHTML(safeMeta(blockId)) + "\" data-owner=\"" + escapeHTML(owner || "character") + "\" data-kind=\"" + escapeHTML(kind || "normal") + "\">" + paragraphs + "</div>");
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
    var blob = new Blob([text], { type: /\.html?$/i.test(fileName || "") ? "text/html;charset=utf-8" : "text/markdown;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.rel = "noopener";
    a.textContent = "다시 다운로드";
    document.body.appendChild(a);
    a.click();
    setTimeout(function(){
      URL.revokeObjectURL(url);
      a.remove();
    }, 60000);
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
