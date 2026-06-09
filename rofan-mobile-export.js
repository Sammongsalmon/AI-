/* RofanAi mobile bookmarklet helper
 * Add this file next to index.html, then load it from index.html.
 * The copied bookmarklet runs directly on rofan.ai and saves one structured .rofan.html file.
 */
(function(){
  "use strict";

  var DIRECT_BOOKMARKLET_SOURCE = String.raw`(async(A,S,N,P,I,L,O,E,V,Q,C,Z,M,F,W,Y,G,H,T,R,J,x,k,p,m,b,u,a,D)=>{if(!/(^|\.)rofan\.ai$/i.test(location.hostname))return(alert("RofanAi_chat_page"));if(window.__RME)return(alert("already_running"));window.__RME=1;A=document.createElement("div");A.style.cssText="position:fixed;left:12px;right:12px;bottom:12px;z-index:2147483647;padding:12px;border-radius:14px;background:white;color:black;font-size:14px;font-family:sans-serif;line-height:1.5;box-shadow:0\x208px\x2032px\x20#0004";document.body.appendChild(A);S=x=>A.textContent="RofanAi:"+x;try{if(!/\/chat\/[^/?#]+/i.test(location.pathname))throw(Error("not_chat_page"));N=window.__NEXT_DATA__||{};P=N.props&&N.props.pageProps||N.props&&N.props.initialProps&&N.props.initialProps.pageProps||N.pageProps||{};I=P.chatId||P.oriChatData&&P.oriChatData.chat_id||P.chatData&&P.chatData.chat_id||(location.pathname.match(/\/chat\/([^/?#]+)/i)||[])[1];if(!I)throw(Error("no_chatId"));G=[];V={};Q=x=>{k=String(x&&(x.log_id||x.pk)||"");if(k&&!V[k]){V[k]=1;G.push(x)}};L=20;O=0;E=0;for(;;){S("loading:"+O+"/"+G.length);R=await(fetch("/api/chat/GetChatLogs",{method:"POST",credentials:"include",headers:{Accept:"application/json","Content-Type":"application/json"},body:JSON.stringify({chatId:I,offset:O,limit:L})}));if(!R.ok)throw(Error("HTTP_"+R.status));J=await(R.json());if(!Array.isArray(J))throw(Error("bad_response"));J.length?E=0:E++;J.forEach(Q);if(J.length<L||E>1)break;O+=L;if(O>5e5)throw(Error("too_many_logs"));await(new(Promise)(r=>setTimeout(r,120)))}if(!G.length&&Array.isArray(P.initialChatLogs))P.initialChatLogs.forEach(Q);if(!G.length)throw(Error("no_logs"));G.sort((a,b)=>Number(a&&a.pk||0)-Number(b&&b.pk||0));C=x=>String(x==null?"":x).replace(/\r/g,"").replace(/\u00a0/g,"\x20").replace(/\u200b/g,"").trim();Z=x=>C(x).replace(/[&<>"']/g,s=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[s]));M=x=>Z(C(x).replace(/-->/g,"--＞").replace(/[;\n\r]/g,"_"));F=x=>(C(x).replace(/[\\/:*?"<>|]+/g,"_").replace(/\s+/g,"_").slice(0,80)||"rofan-chat");W=p=>{p=C(p);m=p.match(/^(\*{1,3}|_{1,3})([\s\S]*?)\1$/);if(m&&C(m[2]))return[{k:"scene",t:C(m[2])}];J=[];R=/(\*{1,3}|_{1,3})([\s\S]+?)\1/g;O=0;while(m=R.exec(p)){b=C(p.slice(O,m.index));if(b)J.push({k:"normal",t:b});b=C(m[2]);if(b)J.push({k:"scene",t:b});O=R.lastIndex}b=C(p.slice(O));if(b)J.push({k:"normal",t:b});return(J.length?J:[{k:"normal",t:p}])};H=[];Y=(id,o,t,split)=>{t=C(t);if(!t)return;t.split(/\n\s*\n+/).map(C).filter(Boolean).forEach((p,i)=>{(split?W(p):[{k:"normal",t:p}]).forEach((z,j)=>{if(z&&z.t)H.push('<div\x20class="rofan-block"\x20data-block-id="'+M(id+"-"+i+"-"+j)+'"\x20data-owner="'+o+'"\x20data-kind="'+z.k+'"><p>'+Z(z.t).replace(/\n+/g,"</p><p>")+'</p></div>')})})};G.forEach((x,i)=>{k=M(x.log_id||x.pk||("log"+i));Y(k+"-user","user",x.user_chat,0);Y(k+"-bot","character",x.bot_chat,1)});T=C(P.oriChatData&&P.oriChatData.chat_title||P.chatData&&P.chatData.chat_title||P.botDetail&&(P.botDetail.name||P.botDetail.bot_name||P.botDetail.title)||P.oriBotDetail&&(P.oriBotDetail.name||P.oriBotDetail.bot_name||P.oriBotDetail.title)||document.title||"rofan-chat").replace(/\s*\|\s*로판\s*AI\s*$/i,"")||"rofan-chat";D='<!doctype\x20html><html\x20lang="ko"><head><meta\x20charset="utf-8"><title>'+Z(T)+'</title></head><body><main\x20class="rofan-export"><h1>'+Z(T)+'</h1>'+H.join("\n")+'</main></body></html>';a=document.createElement("a");u=URL.createObjectURL(new(Blob)([D],{type:"text/html;charset=utf-8"}));a.href=u;a.download=F(T)+".rofan.html";a.rel="noopener";document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(u);a.remove()},1500);S("done:"+G.length);alert("done:"+G.length)}catch(e){console.error(e);S("fail:"+(e.message||e));alert("fail:"+(e.message||e))}finally{window.__RME=0}})()`;

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
      var classicPicker = classicBox ? classicBox.querySelector(".filePicker") : null;
      installOneHelper({
        id: "rofanMobileExportHelperClassic",
        targetBox: classicBox,
        insertAfter: classicFold || classicPicker,
        fallbackBefore: inputText,
        finalStep: "저장된 .rofan.html 파일을 위의 파일 선택으로 넣습니다."
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
        finalStep: "저장된 .rofan.html 파일을 위의 저장 파일 불러오기로 넣습니다."
      });
    }
  }

  function installOneHelper(opts){
    if (!opts || !opts.targetBox || document.getElementById(opts.id)) return;

    var rawBookmarklet = buildRawBookmarklet();
    var encodedBookmarklet = buildEncodedBookmarklet();

    var wrap = document.createElement("details");
    wrap.className = "filePicker fileExtractFold rofanMobileExportHelper";
    wrap.id = opts.id;

    var summary = document.createElement("summary");
    summary.innerHTML = "<span>RofanAi 모바일 간편 백업</span><span class=\"fileNameText\">MHT 없이 .rofan.html 저장</span>";
    wrap.appendChild(summary);

    var body = document.createElement("div");
    body.className = "fileExtractBody rofanMobileExportBody";

    var intro = document.createElement("div");
    intro.className = "hint";
    intro.textContent = "RofanAi 채팅방에서 실행할 즐겨찾기 코드를 복사합니다. 전체 로그를 구조 보존 .rofan.html로 저장합니다.";
    body.appendChild(intro);

    var actions = document.createElement("div");
    actions.className = "optionRow compactControls rofanMobileExportActions";

    var copyRawBtn = document.createElement("button");
    copyRawBtn.type = "button";
    copyRawBtn.className = "btn primary";
    copyRawBtn.textContent = "북마클릿 코드 복사";
    copyRawBtn.addEventListener("click", function(){
      copyText(rawBookmarklet, "북마클릿 코드를 복사했습니다.");
    });

    var copyEncodedBtn = document.createElement("button");
    copyEncodedBtn.type = "button";
    copyEncodedBtn.className = "btn subtle";
    copyEncodedBtn.textContent = "인코딩 코드 복사";
    copyEncodedBtn.addEventListener("click", function(){
      copyText(encodedBookmarklet, "인코딩 북마클릿 코드를 복사했습니다.");
    });

    var toggleCodeBtn = document.createElement("button");
    toggleCodeBtn.type = "button";
    toggleCodeBtn.className = "btn subtle";
    toggleCodeBtn.textContent = "코드 보기";
    toggleCodeBtn.addEventListener("click", function(){
      codeBox.hidden = !codeBox.hidden;
      toggleCodeBtn.textContent = codeBox.hidden ? "코드 보기" : "코드 숨기기";
    });

    actions.appendChild(copyRawBtn);
    actions.appendChild(copyEncodedBtn);
    actions.appendChild(toggleCodeBtn);
    body.appendChild(actions);

    var steps = document.createElement("ol");
    steps.className = "rofanMobileExportSteps";
    [
      "북마클릿 코드 복사 버튼을 누릅니다.",
      "모바일 브라우저에서 즐겨찾기 하나를 만든 뒤, 주소를 복사한 코드로 바꿉니다.",
      "RofanAi 채팅방 페이지를 열고 그 즐겨찾기를 실행합니다.",
      opts.finalStep || "저장된 .rofan.html 파일을 불러옵니다."
    ].forEach(function(text){
      var li = document.createElement("li");
      li.textContent = text;
      steps.appendChild(li);
    });
    body.appendChild(steps);

    var codeBox = document.createElement("pre");
    codeBox.className = "rofanMobileExportCode";
    codeBox.hidden = true;
    codeBox.textContent = rawBookmarklet;
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

  function buildRawBookmarklet(){
    return "javascript:" + DIRECT_BOOKMARKLET_SOURCE;
  }

  function buildEncodedBookmarklet(){
    return "javascript:" + encodeURIComponent(DIRECT_BOOKMARKLET_SOURCE);
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
      ".rofanMobileExportHelper .rofanMobileExportCode{margin:8px 0 0;padding:10px;border:1px solid var(--line2);border-radius:12px;background:#fff;color:var(--ink);font-size:11px;line-height:1.55;white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-all;max-height:160px;overflow:auto}",
      "@media(max-width:640px){.rofanMobileExportHelper{margin-top:6px;margin-bottom:8px}.rofanMobileExportHelper summary{padding:12px 14px}.rofanMobileExportHelper .rofanMobileExportActions .btn{width:100%}.rofanMobileExportHelper .rofanMobileExportSteps{font-size:11.5px;line-height:1.55}}"
    ].join("");
    document.head.appendChild(style);
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
})();
