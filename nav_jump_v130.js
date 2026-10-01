/* 입력칸·출력칸 '창 안' 오른쪽에 맨 위/맨 아래 버튼을 띄운다.
   v131의 떠 있는 배치를 되살리되, 밖으로 나가 깨지던 원인을 잡았다:
   기준을 칸(box) 아래끝이 아니라 '스크롤 요소의 실제 위치'로 잡고,
   크기 조절·탭 전환·창 크기 변경 때마다 다시 잰다. 관찰자는 쓰지 않는다. */
(()=>{"use strict";
if(window.__AI_LOG_NAV_JUMP_V130)return;window.__AI_LOG_NAV_JUMP_V130=true;

const CSS=`
.aiJumpPad{position:absolute;right:8px;bottom:8px;display:flex;flex-direction:column;gap:6px;z-index:7;pointer-events:none}
.aiJumpPad button{width:34px;height:34px;padding:0;border-radius:11px;border:1px solid var(--v79-line,var(--line,#d7e2e8));
  background:rgba(255,255,255,.92);color:var(--ink,#26343b);display:flex;align-items:center;justify-content:center;
  cursor:pointer;opacity:.78;pointer-events:auto;box-shadow:0 1px 3px rgba(40,50,58,.06)}
.aiJumpPad button:active{opacity:1}
.aiJumpPad svg{width:17px;height:17px;display:block;pointer-events:none}
html[data-theme="dark"] .aiJumpPad button{background:rgba(47,51,56,.92);color:#e8edf0;border-color:#474d53}
`;
const UP='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M6 13l6-6 6 6"/><path d="M6 19l6-6 6 6"/></svg>';
const DOWN='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M6 5l6 6 6-6"/><path d="M6 11l6 6 6-6"/></svg>';

function css(){
  if(document.getElementById("aiJumpCssV130")) return;
  const e=document.createElement("style"); e.id="aiJumpCssV130"; e.textContent=CSS;
  (document.head||document.documentElement).appendChild(e);
}
function scroller(box){
  const cand=[box.querySelector(".richResultBox"), box.querySelector('[contenteditable="true"]'),
              box.querySelector(".pastebox"), box.querySelector("textarea"), box];
  for(const el of cand) if(el && el.scrollHeight > el.clientHeight + 4) return el;
  return cand.find(Boolean) || box;
}
/* 스크롤 요소의 세로 가운데에 패드를 놓는다. box 기준 좌표라 창 밖으로 나갈 수 없다. */
function place(box){
  const pad=box.querySelector(":scope > .aiJumpPad");
  if(!pad)return;
  pad.style.display="flex";
  pad.style.right="8px";
  pad.style.bottom="auto";
  /* 칸(box)의 맨 아래는 보이는 미리보기보다 아래로 이어질 수 있어
     bottom 고정이 창 밖으로 나갔다. 실제 스크롤 영역의 아래끝을 재서
     그 안쪽 우하단에 놓고, 어떤 값이 와도 칸 안에 가둔다. */
  const t=scroller(box);
  const boxR=box.getBoundingClientRect();
  const tR=t.getBoundingClientRect();
  /* 첫 로딩 때 결과칸이 아직 비어 있으면(높이 0 근처) 기준이 없어
     버튼이 라벨 위에 얹혀 깨져 보였다. 내용이 생길 때까지 숨긴다. */
  if(tR.height < 60 || boxR.height < 80){ pad.style.display="none"; return; }
  const padH=pad.offsetHeight||74;
  let top=(tR.bottom-boxR.top)-padH-8;
  top=Math.max(6,Math.min(top,boxR.height-padH-6));
  pad.style.top=Math.round(top)+"px";
}
function attach(box){
  if(box.querySelector(":scope > .aiJumpPad")) { place(box); return; }
  if(getComputedStyle(box).position === "static") box.style.position = "relative";
  const pad=document.createElement("div"); pad.className="aiJumpPad";
  const mk=(html,text,toTop)=>{
    const b=document.createElement("button");
    b.type="button"; b.innerHTML=html; b.title=text; b.setAttribute("aria-label",text);
    b.addEventListener("click",ev=>{
      ev.preventDefault(); ev.stopPropagation();
      const t=scroller(box);
      try{ t.scrollTo({top:toTop?0:t.scrollHeight,behavior:"smooth"}); }
      catch(_){ t.scrollTop=toTop?0:t.scrollHeight; }
    });
    return b;
  };
  pad.append(mk(UP,"맨 위로",true), mk(DOWN,"맨 아래로",false));
  box.appendChild(pad);
  place(box);
}
function install(){
  try{
    css();
    document.querySelectorAll(".aiJumpInline").forEach(el=>el.remove());   // v137 라벨줄 버전 정리
    document.querySelectorAll(".editorGrid > .editorBox").forEach(attach);
  }catch(_){}
}
/* install → place → scroller 는 scrollHeight·getBoundingClientRect 를 읽는다.
   막 내용을 갈아끼운 직후(긴 로그 불러오기)에 부르면 브라우저가 문서 전체
   레이아웃을 그 자리에서 강제로 다시 계산한다 — 1MB 문서면 호출마다 수백 ms.
   프레임을 두 번 넘겨 브라우저가 제 손으로 레이아웃을 끝낸 다음에 읽으면
   같은 일이 공짜에 가깝다. */
function installSoon(ms){
  setTimeout(()=>{
    if(typeof requestAnimationFrame!=="function"){ install(); return; }
    requestAnimationFrame(()=>requestAnimationFrame(install));
  },ms||0);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install,{once:true});else install();
[600,1500,3000].forEach(ms=>installSoon(ms));
window.addEventListener("resize",()=>installSoon(80),{passive:true});
document.addEventListener("click",e=>{
  const t=e.target;
  if(!t||!t.closest) return;
  if(t.closest(".tab")||t.closest("[data-editor-size-key],[data-editor-size-value]")) installSoon(180);
},true);
let navReTimer=0;
const navRe=()=>{ clearTimeout(navReTimer); navReTimer=setTimeout(()=>installSoon(0),260); };
document.addEventListener("click",e=>{
  if(e.target&&e.target.closest&&e.target.closest(".editorGrid")) navRe();
},true);
document.addEventListener("input",e=>{
  if(e.target&&e.target.closest&&e.target.closest(".editorGrid")) navRe();
},true);
})();
