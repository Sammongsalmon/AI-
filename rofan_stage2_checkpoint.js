(() => {
  "use strict";
  if (window.__AILogRofanStage2Installed) return;
  window.__AILogRofanStage2Installed = true;

  const STORAGE_KEY = "ai-log-rofan-stage2-ui-v1";
  const DEFAULTS = { autoOpenExtractor: true, accent: "#5eacc8" };
  const bridge = () => window.RofanNativeBridge || null;
  async function waitForBridge(timeout = 5000) {
    const started = Date.now();
    while (Date.now() - started < timeout) {
      const native = bridge();
      if (native?.getConfig && native?.setConfig && native?.listFonts && native?.saveFont) return native;
      await new Promise(resolve => setTimeout(resolve, 80));
    }
    throw new Error("기기 저장소 연결을 준비하지 못했습니다.");
  }
  const gearIcon = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 3.8 10 2h4l.5 1.8 1.6.9 1.8-.5 2 3.5-1.3 1.3v1.9l1.3 1.3-2 3.5-1.8-.5-1.6.9-.5 1.8h-4l-.5-1.8-1.6-.9-1.8.5-2-3.5L5.4 11V9.1L4.1 7.8l2-3.5 1.8.5z"/><circle cx="12" cy="10" r="2.6"/></svg>`;
  const closeIcon = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>`;

  function loadState() { try { return { ...DEFAULTS, ...(JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") || {}) }; } catch (_) { return { ...DEFAULTS }; } }
  let state = loadState();
  const saveState = () => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {} };
  const toast = message => { if (typeof showToast === "function") showToast(message); };
  const formatBytes = n => n < 1024 ? `${n} B` : n < 1048576 ? `${(n/1024).toFixed(1)} KB` : `${(n/1048576).toFixed(1)} MB`;

  const ACCENT_KEY = "ai-log-epub-accent-v67";
  const DEFAULT_ACCENT = "#5eacc8";
  const clamp = (n, a=0, b=1) => Math.max(a, Math.min(b, Number(n)||0));
  function normalizeHex(value){const m=String(value||"").trim().match(/^#?([0-9a-f]{6})$/i);return m?"#"+m[1].toLowerCase():"";}
  function hexRgb(hex){hex=normalizeHex(hex)||DEFAULT_ACCENT;return [parseInt(hex.slice(1,3),16),parseInt(hex.slice(3,5),16),parseInt(hex.slice(5,7),16)];}
  function rgbHex(rgb){return "#"+rgb.map(v=>Math.round(clamp(v,0,255)).toString(16).padStart(2,"0")).join("");}
  function mix(rgb,target,amount){return rgb.map((v,i)=>v+(target[i]-v)*amount);}
  function rgbHsv([r,g,b]){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;let h=0;if(d){if(mx===r)h=((g-b)/d)%6;else if(mx===g)h=(b-r)/d+2;else h=(r-g)/d+4;h*=60;if(h<0)h+=360;}return [h,mx?d/mx:0,mx];}
  function hsvRgb(h,s,v){h=((Number(h)||0)%360+360)%360;s=clamp(s);v=clamp(v);const c=v*s,x=c*(1-Math.abs((h/60)%2-1)),m=v-c;let r=0,g=0,b=0;if(h<60){r=c;g=x}else if(h<120){r=x;g=c}else if(h<180){g=c;b=x}else if(h<240){g=x;b=c}else if(h<300){r=x;b=c}else{r=c;b=x}return [(r+m)*255,(g+m)*255,(b+m)*255];}
  let storedAccent="";try{storedAccent=localStorage.getItem(ACCENT_KEY)||""}catch(_){}
  let accentHex = normalizeHex(storedAccent) || DEFAULT_ACCENT;
  let accentHsv = rgbHsv(hexRgb(accentHex));
  function applyAccent(hex, persist=false){hex=normalizeHex(hex)||DEFAULT_ACCENT;accentHex=hex;accentHsv=rgbHsv(hexRgb(hex));const rgb=hexRgb(hex),soft=rgbHex(mix(rgb,[255,255,255],.84)),dark=rgbHex(mix(rgb,[0,0,0],.25)),light=rgbHex(mix(rgb,[255,255,255],.18));let style=document.getElementById("rfAccentThemeV67");if(!style){style=document.createElement("style");style.id="rfAccentThemeV67";(document.head||document.documentElement).appendChild(style);}style.textContent=`:root{--accent:${hex};--accentSoft:${soft};--accent-soft:${soft};--accent-dark:${dark};--focusRing:rgba(${rgb.join(",")},.18)}html[data-theme="dark"]{--accent:${light};--accentSoft:rgba(${rgb.join(",")},.15);--accent-soft:rgba(${rgb.join(",")},.15);--accent-dark:${hex};--focusRing:rgba(${rgb.join(",")},.24)}.flowDot{background:var(--accent)!important}.btn:hover,.toggle:hover,.navIconBtn:hover,.rfS2FontOption:hover{background:var(--accentSoft)!important}`;if(persist)try{localStorage.setItem(ACCENT_KEY,hex)}catch(_){}updateAccentUi();}
  function updateAccentUi(){const sw=document.getElementById("rfAccentSwatch"),hex=document.getElementById("rfAccentHex"),sv=document.getElementById("rfAccentSV"),dot=document.getElementById("rfAccentDot"),hue=document.getElementById("rfAccentHue");if(sw)sw.style.background=accentHex;if(hex&&document.activeElement!==hex)hex.value=accentHex;if(sv)sv.style.setProperty("--rfHue",accentHsv[0]);if(dot){dot.style.left=`${accentHsv[1]*100}%`;dot.style.top=`${(1-accentHsv[2])*100}%`;}if(hue)hue.value=String(Math.round(accentHsv[0]));}
  function setAccentHsv(h,s,v,persist=false){accentHsv=[h,clamp(s),clamp(v)];applyAccent(rgbHex(hsvRgb(...accentHsv)),persist);}
  applyAccent(accentHex,false);

  function installStyle() {
    if (document.getElementById("rfStage2Style")) return;
    const style = document.createElement("style");
    style.id = "rfStage2Style";
    style.textContent = `
      .heroTools{gap:4px!important}.heroTools .themeIconButton{box-shadow:0 2px 6px rgba(25,54,66,.075)!important}.heroTools #themeToggleButton,.heroTools #logLibraryButton,.heroTools #rofanSettingsButton{order:0}
      #rofanSettingsButton svg,#logLibraryButton svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.65;stroke-linecap:round;stroke-linejoin:round}
      .rfS2Modal[hidden]{display:none!important}.rfS2Modal{position:fixed;inset:0;z-index:2147483000;background:rgba(31,48,56,.27);backdrop-filter:blur(3px);display:grid;place-items:center;padding:12px}
      .rfS2Dialog{width:min(720px,100%);max-height:min(92vh,900px);overflow:auto;border:1px solid var(--line);border-radius:18px;background:var(--paper);color:var(--ink);box-shadow:0 15px 42px rgba(26,53,65,.18);padding:14px}
      .rfS2Head{display:flex;align-items:center;gap:10px;padding:2px 1px 11px}.rfS2HeadText{flex:1;min-width:0}.rfS2Title{font-size:17px;font-weight:820;letter-spacing:-.025em}.rfS2Sub{font-size:10.5px;color:var(--muted);margin-top:3px;line-height:1.48}
      .rfS2Close{width:34px;height:34px;border:1px solid var(--line);border-radius:10px;background:var(--paper2);color:var(--sub);display:grid;place-items:center;cursor:pointer}.rfS2Close svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round}
      .rfS2Notice{border:1px solid color-mix(in srgb,var(--accent) 34%,var(--line));border-radius:12px;background:color-mix(in srgb,var(--accent-soft) 60%,var(--paper));padding:9px 10px;font-size:10.5px;line-height:1.55;color:var(--sub);margin-bottom:9px}
      .rfHlGrid{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:9px}
.rfHlChip{display:flex;flex-direction:column;align-items:center;gap:5px;padding:7px 8px;border-radius:12px;
  border:2px solid transparent;background:transparent;cursor:pointer;min-width:58px}
.rfHlChip i{width:26px;height:26px;border-radius:50%;border:1px solid rgba(0,0,0,.15);display:block}
.rfHlChip em{font-style:normal;font-size:11.5px;font-weight:700;color:var(--sub)}
.rfHlChip.on{border-color:var(--accent,#5eacc8);background:color-mix(in srgb,var(--accent,#5eacc8) 12%,transparent)}
.rfS2Grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.rfS2Section{border:1px solid var(--line);border-radius:14px;background:var(--paper2);padding:11px;min-width:0}.rfS2Section.wide{grid-column:1/-1}.rfS2SectionTitle{font-size:12.5px;font-weight:790;color:var(--ink);margin-bottom:7px}.rfS2Help{font-size:10px;line-height:1.5;color:var(--muted);margin-top:6px}
      .rfS2Row{display:flex;align-items:center;gap:7px;flex-wrap:wrap}.rfS2Row+.rfS2Row{margin-top:7px}.rfS2Grow{flex:1;min-width:140px}.rfS2Input,.rfS2Select{height:34px;border:1px solid var(--line);border-radius:9px;background:var(--inputBg);color:var(--ink);padding:6px 8px;font:inherit;font-size:11px;min-width:0}.rfS2Input{flex:1}.rfS2Select{max-width:100%}.rfS2Button{min-height:34px;border:1px solid var(--line);border-radius:9px;background:var(--paper);color:var(--sub);padding:6px 10px;font:inherit;font-size:10.5px;font-weight:730;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:5px;white-space:nowrap}.rfS2Button.primary{background:var(--accent);border-color:var(--accent);color:#fff}.rfS2Button.danger{color:var(--red)}.rfS2Button svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
      /* [v341] 체크상자를 '정리 옵션' 과 같은 알약 토큰으로. 켜지면 테마색으로 차고
   앞의 작은 고리가 채워진다. */
.rfS2Toggle{display:inline-flex;align-items:center;gap:7px;font-size:11px;color:var(--sub);font-weight:690;min-height:31px;padding:6px 11px;border:1px solid var(--line);border-radius:999px;background:var(--paper);cursor:pointer;user-select:none;transition:.15s ease}.rfS2Toggle input{display:none}.rfS2Toggle::before{content:"";flex:0 0 auto;width:7px;height:7px;border:1px solid currentColor;border-radius:999px;opacity:.5}.rfS2Toggle:has(input:checked){background:var(--accent);border-color:var(--accent);color:#fff}.rfS2Toggle:has(input:checked)::before{background:currentColor;opacity:1;box-shadow:0 0 0 2px rgba(255,255,255,.34)}
      .rfAccentLine{display:flex;align-items:center;gap:7px;flex-wrap:wrap}.rfAccentSwatch{width:42px;height:34px;border:1px solid var(--line);border-radius:10px;box-shadow:inset 0 0 0 3px var(--paper);cursor:pointer}.rfAccentHex{width:98px;flex:0 0 auto}.rfAccentPicker[hidden]{display:none!important}.rfAccentPicker{margin-top:8px;padding:9px;border:1px solid var(--line);border-radius:12px;background:var(--paper)}.rfAccentSV{--rfHue:195;position:relative;width:100%;height:150px;border-radius:10px;overflow:hidden;touch-action:none;background:linear-gradient(to top,#000,transparent),linear-gradient(to right,#fff,hsl(var(--rfHue),100%,50%));box-shadow:inset 0 0 0 1px rgba(0,0,0,.12)}.rfAccentDot{position:absolute;width:15px;height:15px;border:2px solid #fff;border-radius:50%;transform:translate(-50%,-50%);box-shadow:0 0 0 1px rgba(0,0,0,.55),0 1px 4px rgba(0,0,0,.25);pointer-events:none}.rfAccentHue{width:100%;height:18px;margin-top:8px;accent-color:var(--accent);background:linear-gradient(90deg,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00);border-radius:999px}
      .rfS2Status{font-size:9.5px;color:var(--muted);min-height:1.4em}.rfS2Footer{display:flex;justify-content:flex-end;gap:7px;padding-top:11px}
      .rfS2FontPicker{position:relative;flex:1;min-width:220px}.rfS2FontChoiceButton{width:100%;height:34px;border:1px solid var(--line);border-radius:9px;background:var(--inputBg);color:var(--ink);padding:6px 9px;font:inherit;font-size:11px;display:flex;align-items:center;justify-content:space-between;gap:8px;text-align:left}.rfS2FontChoiceButton svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:1.8;transition:transform .16s}.rfS2FontChoiceButton[aria-expanded="true"] svg{transform:rotate(180deg)}.rfS2FontMenu[hidden]{display:none!important}.rfS2FontMenu{position:absolute;left:0;right:0;top:calc(100% + 5px);z-index:15;max-height:230px;overflow:auto;padding:5px;border:1px solid var(--line);border-radius:11px;background:var(--paper);box-shadow:0 10px 24px rgba(25,54,66,.16)}.rfS2FontOption{width:100%;min-height:34px;border:0;border-radius:8px;background:transparent;color:var(--ink);padding:7px 8px;font:inherit;font-size:10.8px;text-align:left;display:flex;align-items:center;justify-content:space-between;gap:8px}.rfS2FontOption small{color:var(--muted);font-size:9px}.rfS2FontOption:hover,.rfS2FontOption:focus-visible{background:var(--accent-soft)}.rfS2FontOption[aria-selected="true"]{background:color-mix(in srgb,var(--accent-soft) 78%,var(--paper));color:var(--accent);font-weight:760}.rfS2FontGroup{padding:6px 8px 3px;color:var(--muted);font-size:9px;font-weight:760}.rfS2Button.save{background:var(--accent);border-color:var(--accent);color:#fff}
      .rfCamouflagePreview{width:54px;height:54px;flex:0 0 54px;border:1px solid var(--line);border-radius:14px;background:var(--paper);object-fit:cover;box-shadow:inset 0 0 0 3px var(--paper2)}.rfCamouflagePreview.isEmpty{display:grid;place-items:center;color:var(--muted);font-size:9px}.rfCamouflageName{min-width:160px}.rfCamouflageRow{align-items:center}.rfCamouflagePhotoName{max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:9px;color:var(--muted)}
      @media(max-width:620px){.rfS2Grid{grid-template-columns:1fr}.rfS2Section.wide{grid-column:auto}.rfS2Dialog{padding:11px}.saveBadge{display:none!important}}
    `;
    document.head.appendChild(style);
  }

  function markup() {
    return `<div class="rfS2Modal" id="rfStage2Modal" hidden aria-hidden="true"><section class="rfS2Dialog" role="dialog" aria-modal="true" aria-labelledby="rfStage2Title">
      <header class="rfS2Head"><div class="rfS2HeadText"><div class="rfS2Title" id="rfStage2Title">로판AI 전용 뷰 · 설정</div><div class="rfS2Sub">발췌기 테마와 홈 화면 표시를 설정합니다. 뷰어 쪽 설정은 WebView 위젯의 ‘뷰어 설정’ 에 있습니다.</div></div><button type="button" class="rfS2Close" id="rfStage2Close" aria-label="닫기">${closeIcon}</button></header>
      <div class="rfS2Notice">전용 WebView는 로그인 상태와 현재 채팅방을 유지합니다. 상단바의 ☰는 발췌 도구, ↻는 현재 웹페이지 새로고침, ›는 발췌기 이동입니다.</div>
      <div class="rfS2Grid">
        <section class="rfS2Section"><div class="rfS2SectionTitle">발췌기 테마 색상</div><div class="rfAccentLine"><button type="button" class="rfAccentSwatch" id="rfAccentSwatch" aria-label="테마 색상 선택"></button><input class="rfS2Input rfAccentHex" id="rfAccentHex" value="#5eacc8" inputmode="text" maxlength="7"><button class="rfS2Button" id="rfAccentReset" type="button">기본색</button><button class="rfS2Button primary" id="rfAccentSave" type="button">색상 저장</button></div><div class="rfAccentPicker" id="rfAccentPicker" hidden><div class="rfAccentSV" id="rfAccentSV"><i class="rfAccentDot" id="rfAccentDot"></i></div><input class="rfAccentHue" id="rfAccentHue" type="range" min="0" max="359" step="1" value="195"></div><div class="rfS2Status" id="rfAccentStatus"></div><div class="rfS2Help">색상 칩을 누르면 사각형 HSV 피커가 열립니다. 미리 본 뒤 “색상 저장”을 누르면 앱 전체 강조색과 연한 배경색에 적용됩니다.</div></section>
        <section class="rfS2Section wide" id="rfCamouflageSection"><div class="rfS2SectionTitle">일코 모드</div>
          <div class="rfS2Row rfCamouflageRow"><label class="rfS2Toggle"><input id="rfCamouflageEnabled" type="checkbox">홈 화면 이름·아이콘 바꾸기</label></div>
          <div class="rfS2Row rfCamouflageRow" style="margin-top:8px"><div id="rfCamouflagePreview" class="rfCamouflagePreview isEmpty" aria-label="아이콘 미리보기">사진</div><input class="rfS2Input rfS2Grow rfCamouflageName" id="rfCamouflageName" maxlength="30" placeholder="홈 화면에 표시할 이름"><button class="rfS2Button" id="rfCamouflagePhotoButton" type="button">사진 선택</button><span class="rfCamouflagePhotoName" id="rfCamouflagePhotoName">선택 없음</span><input id="rfCamouflagePhotoInput" type="file" hidden accept="image/*"></div>
          <div class="rfS2Row" style="margin-top:8px"><button class="rfS2Button primary" id="rfCamouflageApply" type="button">홈 화면에 적용</button><button class="rfS2Button danger" id="rfCamouflageReset" type="button">일코 모드 해제</button></div>
          <div class="rfS2Status" id="rfCamouflageStatus"></div><div class="rfS2Help">사진은 중앙을 정사각형으로 잘라 아이콘에 사용합니다. 처음 적용할 때 Android의 “홈 화면에 추가” 확인을 승인하면 기본 아이콘이 숨겨집니다.</div>
        </section>
      </div>
      <footer class="rfS2Footer"><button class="rfS2Button" id="rfStage2Done" type="button">닫기</button></footer>
    </section></div>`;
  }

  function installHeader() {
    const tools = document.querySelector(".heroTools"), theme = document.getElementById("themeToggleButton"), folder = document.getElementById("logLibraryButton");
    if (!tools || !theme) return;
    let gear = document.getElementById("rofanSettingsButton");
    if (!gear) { gear = document.createElement("button"); gear.type="button"; gear.className="themeIconButton"; gear.id="rofanSettingsButton"; gear.title="로판AI 전용 뷰 설정"; gear.setAttribute("aria-label",gear.title); gear.innerHTML=gearIcon; }
    tools.append(theme); if (folder) tools.append(folder); tools.append(gear);
  }


  function bytesFromDataUrl(dataUrl){
    const comma=String(dataUrl||"").indexOf(",");
    if(comma<0)return new Uint8Array();
    const raw=atob(String(dataUrl).slice(comma+1));
    const out=new Uint8Array(raw.length);
    for(let i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i)&255;
    return out;
  }
  function imageFromDataUrl(dataUrl){return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error("아이콘 사진을 읽지 못했습니다."));image.src=dataUrl;});}
  function readAsDataUrl(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result||""));reader.onerror=()=>reject(reader.error||new Error("아이콘 사진을 읽지 못했습니다."));reader.readAsDataURL(file);});}
  async function prepareCamouflagePhoto(file){
    if(!file||!String(file.type||"").startsWith("image/"))throw new Error("이미지 파일을 선택해 주세요.");
    if(file.size>12*1024*1024)throw new Error("아이콘 사진은 12MB 이하로 선택해 주세요.");
    const source=await readAsDataUrl(file),image=await imageFromDataUrl(source),side=Math.min(image.naturalWidth||image.width,image.naturalHeight||image.height);
    if(!side)throw new Error("아이콘 사진 크기를 확인하지 못했습니다.");
    const canvas=document.createElement("canvas");canvas.width=256;canvas.height=256;
    const ctx=canvas.getContext("2d",{alpha:true});
    const sx=((image.naturalWidth||image.width)-side)/2,sy=((image.naturalHeight||image.height)-side)/2;
    ctx.clearRect(0,0,256,256);ctx.drawImage(image,sx,sy,side,side,0,0,256,256);
    camouflageIconDataUrl=canvas.toDataURL("image/png");camouflageIconBytes=bytesFromDataUrl(camouflageIconDataUrl);
    const preview=document.getElementById("rfCamouflagePreview");if(preview){preview.classList.remove("isEmpty");preview.textContent="";preview.style.backgroundImage=`url("${camouflageIconDataUrl}")`;preview.style.backgroundSize="cover";preview.style.backgroundPosition="center";}
    const name=document.getElementById("rfCamouflagePhotoName");if(name)name.textContent=file.name||"선택한 사진";
  }
  async function refreshCamouflageUi(){
    const status=document.getElementById("rfCamouflageStatus"),toggle=document.getElementById("rfCamouflageEnabled"),name=document.getElementById("rfCamouflageName");
    try{
      const native=await waitForBridge();const raw=await native.callText("camouflage_status");const parts=String(raw||"").split("\t");
      const enabled=parts[0]==="1",label=parts[1]?native.decodeText(parts[1]):"",hasIcon=parts[2]==="1";
      if(toggle)toggle.checked=enabled;if(name&&document.activeElement!==name)name.value=label||name.value||"";
      if(status)status.textContent=enabled?"일코 모드 홈 화면 아이콘을 사용 중입니다.":hasIcon?"등록된 아이콘 사진이 있습니다. 적용하면 홈 화면 아이콘이 바뀝니다.":"이름과 사진을 등록해 주세요.";
    }catch(error){if(status)status.textContent=error.message||"일코 모드 상태를 읽지 못했습니다.";}
  }
  async function applyCamouflage(){
    const status=document.getElementById("rfCamouflageStatus"),toggle=document.getElementById("rfCamouflageEnabled"),label=String(document.getElementById("rfCamouflageName")?.value||"").trim();
    try{
      const native=await waitForBridge();
      if(!toggle?.checked){await native.callText("camouflage_reset");if(status)status.textContent="일코 모드를 해제했습니다.";toast("일코 모드를 해제했습니다.");return;}
      if(!label)throw new Error("홈 화면에 표시할 이름을 입력해 주세요.");
      const iconArg=camouflageIconBytes?native.bytesToB64(camouflageIconBytes):"";
      const result=await native.callText("camouflage_apply",[native.textArg(label),iconArg]);
      if(status)status.textContent=result==="updated"?"기존 일코 아이콘을 갱신했습니다.":"Android의 홈 화면 추가 확인을 승인해 주세요.";
      toast(result==="updated"?"일코 모드 아이콘을 갱신했습니다.":"홈 화면 아이콘 등록 요청을 열었습니다.");
    }catch(error){console.error(error);if(status)status.textContent=error.message||"일코 모드 적용에 실패했습니다.";toast(status?.textContent||"일코 모드 적용에 실패했습니다.");}
  }
  async function resetCamouflage(){
    const status=document.getElementById("rfCamouflageStatus");
    try{const native=await waitForBridge();await native.callText("camouflage_reset");const toggle=document.getElementById("rfCamouflageEnabled");if(toggle)toggle.checked=false;
      /* 해제했는데 이름과 사진 미리보기가 남아 있어 아직 켜져 있는 것처럼 보였다. 같이 비운다. */
      const nameEl=document.getElementById("rfCamouflageName");if(nameEl)nameEl.value="";
      camouflageIconBytes=null;camouflageIconDataUrl="";
      const preview=document.getElementById("rfCamouflagePreview");if(preview){preview.style.backgroundImage="";preview.classList.add("isEmpty");}
      const photoName=document.getElementById("rfCamouflagePhotoName");if(photoName)photoName.textContent="선택 없음";
      if(status)status.textContent="기본 앱 아이콘을 다시 표시했습니다. 홈 화면의 일코 아이콘은 길게 눌러 삭제할 수 있습니다.";toast("일코 모드를 해제했습니다.");}
    catch(error){const m=error.message||"일코 모드 해제에 실패했습니다.";if(status)status.textContent=m;toast(m);}
  }

  async function openModal(){const modal=document.getElementById("rfStage2Modal");if(!modal)return;modal.hidden=false;modal.setAttribute("aria-hidden","false");document.body.style.overflow="hidden";refreshCamouflageUi().catch(error=>console.error(error));}
  function closeModal(){const modal=document.getElementById("rfStage2Modal");if(!modal)return;modal.hidden=true;modal.setAttribute("aria-hidden","true");
    /* 보관함 위에서 설정을 열었다 닫으면, 보관함이 걸어 둔 스크롤 잠금까지 풀려
       모달 뒤 페이지가 따라 움직였다. 아직 열려 있는 모달이 있으면 잠금을 유지한다. */
    const otherOpen=!document.getElementById("logLibraryModal")?.hidden;
    document.body.style.overflow=otherOpen?"hidden":"";}


  async function restoreAccent(){try{const local=normalizeHex(state.accent)||normalizeHex(localStorage.getItem(ACCENT_KEY))||DEFAULT_ACCENT;applyAccent(local,false);const native=await waitForBridge();const saved=normalizeHex(await native.getConfig("extractor_accent",local));if(saved){state.accent=saved;saveState();applyAccent(saved,true)}}catch(error){console.error(error)}}
  function boot(){
    installStyle();installHeader();if(!document.getElementById("rfStage2Modal"))document.body.insertAdjacentHTML("beforeend",markup());restoreAccent();
    document.getElementById("rofanSettingsButton")?.addEventListener("click",openModal);document.getElementById("rfStage2Close")?.addEventListener("click",closeModal);document.getElementById("rfStage2Done")?.addEventListener("click",closeModal);document.getElementById("rfStage2Modal")?.addEventListener("click",e=>{if(e.target.id==="rfStage2Modal")closeModal()});
    /* 보관함은 ESC 로 닫히는데 설정만 안 닫혀 동작이 어긋나 있었다.
       다만 보관함 위에 설정이 겹쳐 있을 때 ESC 한 번에 둘 다 닫히면 안 되므로,
       위에 있는 설정만 닫고 전파를 끊는다. 보관함 핸들러는 document 버블 단계라
       캡처 단계에서 stopPropagation 하면 아예 실행되지 않는다.
       설정이 닫혀 있을 때는 그냥 흘려보내 보관함이 예전처럼 ESC 로 닫히게 둔다. */
    document.addEventListener("keydown",event=>{
      if(event.key!=="Escape")return;
      const modal=document.getElementById("rfStage2Modal");
      if(!modal||modal.hidden)return;
      event.stopPropagation();event.stopImmediatePropagation();event.preventDefault();
      closeModal();   /* 이벤트 객체가 인자로 새지 않게 직접 부른다 */
    },true);
    /* nav_mode·apply_nav 는 NativeBridge.java 에 없는 작업이다(switch default → "알 수 없는 작업").
       첫 번째 호출이 던지는 바람에 그 뒤 apply_nav 도 못 가고, 페이지를 열 때마다 콘솔에
       빨간 오류가 한 건씩 쌓였다. 상단바는 이미 네이티브가 그리므로 설정 저장만 남긴다. */
    waitForBridge().then(async native=>{try{await native.setConfig("navigation_mode","topbar");}catch(error){console.error(error)}}).catch(()=>{});
    const accentPicker=document.getElementById("rfAccentPicker"),accentSV=document.getElementById("rfAccentSV"),accentHue=document.getElementById("rfAccentHue"),accentHexInput=document.getElementById("rfAccentHex");
    document.getElementById("rfAccentSwatch")?.addEventListener("click",()=>{if(accentPicker){accentPicker.hidden=!accentPicker.hidden;updateAccentUi();}});
    const pickSV=event=>{const r=accentSV.getBoundingClientRect();setAccentHsv(accentHsv[0],clamp((event.clientX-r.left)/r.width),clamp(1-(event.clientY-r.top)/r.height),false);};
    accentSV?.addEventListener("pointerdown",event=>{accentSV.setPointerCapture?.(event.pointerId);pickSV(event);});accentSV?.addEventListener("pointermove",event=>{if(event.buttons||event.pressure>0)pickSV(event);});
    accentHue?.addEventListener("input",event=>setAccentHsv(Number(event.target.value),accentHsv[1],accentHsv[2],false));
    accentHexInput?.addEventListener("change",event=>{const hex=normalizeHex(event.target.value);if(hex)applyAccent(hex,false);else updateAccentUi();});
    document.getElementById("rfAccentReset")?.addEventListener("click",()=>applyAccent(DEFAULT_ACCENT,false));
    /* ── 형광펜 색상 5개 ──────────────────────────────────────────
       저장은 네이티브 설정(shot_hl_colors)에 한다. 발췌기와 로판 웹뷰는
       저장소가 분리돼 있어, 이 경로라야 스크린샷 팔레트까지 전달된다. */
    const HL_NAMES=["테마색","파스텔","배경색","흰색","회색"];
    const hlPastelOf=(hex,t2)=>{const m=/^#?([0-9a-f]{6})$/i.exec(String(hex||"").trim());
      if(!m) return "#dbe7f2"; const n=parseInt(m[1],16); const k=(t2===undefined?0.72:t2);
      const mix=c=>Math.round(c+(255-c)*k);
      return "#"+[(n>>16)&255,(n>>8)&255,n&255].map(c=>mix(c).toString(16).padStart(2,"0")).join("")};
    const hlDefaultColors=()=>{const a=(state.accent||DEFAULT_ACCENT);
      return [a,hlPastelOf(a),hlPastelOf(a,0.86),"#ffffff","#e9edf1"]};
    let hlColors=hlDefaultColors(), hlPick=0, hlHsv={h:195,s:.5,v:.8};
    const hlNorm=v=>{const m=String(v||"").trim().match(/^#?([0-9a-f]{6})$/i);return m?"#"+m[1].toLowerCase():""};
    function hsvHexLocal(h,s,v){
      const f=n=>{const k=(n+h/60)%6,x=v-v*s*Math.max(0,Math.min(k,4-k,1));
        return Math.round(x*255).toString(16).padStart(2,"0")};
      return "#"+f(5)+f(3)+f(1);
    }
    function drawHlChips(){
      const grid=document.getElementById("rfHlGrid"); if(!grid) return;
      grid.innerHTML=hlColors.map((c,i)=>
        '<button type="button" class="rfHlChip'+(i===hlPick?" on":"")+'" data-hlpick="'+i+'">'
        +'<i style="background:'+c+'"></i><em>'+HL_NAMES[i]+'</em></button>').join("");
      const hex=document.getElementById("rfHlHex"); if(hex) hex.value=hlColors[hlPick];
      const sv=document.getElementById("rfHlSV");
      if(sv) sv.style.background="linear-gradient(to top,#000,transparent),linear-gradient(to right,#fff,hsl("+hlHsv.h+",100%,50%))";
    }
    function hlFromHex(hex){ const v=hlNorm(hex); if(!v) return; hlColors[hlPick]=v; drawHlChips(); }
    document.getElementById("rfHlGrid")?.addEventListener("click",e=>{
      const b=e.target.closest("[data-hlpick]"); if(!b) return;
      hlPick=Number(b.dataset.hlpick);
      const p=document.getElementById("rfHlPicker"); if(p) p.hidden=false;
      drawHlChips();
    });
    document.getElementById("rfHlHex")?.addEventListener("change",e=>hlFromHex(e.target.value));
    document.getElementById("rfHlHue")?.addEventListener("input",e=>{
      hlHsv.h=Number(e.target.value)||0; hlFromHex(hsvHexLocal(hlHsv.h,hlHsv.s,hlHsv.v));
    });
    document.getElementById("rfHlSV")?.addEventListener("pointerdown",e=>{
      const el=e.currentTarget, r=el.getBoundingClientRect();
      const move=ev=>{
        hlHsv.s=Math.min(1,Math.max(0,(ev.clientX-r.left)/r.width));
        hlHsv.v=Math.min(1,Math.max(0,1-(ev.clientY-r.top)/r.height));
        const dot=document.getElementById("rfHlDot");
        if(dot){dot.style.left=(hlHsv.s*100)+"%";dot.style.top=((1-hlHsv.v)*100)+"%";}
        hlFromHex(hsvHexLocal(hlHsv.h,hlHsv.s,hlHsv.v));
      };
      move(e);
      const up=()=>{document.removeEventListener("pointermove",move);document.removeEventListener("pointerup",up)};
      document.addEventListener("pointermove",move);document.addEventListener("pointerup",up);
    });
    document.getElementById("rfHlReset")?.addEventListener("click",()=>{
      hlColors[hlPick]=hlDefaultColors()[hlPick]; drawHlChips();
      const st=document.getElementById("rfHlStatus");
      if(st) st.textContent=HL_NAMES[hlPick]+" 칩을 기본값으로 되돌렸습니다. 저장을 눌러 반영하세요.";
    });
    document.getElementById("rfHlSave")?.addEventListener("click",async()=>{
      const st=document.getElementById("rfHlStatus");
      try{
        const native=await waitForBridge();
        await native.setConfig("shot_hl_colors", JSON.stringify(hlColors));
        if(st) st.textContent="형광펜 색상 5개를 저장했습니다.";
        toast("형광펜 색상을 저장했습니다.");
      }catch(error){
        console.error(error);
        if(st) st.textContent=error.message||"형광펜 색상 저장에 실패했습니다.";
        toast(st?.textContent||"저장 실패");
      }
    });
    (async()=>{
      try{
        const native=await waitForBridge();
        const raw=await native.getConfig("shot_hl_colors","");
        const arr=JSON.parse(raw||"null");
        if(Array.isArray(arr)&&arr.length===5) hlColors=arr.map((c,i)=>hlNorm(c)||hlDefaultColors()[i]);
      }catch(_){}
      drawHlChips();
    })();

    document.getElementById("rfAccentSave")?.addEventListener("click",async()=>{const status=document.getElementById("rfAccentStatus");try{applyAccent(accentHex,true);state.accent=accentHex;saveState();window.AILogThemeV67?.set?.(accentHex);const native=await waitForBridge();await native.setConfig("extractor_accent",accentHex);if(status)status.textContent=`${accentHex} 색상으로 저장했습니다.`;toast("발췌기 테마 색상을 저장했습니다.")}catch(error){console.error(error);if(status)status.textContent=error.message||"색상 저장에 실패했습니다.";toast(status?.textContent||"색상 저장에 실패했습니다.")}});
    document.getElementById("rfCamouflagePhotoButton")?.addEventListener("click",()=>document.getElementById("rfCamouflagePhotoInput")?.click());
    document.getElementById("rfCamouflagePhotoInput")?.addEventListener("change",async event=>{const file=event.target.files?.[0];event.target.value="";if(!file)return;const status=document.getElementById("rfCamouflageStatus");try{if(status)status.textContent="아이콘 사진을 준비하는 중…";await prepareCamouflagePhoto(file);if(status)status.textContent="사진을 준비했습니다. ‘홈 화면에 적용’을 누르세요.";}catch(error){
      /* 상태줄은 다이얼로그 한참 아래라 이미지가 아닌 파일을 골랐을 때 아무 일도 안 난 것처럼 보였다.
         다른 실패 경로(적용·해제)처럼 토스트도 함께 띄운다. */
      const message=error.message||"아이콘 사진을 처리하지 못했습니다.";
      if(status)status.textContent=message;
      toast(message);
    }});
    document.getElementById("rfCamouflageApply")?.addEventListener("click",applyCamouflage);
    document.getElementById("rfCamouflageReset")?.addEventListener("click",resetCamouflage);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();
