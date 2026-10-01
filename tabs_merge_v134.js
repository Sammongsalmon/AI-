/* 로그 다듬기(classic) 탭을 접고, 채팅방 전체 백업 탭을 '로그 다듬기'로 쓴다.
   전체 백업 탭의 구현(중복 답변·OOC 검토가 살아 있는 쪽)을 그대로 남기고,
   기존 로그 다듬기 탭에 있던 '파일에서 발췌' 접힘 블록만 이쪽으로 옮겨 온다.
   관찰자는 쓰지 않는다 — DOM 을 고치는 모듈에서 관찰은 되먹임이 된다. */
(()=>{"use strict";
if(window.__AI_LOG_TABS_MERGE_V134)return;window.__AI_LOG_TABS_MERGE_V134=true;

let excerptBase = "";                     // 불러온 원본 (범위 적용의 기준)
let lastAppliedHtml = "";                 // 우리가 마지막으로 잘라 넣은 결과 (새 내용 판별용)
const norm = t => String(t||"").replace(/\s+/g," ").trim();

function applyChatExcerpt(){
  const paste = document.getElementById("chatPaste");
  if(!paste) return;
  const sv = document.getElementById("chatExcerptStart");
  const ev = document.getElementById("chatExcerptEnd");
  const ns = norm(sv ? sv.value : ""), ne = norm(ev ? ev.value : "");
  /* 파일 선택 외의 길(붙여넣기·보관함)로 새 내용이 들어와도 기준이 따라가게 한다.
     현재 내용이 기준도, 우리가 잘라 넣은 결과도 아니면 새 원본으로 본다.
     예전에는 기준이 이전 파일에 묶여, 범위 적용이 이전 로그를 되살렸다. */
  const current = paste.innerHTML;
  if(excerptBase && current !== excerptBase && current !== lastAppliedHtml) excerptBase = current;
  if(!excerptBase) excerptBase = current;
  const holder = document.createElement("div");
  holder.innerHTML = excerptBase;
  /* 발췌본은 응답 단위(.rofan-block)로 나뉘어 있다. 그 단위로 잘라야
     유저·캐릭터 구분과 서식이 그대로 남는다. 없으면 최상위 자식 단위로 자른다. */
  const blocks = Array.from(holder.querySelectorAll(".rofan-block"));
  const list = blocks.length ? blocks : Array.from(holder.children);
  if(!list.length){ if(typeof showToast==="function") showToast("먼저 파일을 불러와 주세요."); return; }
  const txt = el => norm(el.innerText || el.textContent || "");
  let si = 0, ei = list.length - 1;
  if(ns){ const i = list.findIndex(b => txt(b).includes(ns)); if(i >= 0) si = i; }
  if(ne){ for(let i = list.length - 1; i >= si; i--){ if(txt(list[i]).includes(ne)){ ei = i; break; } } }
  const kept = list.slice(si, ei + 1);
  /* 첫·마지막 응답은 껍데기(data-owner·data-kind)와 안쪽 요소 구조를 그대로 두고
     글자만 잘라낸다. 그래서 화자 구분이 깨지지 않는다. */
  if(kept.length){
    if(ns) trimEdge(kept[0], ns, true);
    if(ne) trimEdge(kept[kept.length - 1], ne, false);
  }
  paste.innerHTML = kept.map(b => b.outerHTML).join("");
  try{ if(typeof openAllFolds === "function") openAllFolds(paste); }catch(_){}
  lastAppliedHtml = paste.innerHTML;
  try{ if(typeof transformText === "function") transformText(); }catch(_){}
  try{ if(typeof scheduleAutosave === "function") scheduleAutosave(); }catch(_){}
  if(typeof showToast === "function"){
    const found = (!ns || si > 0 || txt(list[0]).includes(ns)) && (!ne || ei < list.length - 1 || txt(list[ei]).includes(ne));
    showToast(found ? ("범위를 적용했습니다. (" + (ei - si + 1) + "개 응답)")
                    : "문장을 찾지 못해 전체를 넣었습니다. 문구를 확인해 주세요.");
  }
}
window.applyChatExcerpt = applyChatExcerpt;

/* 문구를 공백에 관대하게 찾는다 (줄바꿈·연속 공백이 달라도 걸리도록) */
function flexRe(needle){
  const body = String(needle).replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
  return new RegExp(body, "i");
}
/* head=true 면 문구 앞을, false 면 문구 뒤를 지운다. 요소는 남기고 글자만 건드린다. */
function trimEdge(block, needle, head){
  if(!block || !needle) return false;
  let re; try{ re = flexRe(needle); }catch(_){ return false; }
  const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
  const nodes = []; let n;
  while((n = walker.nextNode())) nodes.push(n);
  let at = -1, m = null;
  if(head){
    for(let i = 0; i < nodes.length; i++){ const r = re.exec(nodes[i].data); if(r){ at = i; m = r; break; } }
  }else{
    for(let i = nodes.length - 1; i >= 0; i--){ const r = re.exec(nodes[i].data); if(r){ at = i; m = r; break; } }
  }
  if(at < 0) return false;                       // 못 찾으면 이 응답은 손대지 않는다
  if(head){
    for(let i = 0; i < at; i++) nodes[i].data = "";
    nodes[at].data = nodes[at].data.slice(m.index);
  }else{
    nodes[at].data = nodes[at].data.slice(0, m.index + m[0].length);
    for(let i = at + 1; i < nodes.length; i++) nodes[i].data = "";
  }
  /* 글자가 다 빠진 요소는 걷어낸다. 응답 껍데기 자체는 남긴다. */
  Array.from(block.querySelectorAll("p,em,i,span,div,strong,b")).forEach(el => {
    if(el === block) return;
    if(!String(el.textContent || "").trim() && !el.querySelector("img")) el.remove();
  });
  return true;
}

function buildExcerptFold(){
  const panel = document.getElementById("chatPanel");
  if(!panel || document.getElementById("chatExcerptFold")) return;
  const picker = panel.querySelector(".filePicker");
  if(!picker) return;
  const label = picker.querySelector("label.prettyFile");
  if(!label) return;

  const details = document.createElement("details");
  details.className = "filePicker fileExtractFold";
  details.id = "chatExcerptFold";

  const summary = document.createElement("summary");
  const t1 = document.createElement("span"); t1.textContent = "파일에서 발췌";
  const t2 = document.createElement("span"); t2.className = "fileNameText"; t2.id = "chatFoldFileName";
  t2.textContent = "선택된 파일 없음";
  summary.append(t1, t2);

  const body = document.createElement("div");
  body.className = "fileExtractBody";
  body.appendChild(label);                 // 기존 노드를 옮긴다 — 걸려 있던 이벤트가 유지된다

  const row = document.createElement("div");
  row.className = "optionRow compactControls";
  row.style.marginTop = "10px";
  const mk = (labelText, id, ph) => {
    const w = document.createElement("span"); w.className = "control";
    w.appendChild(document.createTextNode(labelText + " "));
    const i = document.createElement("input"); i.type = "text"; i.id = id; i.placeholder = ph;
    w.appendChild(i); return w;
  };
  const btn = document.createElement("button");
  btn.type = "button"; btn.className = "btn subtle"; btn.textContent = "범위 적용";
  btn.addEventListener("click", applyChatExcerpt);
  row.append(mk("시작 문장","chatExcerptStart","발췌 시작 문장"),
             mk("끝 문장","chatExcerptEnd","여기까지 발췌"), btn);

  const hint = document.createElement("div");
  hint.className = "hint";
  hint.textContent = "파일을 불러온 뒤 시작·끝 문장으로 필요한 구간만 넣을 수 있습니다. 응답 단위로 잘려 화자 구분이 유지됩니다.";

  body.append(row, hint);
  details.append(summary, body);
  picker.replaceWith(details);

  /* 새 파일을 고르면 범위 기준을 다시 잡는다 */
  const fileInput = document.getElementById("chatFileInput");
  if(fileInput) fileInput.addEventListener("change", () => {
    excerptBase = ""; lastAppliedHtml = "";
    setTimeout(() => {
      const paste = document.getElementById("chatPaste");
      if(paste) excerptBase = paste.innerHTML;
      const src = document.getElementById("chatFileName");
      if(src && t2) t2.textContent = src.textContent || "선택된 파일 없음";
    }, 700);
  });
}

/* 탭 두 개가 줄을 꽉 채우게 한다 (감춘 탭은 자리를 차지하지 않는다) */
function tabsCss(){
  if(document.getElementById("aiTabsFillV134")) return;
  const st=document.createElement("style"); st.id="aiTabsFillV134";
  st.textContent=".tabs{display:flex}.tabs .tab{flex:1 1 0;min-width:0;text-align:center}"
    +'.tabs .tab[aria-hidden="true"]{display:none!important}';
  (document.head||document.documentElement).appendChild(st);
}
/* 라벨 줄(세로폭 조정 버튼이 이 안에 들어간다)을 원본 입력창 바로 위로 옮긴다 */
function moveLabelAbovePaste(){
  const panel=document.getElementById("chatPanel");
  const paste=document.getElementById("chatPaste");
  if(!panel||!paste) return;
  const box=paste.closest(".editorBox"); if(!box) return;
  const label=box.querySelector(":scope > .editorLabel"); if(!label) return;
  if(label.nextElementSibling===paste) return;      // 이미 제자리
  box.insertBefore(label, paste);                   // 직계 자식 관계는 유지된다
}
function renameTabs(){
  const classicTab = document.querySelector('.tab[data-tab="classic"]');
  const chatTab = document.querySelector('.tab[data-tab="chat"]');
  if(chatTab && chatTab.textContent.trim() !== "로그 다듬기") chatTab.textContent = "로그 다듬기";
  if(classicTab && classicTab.style.display !== "none"){
    classicTab.style.display = "none";
    classicTab.setAttribute("aria-hidden","true");
    /* 접힌 탭이 선택돼 있었다면 살아 있는 쪽으로 옮긴다 */
    if(classicTab.getAttribute("aria-selected") === "true" && chatTab) chatTab.click();
  }
  /* 높이 조절 컨트롤이 설치되면 자식들이 .editorLabelText 로 한 겹 감싸인다.
     그래서 '> span' 선택자로는 못 찾았다. 안쪽까지 훑는다. */
  document.querySelectorAll('#chatPanel .editorLabel span').forEach(sp => {
    const t = (sp.textContent || "").trim();
    if(t === "채팅방 백업 원본") sp.textContent = "로그 원본";
  });
}

function install(){ try{ tabsCss(); renameTabs(); buildExcerptFold(); moveLabelAbovePaste(); }catch(err){ console.warn("탭 통합", err); } }
if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, {once:true});
else install();
[500,1400,3000].forEach(ms => setTimeout(install, ms));
document.addEventListener("click", e => {
  if(e.target && e.target.closest && e.target.closest(".tab")) setTimeout(install, 120);
}, true);
})();
