/* 라이트 모드에서만 블록 배경을 흰색으로. DOM 요소는 건드리지 않는다. */
(()=>{"use strict";
const CSS = `
  html[data-theme="light"], html.theme-light{
    --paper:#ffffff !important; --paper2:#ffffff !important; --inputBg:#ffffff !important;
    --v79-surface:#ffffff !important; --v79-surface-2:#ffffff !important;
  }
  html[data-theme="light"] section.card, html.theme-light section.card,
  html[data-theme="light"] .stat, html.theme-light .stat,
  html[data-theme="light"] details.foldBlock, html.theme-light details.foldBlock,
  html[data-theme="light"] .filePicker, html.theme-light .filePicker,
  html[data-theme="light"] .emptyState, html.theme-light .emptyState{
    background:#fff!important; background-image:none !important;
  }
`;
function apply(){
  let el = document.getElementById("aiLogBlocksWhiteV80");
  if(!el){ el=document.createElement("style"); el.id="aiLogBlocksWhiteV80"; el.textContent=CSS; }
  (document.head||document.documentElement).appendChild(el);
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", apply);
else apply();
setTimeout(apply, 1500);
})();
