/* 다크 잔여 흰색의 최종 방어층.
   flat_white 등 런타임 패치들이 1.5~4.2초에 스타일을 '다시 붙여' 정적 CSS 를 이겼다.
   같은 방식으로, 더 늦게, 더 여러 번 — 다크 팔레트를 맨 마지막 스타일로 유지한다. */
(()=>{"use strict";
if(window.__AI_LOG_DARK_LATE_V159)return;window.__AI_LOG_DARK_LATE_V159=true;
const CSS=`
/* 표면색 단일 출처. 아래 다른 파일들의 흰색 리터럴을 이 변수로 바꿔,
   테마가 바뀔 때 한 곳만 움직이면 전부 따라오게 한다. */
/* 라이트에는 일절 관여하지 않는다. 다크에서만 변수를 덮어써,
   흰색 리터럴을 건드리지 않고도 어두운 표면이 나오게 한다.
   (리터럴을 변수로 바꾸는 방식은 라이트에서 회귀를 냈으므로 폐기) */
html[data-theme="dark"]{--aiSurface:#232a30;--aiCardBg:#232a30}
html[data-theme="dark"] .card,html[data-theme="dark"] .panel,html[data-theme="dark"] .foldBlock,
html[data-theme="dark"] .blockBody,html[data-theme="dark"] .epubToolStack,html[data-theme="dark"] .epubEditMain,
html[data-theme="dark"] .epubEditGrid,html[data-theme="dark"] .optionRow,html[data-theme="dark"] .formatButtonRow,
html[data-theme="dark"] .filePicker,html[data-theme="dark"] .prettyFile,
html[data-theme="dark"] details,html[data-theme="dark"] summary{
  background:#232a30!important;color:var(--ink,#e6edf1)!important;border-color:#3a444c!important}
html[data-theme="dark"] .editorBox,html[data-theme="dark"] .editorGrid,html[data-theme="dark"] .editorLabel{
  background:transparent!important;border-color:#3a444c!important}
html[data-theme="dark"] .pastebox,html[data-theme="dark"] .richResultBox,html[data-theme="dark"] .epubRichEditor,
html[data-theme="dark"] textarea,html[data-theme="dark"] input[type="text"],
html[data-theme="dark"] input[type="number"],html[data-theme="dark"] input[type="search"],html[data-theme="dark"] select{
  background:#20262b!important;color:#e6edf1!important;border-color:#3a444c!important}
html[data-theme="dark"] #reviewBoard,html[data-theme="dark"] #reviewBoard *:not(button):not(input):not(.miniChoiceBtn){
  background-color:transparent}
html[data-theme="dark"] #aiLogLocalTopbarV70,
html[data-theme="dark"] .chapterPreviewItem,html[data-theme="dark"] .unitChapterPreviewItem,
html[data-theme="dark"] .filePicker,html[data-theme="dark"] .prettyFile{
  background:#232a30!important;color:#e6edf1!important;border-color:#3a444c!important}
html[data-theme="dark"] .hint,html[data-theme="dark"] .fileNameText{color:#9fb0ba!important;background:transparent!important}
`;
function apply(){
  try{
    const prev=document.getElementById("aiDarkLateV159");
    if(prev&&prev===document.head.lastElementChild)return;   // 이미 맨 끝이면 그대로
    if(prev)prev.remove();
    const st=document.createElement("style");st.id="aiDarkLateV159";st.textContent=CSS;
    document.head.appendChild(st);
  }catch(_){}
}
apply();
[1700,2600,4600,6400].forEach(ms=>setTimeout(apply,ms));
document.addEventListener("visibilitychange",()=>{if(!document.hidden)apply();});
})();

/* v168: 클래스 이름을 몰라도 잡는 최종 방어.
   다크에서 '거의 흰색' 배경으로 남은 요소를 실측해 어두운 값으로 눌러 준다.
   뒤늦게 생기는 컴포넌트(EPUB 챕터 카드·표지 선택·미리보기 행)까지 확실히 덮인다. */
(()=>{"use strict";
if(window.__AI_LOG_WHITE_KILLER)return;window.__AI_LOG_WHITE_KILLER=true;
const near=(v,lo)=>v>=lo;
function isWhitish(c){
  const m=/rgba?\(([^)]+)\)/i.exec(c||""); if(!m) return false;
  const p=m[1].split(",").map(x=>parseFloat(x));
  if(p.length>3&&p[3]<0.5) return false;
  return near(p[0],238)&&near(p[1],238)&&near(p[2],238);
}
function isDarkText(c){
  const m=/rgba?\(([^)]+)\)/i.exec(c||""); if(!m) return false;
  const p=m[1].split(",").map(x=>parseFloat(x));
  return p[0]<110&&p[1]<110&&p[2]<110;
}
let pending=false;
function sweep(){
  if(pending)return; pending=true;
  requestAnimationFrame(()=>{
    pending=false;
    try{
      if(document.documentElement.getAttribute("data-theme")!=="dark"){
        /* 라이트로 돌아왔을 때, 다크에서 칠해 둔 인라인 색을 걷어낸다.
           예전에는 그냥 빠져나가서 그 자리들이 라이트에서도 검게 남았다
           (상단바 모드 버튼·챕터 카드·표지 불러오기 등). */
        try{
          for(const el of document.querySelectorAll("[data-ai-darkfix]")){
            el.style.removeProperty("background-color");
            el.style.removeProperty("color");
            el.removeAttribute("data-ai-darkfix");
          }
        }catch(_){}
        return;
      }
      const nodes=document.querySelectorAll("body *:not(script):not(style)");
      let n=0;
      for(const el of nodes){
        if(++n>2500)break;
        if(el.closest("#logLibraryList")&&el.classList.contains("logFilePreview"))continue;
        let cs; try{cs=getComputedStyle(el)}catch(_){continue}
        if(isWhitish(cs.backgroundColor)){
          el.style.setProperty("background-color","#232a30","important");
          el.setAttribute("data-ai-darkfix","1");   // 라이트 복귀 시 되돌리기 위한 표식
          if(isDarkText(cs.color)) el.style.setProperty("color","#e6edf1","important");
        }
      }
    }catch(_){}
  });
}
sweep();
[900,1800,3000,5200].forEach(ms=>setTimeout(sweep,ms));
document.addEventListener("click",()=>setTimeout(sweep,120),true);
document.addEventListener("visibilitychange",()=>{if(!document.hidden)sweep();});
/* 테마가 바뀌는 '그 순간'에 반드시 한 번 돈다.
   클릭 훅만으로는 라이트 전환 시 되돌리기가 늦거나 아예 빠져, 다크에서 칠한
   인라인 색이 라이트 화면에 그대로 남았다(모드 버튼·챕터 카드·표지 불러오기). */
try{
  new MutationObserver(()=>{ sweep(); setTimeout(sweep,60); setTimeout(sweep,240); })
    .observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});
}catch(_){}
addEventListener("ai-log-theme-v70-change",()=>{ sweep(); setTimeout(sweep,80); });
})();
