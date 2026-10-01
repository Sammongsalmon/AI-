/* 그림자 제거 + 정리 옵션·검토 보드 배경 흰색.
   가장 마지막에 실려서 앞선 테마 규칙들을 덮는다. */
(()=>{"use strict";
if(window.__AI_LOG_FLAT_WHITE_V107)return;window.__AI_LOG_FLAT_WHITE_V107=true;
const SURFACES=[".card",".sideCard",".hero",".statsCard",".editorBox",".reviewPanel",".reviewBlock",
".riskPanel",".dupeCard",".containsKeywordGroup",".containsRow",".nextPromptFold","details.foldBlock",
"details.foldBlock>.blockBody",".blockBody",".chapterList",".bookPreviewWrap",".manualChapterEditor",
".chapterPreviewItem",".unitChapterPreviewItem",".epubRichEditor",".workflowHint",".emptyState",
".stat",".tabs",".filePicker",".flowList",".flowItem",".badge",".saveBadge",".pastebox",".richResultBox"];
const boards=sel=>["#optionsBoard","#reviewBoard"].map(b=>'html:not([data-theme="dark"]) '+b+' '+sel).join(",");
const CSS=`
:root{--shadow:0 1px 3px rgba(40,50,58,.045)!important;--softShadow:0 1px 2px rgba(40,50,58,.035)!important}
/* --- 그림자 아예 없애기 (선택 표시용 테두리 고리는 남긴다) --- */
body,#aiLogLocalTopbarV70,${SURFACES.join(",")},
.btn,.tab,.navIconBtn,.themeIconButton,.logLibraryIconBtn,.logLibraryImportBtn,.miniChoiceBtn,
.rfS2Dialog,.rfS2Section,.rfS2Button,.rfS2Close,.logLibraryDialog,.sharedLibraryDialog,
.logLibraryList,.logFileItem,.logFilePreview,.aiThemeV70Picker,.aiThemeV70Swatch,
.toggle:not(:has(input:checked)),.reviewChoice:not(.active),.miniChoiceBtn:not(.active){
  box-shadow:0 1px 3px rgba(40,50,58,.045)!important;
}
/* --- 정리 옵션 · 검토 보드 배경 흰색 --- */
html:not([data-theme="dark"]) #optionsBoard,
html:not([data-theme="dark"]) #reviewBoard{background:var(--aiCardBg,#fff)!important;background-image:none!important;
  border-radius:var(--radius,22px);}
${boards(SURFACES.join(",")+"")},
${boards(".sectionHead")},${boards(".optionRow")},${boards(".control")}{
  background:var(--aiCardBg,#fff)!important;background-image:none!important;
}
`;
function apply(){
  let el=document.getElementById("aiLogFlatWhiteV107");
  if(!el){el=document.createElement("style");el.id="aiLogFlatWhiteV107";el.textContent=CSS}
  (document.head||document.documentElement).appendChild(el);
  const r=document.documentElement;
  /* CSS 만으로는 테마 스크립트의 inline 값에 진다. 같은 자리에서 연한 값으로 못박는다. */
  r.style.setProperty("--shadow","0 1px 3px rgba(40,50,58,.045)","important");
  r.style.setProperty("--softShadow","0 1px 2px rgba(40,50,58,.035)","important");
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",apply,{once:true});else apply();
addEventListener("ai-log-theme-v70-change",apply);
/* 색 고르개의 무지개 띠 — 기본 range 그리기를 끄지 않으면 계열색 트랙이 위를 덮는다 */
const PICKER=`
input.aiThemeV70Hue{-webkit-appearance:none!important;appearance:none!important;accent-color:auto!important;
  background:linear-gradient(90deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)!important;
  border:0!important;height:18px!important;border-radius:999px!important;padding:0!important}
input.aiThemeV70Hue::-webkit-slider-runnable-track{-webkit-appearance:none;background:transparent!important;border:0!important;height:18px}
input.aiThemeV70Hue::-webkit-slider-thumb{-webkit-appearance:none!important;width:16px;height:16px;border-radius:50%;
  background:var(--aiCardBg,#fff)!important;border:2px solid rgba(0,0,0,.5);margin-top:1px;box-shadow:none!important}
.aiThemeV70SV{background:linear-gradient(to top,#000,transparent),linear-gradient(to right,#fff,hsl(var(--h),100%,50%))!important}
.logFilePreviewText.asCode{white-space:pre-wrap;word-break:break-all;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:11px;line-height:1.5}
/* --- 설정의 글꼴 선택 창 흰색 --- */
html:not([data-theme="dark"]) .rfS2FontPicker,
html:not([data-theme="dark"]) .rfS2FontGroup,
html:not([data-theme="dark"]) .rfS2FontMenu,
html:not([data-theme="dark"]) .rfS2FontOption,
html:not([data-theme="dark"]) .rfS2FontChoiceButton{
  background:var(--aiCardBg,#fff)!important;background-image:none!important;
}
html:not([data-theme="dark"]) .rfS2FontOption:hover,
html:not([data-theme="dark"]) .rfS2FontOption[aria-selected="true"],
html:not([data-theme="dark"]) .rfS2FontOption.active{
  background:var(--v79-button,#f4f7f9)!important;
}
/* 글꼴 등록·삭제 같은 실제 버튼은 예전 버튼색 그대로 둔다.
   흰 창 위에서 눌리는 자리가 보여야 하기 때문. */
html:not([data-theme="dark"]) .rfS2FontPicker .rfS2Button,
html:not([data-theme="dark"]) .rfS2FontGroup .rfS2Button,
html:not([data-theme="dark"]) .rfS2FontPicker .btn:not(.primary),
html:not([data-theme="dark"]) .rfS2FontGroup .btn:not(.primary),
html:not([data-theme="dark"]) .rfS2FontPicker button:not(.rfS2FontChoiceButton):not(.rfS2FontOption),
html:not([data-theme="dark"]) .rfS2FontGroup button:not(.rfS2FontChoiceButton):not(.rfS2FontOption){
  background:var(--v79-button,#eef4f7)!important;
}
html:not([data-theme="dark"]) .rfS2FontPicker .rfS2Button.primary,
html:not([data-theme="dark"]) .rfS2FontGroup .rfS2Button.primary,
html:not([data-theme="dark"]) .rfS2FontPicker .rfS2Button.save{
  background:var(--v79-accent)!important;color:#fff!important;
}
`;
function pickerCss(){
  let el=document.getElementById("aiLogPickerV107");
  if(!el){el=document.createElement("style");el.id="aiLogPickerV107";el.textContent=PICKER}
  (document.head||document.documentElement).appendChild(el);
}
/* 무지개 띠를 CSS 로만 잡으려니 계속 덮였다. 아예 감싸는 칸을 하나 만들어
   그 칸에 띠를 깔고, range 입력 자체는 완전히 투명하게 비운다. 덮일 여지가 없다. */
const WRAP=`
.aiHueWrap{display:block;position:relative;width:100%;height:18px;margin-top:8px;border-radius:999px;
  background:linear-gradient(90deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)!important;
  box-shadow:inset 0 0 0 1px rgba(0,0,0,.14)}
.aiHueWrap>input.aiThemeV70Hue{position:absolute;left:0;top:0;width:100%;height:18px;margin:0!important;
  padding:0!important;border:0!important;background:transparent!important;background-image:none!important;
  -webkit-appearance:none!important;appearance:none!important;accent-color:auto!important;box-shadow:none!important}
.aiHueWrap>input.aiThemeV70Hue::-webkit-slider-runnable-track{-webkit-appearance:none;height:18px;
  background:transparent!important;border:0!important;box-shadow:none!important}
.aiHueWrap>input.aiThemeV70Hue::-webkit-slider-thumb{-webkit-appearance:none!important;width:16px;height:16px;
  border-radius:50%;background:var(--aiCardBg,#fff)!important;border:2px solid rgba(0,0,0,.5);margin-top:1px;box-shadow:none!important}
`;
function wrapCss(){
  let el=document.getElementById("aiLogHueWrapV111");
  if(!el){el=document.createElement("style");el.id="aiLogHueWrapV111";el.textContent=WRAP}
  (document.head||document.documentElement).appendChild(el);
}
function wrapHue(){
  document.querySelectorAll("input.aiThemeV70Hue").forEach(inp=>{
    const parent=inp.parentElement;
    if(!parent||parent.classList.contains("aiHueWrap")) return;
    const box=document.createElement("span"); box.className="aiHueWrap";
    parent.insertBefore(box,inp); box.appendChild(inp);
  });
}
/* 검토 옵션이 꺼진 채로 저장돼 있어 중복·OOC 창이 아예 뜨지 않았다. 한 번만 켜 준다. */
function reviewDefaults(){
  /* 한 번만 켜는 방식은 저장된 꺼짐 값이 그 뒤에 덮어써서 소용이 없었다.
     열릴 때마다 켠다. 사용자가 세션 중에 끄는 것은 그대로 존중된다. */
  const d=document.getElementById("reviewDuplicates"), o=document.getElementById("reviewOocPairs");
  if(!d||!o) return;
  [d,o].forEach(el=>{ if(!el.checked){ el.checked=true;
    el.dispatchEvent(new Event("change",{bubbles:true})); } });
}
function boot111(){ wrapCss(); wrapHue(); pickerCss(); }
addEventListener("DOMContentLoaded",()=>{boot111();setTimeout(reviewDefaults,1500)},{once:true});
boot111();
setTimeout(boot111,1600); setTimeout(reviewDefaults,2200); setTimeout(reviewDefaults,4200);
/* 감싸는 행위도 DOM 변경이라 되먹임이 될 수 있다.
   무지개 띠를 다 감싸면 관찰을 끊고, 호출도 한 프레임에 한 번으로 묶는다. */
try{
  let pending=false;
  const mo=new MutationObserver(()=>{
    if(pending) return; pending=true;
    requestAnimationFrame(()=>{
      pending=false;
      wrapHue();
      const left=document.querySelectorAll("input.aiThemeV70Hue");
      let done=left.length>0;
      left.forEach(i=>{ if(!(i.parentElement&&i.parentElement.classList.contains("aiHueWrap"))) done=false; });
      if(done) mo.disconnect();
    });
  });
  mo.observe(document.documentElement,{childList:true,subtree:true});
}catch(_){}

setTimeout(apply,1600);
})();
