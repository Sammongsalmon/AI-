(()=>{"use strict";
if(window.__AI_LOG_THEME_V70)return;window.__AI_LOG_THEME_V70=true;
const root=document.documentElement,DEF_ACCENT="#5eacc8",KEY_A="ai-log-theme-accent-v70",KEY_B="ai-log-theme-background-v70",KEY_AUTO="ai-log-theme-background-auto-v70";
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,Number(n)||0));
/* #abc 같은 3자리 축약형은 흔히 쓰는데 6자리만 받아 조용히 롤백됐다. 축약형은 두 번씩 늘려 받는다. */
const norm=v=>{
  const s=String(v||"").trim();
  const six=s.match(/^#?([0-9a-f]{6})$/i);
  if(six)return "#"+six[1].toLowerCase();
  const three=s.match(/^#?([0-9a-f]{3})$/i);
  if(three)return "#"+three[1].toLowerCase().replace(/./g,c=>c+c);
  return "";
};
const rgb=h=>{h=norm(h)||DEF_ACCENT;return [parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]};
const hex=a=>"#"+a.map(v=>Math.round(clamp(v,0,255)).toString(16).padStart(2,"0")).join("");
const mix=(a,b,n)=>a.map((v,i)=>v+(b[i]-v)*n);
function rgbHsv([r,g,b]){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;let h=0;if(d){if(mx===r)h=((g-b)/d)%6;else if(mx===g)h=(b-r)/d+2;else h=(r-g)/d+4;h*=60;if(h<0)h+=360}return[h,mx?d/mx:0,mx]}
function hsvRgb(h,s,v){h=((+h||0)%360+360)%360;s=clamp(s);v=clamp(v);const c=v*s,x=c*(1-Math.abs((h/60)%2-1)),m=v-c;let r=0,g=0,b=0;if(h<60){r=c;g=x}else if(h<120){r=x;g=c}else if(h<180){g=c;b=x}else if(h<240){g=x;b=c}else if(h<300){r=x;b=c}else{r=c;b=x}return[(r+m)*255,(g+m)*255,(b+m)*255]}
const getLocal=(k,d="")=>{try{return localStorage.getItem(k)||d}catch(_){return d}},setLocal=(k,v)=>{try{localStorage.setItem(k,String(v))}catch(_){}};
function autoBackground(accent){const [h,s,v]=rgbHsv(rgb(accent));return hex(hsvRgb(h,Math.min(.125,s*.19),Math.max(.955,Math.min(.99,.955+v*.033))))}
let accent=norm(getLocal(KEY_A))||norm(getLocal("ai-log-epub-accent-v67"))||DEF_ACCENT;
let autoBg=getLocal(KEY_AUTO,"1")!=="0";
let background=norm(getLocal(KEY_B))||autoBackground(accent);
let picker={accent:rgbHsv(rgb(accent)),background:rgbHsv(rgb(background))};
function palette(){
 const a=rgb(accent),b=rgb(background),[ah,as,av]=rgbHsv(a);
 const accentDark=hex(mix(a,[0,0,0],.28)),accentLight=hex(mix(a,[255,255,255],.18));
 const bgSoft=hex(mix(b,[255,255,255],.52)),bgPale=hex(mix(b,[255,255,255],.76)),bgStrong=hex(mix(b,a,.12));
 const line=hex(mix(b,a,.24)),muted=hex(hsvRgb(ah,Math.min(.28,as*.34),Math.min(.52,av*.68))),sub=hex(hsvRgb(ah,Math.min(.34,as*.46),Math.min(.42,av*.58)));
 const darkBg=hex(mix(b,[13,18,20],.84)),darkSoft=hex(mix(b,[24,31,34],.78)),darkPaper=hex(mix(b,[18,24,27],.82)),darkLine=hex(mix(a,[65,78,84],.66));
 return{a,accentDark,accentLight,bgSoft,bgPale,bgStrong,line,muted,sub,darkBg,darkSoft,darkPaper,darkLine};
}
function apply(persist=false){
 if(autoBg)background=autoBackground(accent);const p=palette();
 const vars={
  "--theme-accent":accent,"--theme-accent-dark":p.accentDark,"--theme-accent-light":p.accentLight,
  "--theme-background":background,"--theme-background-soft":p.bgSoft,"--theme-background-pale":p.bgPale,"--theme-background-strong":p.bgStrong,
  "--theme-line":p.line,"--theme-muted":p.muted,"--theme-sub":p.sub,
  "--accent":accent,"--accent-dark":p.accentDark,"--accentSoft":p.bgSoft,"--accent-soft":p.bgSoft,"--accent-pale":p.bgPale,
  "--bg":background,"--paper":background,"--paper2":p.bgSoft,"--inputBg":p.bgPale,"--line":p.line,"--line2":p.bgSoft,"--muted":p.muted,"--sub":p.sub,
  "--focusRing":`rgba(${p.a.join(",")},.22)`,"--themeAccentRgb":p.a.join(" "),
  "--theme-dark-bg":p.darkBg,"--theme-dark-soft":p.darkSoft,"--theme-dark-paper":p.darkPaper,"--theme-dark-line":p.darkLine
 };
 for(const [k,v] of Object.entries(vars))root.style.setProperty(k,v);
 if(persist){setLocal(KEY_A,accent);setLocal("ai-log-epub-accent-v67",accent);setLocal(KEY_B,background);setLocal(KEY_AUTO,autoBg?"1":"0")}
 updateUi();
 try{window.dispatchEvent(new CustomEvent("ai-log-theme-v70-change",{detail:{accent,background,autoBackground:autoBg}}))}catch(_){}
}
function installCss(){if(document.getElementById("aiLogThemeV70Css"))return;const s=document.createElement("style");s.id="aiLogThemeV70Css";s.textContent=`
:root{--theme-accent:#5eacc8;--theme-background:#eef7fb;--theme-background-soft:#f7fbfd;--theme-background-pale:#fbfdfe;--theme-muted:#6f8b9b;--theme-sub:#496574}
body{background:radial-gradient(circle at top left,color-mix(in srgb,var(--theme-background) 88%,white),transparent 34rem),radial-gradient(circle at 90% 10%,var(--theme-background-soft),transparent 28rem),linear-gradient(180deg,var(--theme-background-pale),var(--theme-background),var(--theme-background-soft))!important}
.card,.sideCard,.hero,details.foldBlock,.reviewPanel,.chapterList,.bookPreviewWrap,.rfS2Dialog,.rfS2Section,.manualChapterEditor,.chapterPreviewItem,.unitChapterPreviewItem,.epubRichEditor,.containsKeywordGroup,.dupeCard,.nextPromptFold{background:var(--theme-background)!important;border-color:var(--theme-line)!important}
.tabs,.filePicker,.workflowHint,.emptyState,.stat,.badge,.btn.subtle,.toggle:not(:has(input:checked)),.control,.rfS2Close,.rfS2Button:not(.primary),.rfS2FontChoiceButton,.rfS2FontMenu,.rfS2FontOption,.chapterTocRow b,.manualChapterRow b,.chapterPreviewItem>summary b,.unitChapterPreviewItem>summary em,.quoteSoft,.saveBadge{background:var(--theme-background-soft)!important;border-color:var(--theme-line)!important}
textarea,.pastebox,.richResultBox,.control input,.control select,.control textarea,.rfS2Input,.rfS2Select,.resultFindBar input[type=search]{background:var(--theme-background-pale)!important;border-color:var(--theme-line)!important;color:var(--ink)!important}
.btn.primary,.tab.active,.toggle:has(input:checked),.rfS2Button.primary,.miniChoiceBtn.active,.flowDot,.brandIcon,.postypeMini em{background:var(--theme-accent)!important;border-color:var(--theme-accent)!important;color:#fff!important}
.btn:hover,.toggle:hover,.navIconBtn:hover,.themeIconButton:hover,.rfS2Button:not(.primary):hover,.rfS2FontOption:hover{background:var(--theme-background-strong)!important}
.sectionDesc,.heroText,.hint,.miniHelp,.rfS2Help,.rfS2Sub,.rfS2Status,.brandSub,.stat span,.editorLabel span:last-child,.chapterTocRow span small,.chapterTocRow em,.manualChapterIntro,.manualChapterRow small,.chapterPreviewItem>summary small,.chapterPreviewItem>summary em,.chapterNote,.tocSummary span,.pastebox:empty:before,.richResultBox:empty:before{color:var(--theme-muted)!important}
.workflowHint,.flowItem,.eyebrow,.sectionHead,.editorLabel,.optionRow,.control,.toggle,.badge,.rfS2Notice,.rfS2Toggle{color:var(--theme-sub)!important}
.rfS2Notice{background:color-mix(in srgb,var(--theme-background-soft) 82%,var(--theme-accent))!important;border-color:color-mix(in srgb,var(--theme-accent) 32%,var(--theme-line))!important}
.tabs{background:var(--theme-background-soft)!important}.tab{color:var(--theme-sub)!important}.tab.active{color:#fff!important}
::-webkit-scrollbar-thumb{background:color-mix(in srgb,var(--theme-accent) 38%,var(--theme-background-soft))!important;border-color:var(--theme-background)!important}::-webkit-scrollbar-track{background:var(--theme-background-soft)!important}
html[data-theme=dark]{--bg:var(--theme-dark-bg)!important;--paper:var(--theme-dark-paper)!important;--paper2:var(--theme-dark-soft)!important;--inputBg:var(--theme-dark-bg)!important;--line:var(--theme-dark-line)!important;--line2:color-mix(in srgb,var(--theme-dark-line) 55%,var(--theme-dark-bg))!important;--sub:color-mix(in srgb,var(--theme-accent-light) 38%,#d8e0e3)!important;--muted:color-mix(in srgb,var(--theme-accent-light) 24%,#aebbc0)!important;--accent:var(--theme-accent-light)!important;--accentSoft:color-mix(in srgb,var(--theme-accent) 16%,var(--theme-dark-soft))!important;--accent-soft:color-mix(in srgb,var(--theme-accent) 16%,var(--theme-dark-soft))!important}
html[data-theme=dark] body{background:linear-gradient(180deg,var(--theme-dark-bg),color-mix(in srgb,var(--theme-dark-bg) 92%,black))!important}
html[data-theme=dark] .card,html[data-theme=dark] .sideCard,html[data-theme=dark] .hero,html[data-theme=dark] details.foldBlock,html[data-theme=dark] .reviewPanel,html[data-theme=dark] .chapterList,html[data-theme=dark] .bookPreviewWrap,html[data-theme=dark] .rfS2Dialog,html[data-theme=dark] .rfS2Section{background:var(--theme-dark-paper)!important;border-color:var(--theme-dark-line)!important}
html[data-theme=dark] .tabs,html[data-theme=dark] .filePicker,html[data-theme=dark] .workflowHint,html[data-theme=dark] .stat,html[data-theme=dark] .badge,html[data-theme=dark] .btn.subtle,html[data-theme=dark] .toggle:not(:has(input:checked)),html[data-theme=dark] .control,html[data-theme=dark] .rfS2Button:not(.primary),html[data-theme=dark] .rfS2FontChoiceButton,html[data-theme=dark] .rfS2FontMenu,html[data-theme=dark] .rfS2FontOption{background:var(--theme-dark-soft)!important;border-color:var(--theme-dark-line)!important}
html[data-theme=dark] textarea,html[data-theme=dark] .pastebox,html[data-theme=dark] .richResultBox,html[data-theme=dark] .control input,html[data-theme=dark] .control select,html[data-theme=dark] .rfS2Input{background:var(--theme-dark-bg)!important;border-color:var(--theme-dark-line)!important}
.aiThemeV70Line{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center}.aiThemeV70Control{display:flex;gap:7px;align-items:center;flex-wrap:wrap}.aiThemeV70Swatch{width:42px;height:34px;border:1px solid var(--line);border-radius:10px;box-shadow:inset 0 0 0 3px var(--paper);cursor:pointer}.aiThemeV70Hex{width:102px!important;flex:0 0 102px!important}.aiThemeV70Picker[hidden]{display:none!important}.aiThemeV70Picker{grid-column:1/-1;margin:4px 0 8px;padding:9px;border:1px solid var(--line);border-radius:12px;background:var(--theme-background-soft)}.aiThemeV70SV{--h:195;position:relative;height:145px;border-radius:10px;overflow:hidden;touch-action:none;background:linear-gradient(to top,#000,transparent),linear-gradient(to right,#fff,hsl(var(--h),100%,50%));box-shadow:inset 0 0 0 1px rgba(0,0,0,.14)}.aiThemeV70Dot{position:absolute;width:15px;height:15px;border:2px solid #fff;border-radius:50%;transform:translate(-50%,-50%);box-shadow:0 0 0 1px rgba(0,0,0,.55),0 1px 4px rgba(0,0,0,.25);pointer-events:none}.aiThemeV70Hue{width:100%;height:18px;margin-top:8px;accent-color:var(--theme-accent);background:linear-gradient(90deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00);border-radius:999px}.aiThemeV70Auto{display:flex;align-items:center;gap:6px;font-size:10.5px;color:var(--theme-sub);margin:6px 0}.aiThemeV70Auto input{accent-color:var(--theme-accent)}
`;document.head.appendChild(s)}
function updateUi(){for(const type of ["accent","background"]){const value=type==="accent"?accent:background,hsv=rgbHsv(rgb(value));picker[type]=hsv;const sw=document.getElementById(`aiThemeV70-${type}-sw`),input=document.getElementById(`aiThemeV70-${type}-hex`),sv=document.getElementById(`aiThemeV70-${type}-sv`),dot=document.getElementById(`aiThemeV70-${type}-dot`),hue=document.getElementById(`aiThemeV70-${type}-hue`);if(sw)sw.style.background=value;if(input&&document.activeElement!==input)input.value=value;if(sv)sv.style.setProperty("--h",hsv[0]);if(dot){dot.style.left=hsv[1]*100+"%";dot.style.top=(1-hsv[2])*100+"%"}if(hue)hue.value=Math.round(hsv[0])}const auto=document.getElementById("aiThemeV70-auto");if(auto)auto.checked=autoBg;const bInputs=document.querySelectorAll('[data-bg-manual]');bInputs.forEach(el=>el.toggleAttribute("disabled",autoBg))}
function setHsv(type,h,s,v){const value=hex(hsvRgb(h,s,v));if(type==="accent"){accent=value;if(autoBg)background=autoBackground(accent)}else{background=value;autoBg=false}apply(false)}
function installUi(){const modal=document.getElementById("rfStage2Modal");if(!modal)return false;const title=[...modal.querySelectorAll(".rfS2SectionTitle")].find(el=>el.textContent.trim()==="발췌기 테마 색상");const section=title?.closest(".rfS2Section");if(!section||section.dataset.themeV70)return false;section.dataset.themeV70="1";section.classList.add("wide");section.innerHTML=`<div class="rfS2SectionTitle">발췌기 색상</div>
<div class="aiThemeV70Line"><div><b style="font-size:11px">테마색</b><div class="rfS2Help">활성 버튼·위젯·하단바의 진한 강조색</div></div><div class="aiThemeV70Control"><button type="button" class="aiThemeV70Swatch" id="aiThemeV70-accent-sw" aria-label="테마색 선택"></button><input class="rfS2Input aiThemeV70Hex" id="aiThemeV70-accent-hex" maxlength="7"></div><div class="aiThemeV70Picker" id="aiThemeV70-accent-picker" hidden><div class="aiThemeV70SV" id="aiThemeV70-accent-sv"><i class="aiThemeV70Dot" id="aiThemeV70-accent-dot"></i></div><input class="aiThemeV70Hue" id="aiThemeV70-accent-hue" type="range" min="0" max="359"></div></div>
<div class="aiThemeV70Line" style="margin-top:8px"><div><b style="font-size:11px">배경색</b><div class="rfS2Help">발췌기·옵션 배경과 연한 버튼색</div></div><div class="aiThemeV70Control"><button type="button" class="aiThemeV70Swatch" id="aiThemeV70-background-sw" data-bg-manual aria-label="배경색 선택"></button><input class="rfS2Input aiThemeV70Hex" id="aiThemeV70-background-hex" data-bg-manual maxlength="7"></div><div class="aiThemeV70Picker" id="aiThemeV70-background-picker" hidden><div class="aiThemeV70SV" id="aiThemeV70-background-sv"><i class="aiThemeV70Dot" id="aiThemeV70-background-dot"></i></div><input class="aiThemeV70Hue" id="aiThemeV70-background-hue" type="range" min="0" max="359"></div></div>
<label class="aiThemeV70Auto"><input id="aiThemeV70-auto" type="checkbox">배경색을 테마색에서 자동 생성</label><div class="rfS2Row"><button class="rfS2Button" id="aiThemeV70-reset" type="button">기본색</button><button class="rfS2Button primary" id="aiThemeV70-save" type="button">두 색상 저장</button></div><div class="rfS2Status" id="aiThemeV70-status"></div>`;
 const bind=type=>{const sw=document.getElementById(`aiThemeV70-${type}-sw`),pickerEl=document.getElementById(`aiThemeV70-${type}-picker`),sv=document.getElementById(`aiThemeV70-${type}-sv`),hue=document.getElementById(`aiThemeV70-${type}-hue`),input=document.getElementById(`aiThemeV70-${type}-hex`);sw?.addEventListener("click",()=>{if(type==="background"&&autoBg){autoBg=false;apply(false)}pickerEl.hidden=!pickerEl.hidden;updateUi()});const pick=e=>{const r=sv.getBoundingClientRect(),h=picker[type][0];setHsv(type,h,clamp((e.clientX-r.left)/r.width),clamp(1-(e.clientY-r.top)/r.height))};sv?.addEventListener("pointerdown",e=>{sv.setPointerCapture?.(e.pointerId);pick(e)});sv?.addEventListener("pointermove",e=>{if(e.buttons||e.pressure>0)pick(e)});hue?.addEventListener("input",e=>setHsv(type,+e.target.value,picker[type][1],picker[type][2]));input?.addEventListener("change",e=>{const raw=String(e.target.value||"").trim(),v=norm(raw);if(!v){
    /* 예전엔 zzzz 를 넣어도 아무 말 없이 직전 색으로 돌아가, 입력칸이 고장난 줄 알았다.
       빈칸은 그냥 되돌리고, 읽지 못한 값은 왜 되돌렸는지 알려 준다. */
    updateUi();
    if(raw){const status=document.getElementById("aiThemeV70-status");
      if(status)status.textContent=`“${raw}” 은(는) 색상 코드로 읽을 수 없어 이전 색으로 되돌렸습니다. #5eacc8 또는 #5ac 처럼 입력해 주세요.`;
      if(typeof showToast==="function")showToast("색상 코드를 읽지 못해 이전 색으로 되돌렸습니다.");}
    return}if(type==="accent"){accent=v;if(autoBg)background=autoBackground(accent)}else{background=v;autoBg=false}apply(false)})};bind("accent");bind("background");document.getElementById("aiThemeV70-auto")?.addEventListener("change",e=>{autoBg=!!e.target.checked;if(autoBg)background=autoBackground(accent);apply(false)});document.getElementById("aiThemeV70-reset")?.addEventListener("click",()=>{accent=DEF_ACCENT;autoBg=true;background=autoBackground(accent);apply(false)});document.getElementById("aiThemeV70-save")?.addEventListener("click",async()=>{const status=document.getElementById("aiThemeV70-status");apply(true);if(status)status.textContent="화면에 적용하고 저장하는 중…";try{const b=window.RofanNativeBridge;if(b){/* allSettled 는 거부를 삼킨다. 네 키가 전부 실패해도 catch 로 가지 않아
         "저장했습니다" 가 그대로 떴고, 앱을 다시 켜면 색이 되돌아가 있었다.
         결과를 직접 보고 하나라도 실패하면 알린다. */
      const rs=await Promise.allSettled([b.setConfig("extractor_theme_color",accent),b.setConfig("extractor_background_color",background),b.setConfig("extractor_background_auto",autoBg?"1":"0"),b.setConfig("extractor_accent",accent)]);
      const bad=rs.find(r=>r.status==="rejected");
      if(bad) throw (bad.reason instanceof Error?bad.reason:new Error("색상을 저장하지 못했습니다."));
      /* [v352] 예전에 여기서 "apply_theme" 을 불렀다. 자바에는 그런 작업이 없어
         try/catch 가 조용히 삼켜 왔다 — 죽은 호출이라 걷어 낸다.
         색은 위에서 config_set 으로 저장되고, 로판 쪽은 applyRemoteTheme 이 읽어 간다. */}if(status)status.textContent=`테마 ${accent} · 배경 ${background}로 저장했습니다.`;if(typeof showToast==="function")showToast("테마색과 배경색을 저장했습니다.")}catch(e){const m=e.message||"색상 저장에 실패했습니다.";if(status)status.textContent=m;if(typeof showToast==="function")showToast(m)}});updateUi();return true}
async function syncNative(){const b=window.RofanNativeBridge;if(!b?.getConfig)return;try{const [a,bg,au]=await Promise.all([b.getConfig("extractor_theme_color",accent),b.getConfig("extractor_background_color",background),b.getConfig("extractor_background_auto",autoBg?"1":"0")]);accent=norm(a)||accent;autoBg=au!=="0";background=autoBg?autoBackground(accent):(norm(bg)||background);apply(true)}catch(_){}}
function boot(){installCss();apply(false);installUi();setTimeout(syncNative,250);setTimeout(installUi,500)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
new MutationObserver(()=>{installUi()}).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});
window.AILogThemeV70={get:()=>({accent,background,autoBackground:autoBg}),set:(a,b,auto=autoBg)=>{accent=norm(a)||accent;autoBg=!!auto;background=autoBg?autoBackground(accent):(norm(b)||background);apply(true)}};
})();
