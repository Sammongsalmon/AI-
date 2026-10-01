(() => {
  "use strict";
  if (window.__AILogRofanNavigationV67) return;
  window.__AILogRofanNavigationV67 = true;
  const OPEN_ROFAN = "__AI_LOG_OPEN_ROFAN_ACTIVITY__";
  let openedAt = 0, wasHiddenAfterOpen = false, checkTimer = 0;
  function openRofan(){openedAt=Date.now();try{console.log(OPEN_ROFAN)}catch(_){}}
  function scheduleNewExportCheck(delay=320){clearTimeout(checkTimer);checkTimer=setTimeout(()=>{try{window.__checkNewRofanExports?.()}catch(_){}},delay)}
  /* 앱을 켜면 이제 런처가 곧바로 웹뷰를 연다.
     예전의 '발췌기를 띄웠다가 420ms 뒤 웹뷰로 튀는' 자동 전환은 제거한다
     (깜빡임과 예기치 않은 화면 이동의 원인이었다). 복귀 시 새 발췌 확인은 유지. */
  function boot(){}
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden"){if(openedAt)wasHiddenAfterOpen=true;return}if(wasHiddenAfterOpen){wasHiddenAfterOpen=false;scheduleNewExportCheck()}});
  addEventListener("focus",()=>{if(openedAt&&Date.now()-openedAt>700)scheduleNewExportCheck(380)});
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();
