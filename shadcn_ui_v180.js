/* shadcn_ui_v180.js — 세그먼티드 탭 썸 + 스타일 순서 유지
   1) theme_v70 · dark_late_v159 · flat_white_v107 이 로드 후에도 <head> 끝에
      스타일을 다시 붙인다. v170 링크와 v180 링크를 그 순서대로 맨 끝에 되돌려
      v180 이 항상 마지막에 서게 한다. (v170.js 의 단일 링크 유지 로직을 대체)
   2) 활성 탭 뒤로 흰 썸이 미끄러진다. 폭·위치를 실제 탭에서 재므로
      글자 길이가 달라도 정확히 맞는다.
      스크립트가 실패하면 CSS 대비책(.tabs:not(.hasThumb) .tab.active)이 뜬다. */
(()=>{"use strict";
if(window.__SHADCN_UI_V180)return;window.__SHADCN_UI_V180=true;

const ORDER=["notionUiV170","shadcnUiV180"];

/* ── 1. 스타일 순서 유지 ─────────────────────────────────────── */
let moving=false;
function keepLast(){
  const head=document.head;if(!head)return;
  const links=ORDER.map(id=>document.getElementById(id)).filter(Boolean);
  if(!links.length)return;
  /* 이미 마지막 두 자리를 순서대로 차지하고 있으면 건드리지 않는다 */
  const tail=[...head.children].slice(-links.length);
  if(tail.length===links.length&&tail.every((el,i)=>el===links[i]))return;
  moving=true;
  for(const el of links)head.appendChild(el);
  moving=false;
}
function watchHead(){
  if(!document.head||!window.MutationObserver)return;
  let t=0;
  new MutationObserver(()=>{
    if(moving)return;
    clearTimeout(t);t=setTimeout(keepLast,120);
  }).observe(document.head,{childList:true});
}
[0,300,1000,2000,3000,5000,7000,9500].forEach(ms=>setTimeout(keepLast,ms));
document.addEventListener("visibilitychange",()=>{if(!document.hidden)setTimeout(keepLast,80)});
addEventListener("ai-log-theme-v70-change",()=>setTimeout(keepLast,80));

/* ── 2. 세그먼티드 썸 ────────────────────────────────────────── */
function thumb(){
  const tabs=document.querySelector(".tabs");
  if(!tabs)return;
  let th=tabs.querySelector(".nuiTabThumb");
  if(!th){
    th=document.createElement("i");
    th.className="nuiTabThumb";
    th.setAttribute("aria-hidden","true");
    tabs.insertBefore(th,tabs.firstChild);
    tabs.classList.add("hasThumb");
    tabs.classList.remove("hasInk");
    /* 탭 자체 핸들러가 .active 를 옮긴 뒤에 재도록 다음 프레임에 잰다 */
    tabs.addEventListener("click",()=>requestAnimationFrame(place));
    addEventListener("resize",place);
    tabs.querySelectorAll(".nuiTabInk").forEach(el=>el.remove());
  }
  place();
  function place(){
    const a=tabs.querySelector(".tab.active");
    if(!a)return;
    const tr=tabs.getBoundingClientRect(),ar=a.getBoundingClientRect();
    if(!ar.width)return;
    th.style.width=ar.width+"px";
    th.style.transform="translateX("+(ar.left-tr.left+tabs.scrollLeft)+"px)";
  }
}
function boot(){keepLast();watchHead();thumb();setTimeout(thumb,600);setTimeout(thumb,1800)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});
else boot();
})();
