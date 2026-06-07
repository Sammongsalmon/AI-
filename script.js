const input = document.getElementById("inputText");
const output = document.getElementById("outputText");
const outputPreview = document.getElementById("outputTextPreview");
const chatPaste = document.getElementById("chatPaste");
const chatOutput = document.getElementById("chatOutputText");
const chatOutputPreview = document.getElementById("chatOutputTextPreview");
const chatFileInput = document.getElementById("chatFileInput");
const classicFileInput = document.getElementById("classicFileInput");
const excerptStartTextEl = document.getElementById("excerptStartText");
const excerptEndTextEl = document.getElementById("excerptEndText");
const epubEditPanel = document.getElementById("epubEditPanel");
const epubEditFileInput = document.getElementById("epubEditFileInput");
const epubEditEditor = document.getElementById("epubEditEditor");
const epubFindTextEl = document.getElementById("epubFindText");
const epubReplaceTextEl = document.getElementById("epubReplaceText");
const epubEditFontSizeEl = document.getElementById("epubEditFontSize");
const epubEditTextColorEl = document.getElementById("epubEditTextColor");
const epubEditTextColorREl = document.getElementById("epubEditTextColorR");
const epubEditTextColorGEl = document.getElementById("epubEditTextColorG");
const epubEditTextColorBEl = document.getElementById("epubEditTextColorB");
const epubQuoteColorEl = document.getElementById("epubQuoteColor");
const epubQuoteColorREl = document.getElementById("epubQuoteColorR");
const epubQuoteColorGEl = document.getElementById("epubQuoteColorG");
const epubQuoteColorBEl = document.getElementById("epubQuoteColorB");
const quoteContextMenuEl = document.getElementById("quoteContextMenu");
const quoteUnwrapBtnEl = document.getElementById("quoteUnwrapBtn");
const epubFontInputEl = document.getElementById("epubFontInput");
const classicFileNameEl = document.getElementById("classicFileName");
const chatFileNameEl = document.getElementById("chatFileName");
const epubEditFileNameEl = document.getElementById("epubEditFileName");
const epubFontFileNameEl = document.getElementById("epubFontFileName");
const epubCoverFileNameEl = document.getElementById("epubCoverFileName");

const removeDetailsEl = document.getElementById("removeDetails");
const removeEmptyLinesEl = document.getElementById("removeEmptyLines");
const removeCellEmptyLinesEl = document.getElementById("removeCellEmptyLines");
const removeEmojiSentencesEl = document.getElementById("removeEmojiSentences");
const removeHTMLEl = document.getElementById("removeHTML");
const removeDecorEl = document.getElementById("removeDecor");
const protectEnabledEl = document.getElementById("protectEnabled");
const protectTokenEl = document.getElementById("protectToken");
const quoteStyleEl = document.getElementById("quoteStyle");
const indentOutputEl = document.getElementById("indentOutput");
const deleteContainsEnabledEl = document.getElementById("deleteContainsEnabled");
const deleteContainsTokenEl = document.getElementById("deleteContainsToken");
const deleteContainsModeEl = document.getElementById("deleteContainsMode");
const removeTablesEl = document.getElementById("removeTables");
const labelSpeakersEl = document.getElementById("labelSpeakers");
const userNameEl = document.getElementById("userName");
const characterNameEl = document.getElementById("characterName");
const reviewDuplicatesEl = document.getElementById("reviewDuplicates");
const reviewOocPairsEl = document.getElementById("reviewOocPairs");
const oocCascadeModeEl = document.getElementById("oocCascadeMode");
const speakerMarkerPresetEl = document.getElementById("speakerMarkerPreset");
const speakerMarkerCustomEl = document.getElementById("speakerMarkerCustom");
const speakerLabelColorEl = document.getElementById("speakerLabelColor");
const speakerUserColorEl = document.getElementById("speakerUserColor");
const speakerCharacterColorEl = document.getElementById("speakerCharacterColor");
const speakerColorTargetEl = document.getElementById("speakerColorTarget");
const speakerLabelModeEl = document.getElementById("speakerLabelMode");
const resultStatsEl = document.getElementById("resultStats");
const riskPanelEl = document.getElementById("riskPanel");
const chapterPreviewEl = document.getElementById("chapterPreview");
const epubPreviewEl = document.getElementById("epubPreview");
const workflowHintEl = document.getElementById("workflowHint");
const epubTitleEl = document.getElementById("epubTitle");
const epubSubtitleEl = document.getElementById("epubSubtitle");
const epubAuthorEl = document.getElementById("epubAuthor");
const epubSeriesEl = document.getElementById("epubSeries");
const epubVolumeEl = document.getElementById("epubVolume");
const epubDescriptionEl = document.getElementById("epubDescription");
const epubTagsEl = document.getElementById("epubTags");
const epubLanguageEl = document.getElementById("epubLanguage");
const epubCoverInputEl = document.getElementById("epubCoverInput");
const chapterSplitModeEl = document.getElementById("chapterSplitMode");
const chapterSizeEl = document.getElementById("chapterSize");
const chapterSeparatorEl = document.getElementById("chapterSeparator");
const chapterTitlePrefixEl = document.getElementById("chapterTitlePrefix");
const chapterFirstTitleEl = document.getElementById("chapterFirstTitle");
const chapterKeywordInputEl = document.getElementById("chapterKeywordInput");
const chapterOrderInputEl = document.getElementById("chapterOrderInput");
const chapterPositionEl = document.getElementById("chapterPosition");
const chapterDividerPanelEl = document.getElementById("chapterDividerPanel");
const chapterTocInlineEl = document.getElementById("chapterTocInline");
const epubStylePresetEl = document.getElementById("epubStylePreset");
const epubTextModeEl = document.getElementById("epubTextMode");
const duplicateReviewPanel = document.getElementById("duplicateReviewPanel");
const containsReviewPanel = document.getElementById("containsReviewPanel");
const oocReviewPanel = document.getElementById("oocReviewPanel");
const chatOptions = document.getElementById("chatOptions");
const classicPanel = document.getElementById("classicPanel");
const chatPanel = document.getElementById("chatPanel");
const speakerOnlyEls = document.querySelectorAll(".speakerOnly");
const downloadFileNameEls = document.querySelectorAll(".downloadFileNameInput");

let activeMode = "classic";
let duplicateDecisions = {};
let containsDecisions = {};
let oocDecisions = {};
let currentDuplicateGroups = [];
let currentParsedBlocks = [];
let lastStructuredItems = [];
let savedEditorRange = null;
let currentContainsItems = [];
let containsOpenGroups = new Set();
let containsOpenTouched = false;
let currentOocItems = [];
let duplicatePageByGroup = {};
let duplicateGroupPage = 0;
let duplicateFilterText = "";
let duplicateOrderQuery = "";
let oocGroupPage = 0;
let oocFilterText = "";
let oocOrderQuery = "";
let cachedChatFileName = "";
let cachedCoverAsset = null;
let isRestoringWork = false;
let autosaveTimer = null;
let chapterKeywordQuery = "";
let chapterOrderQuery = "";
let chapterMatchPage = 0;
let currentChapterMatches = [];
let classicLoadedFileText = "";
let classicLoadedChunks = null;
let classicActiveChunks = null;
let classicActiveDisplayText = "";
let isApplyingClassicExcerpt = false;
let cachedEpubEditFileName = "";
let cachedEpubFontAsset = null;
let downloadFileBaseName = "";
let quoteLongPressTimer = null;
let quoteLongPressMeta = null;
let currentQuoteMenuTarget = null;


function wirePrettyFileInputs(){
  document.querySelectorAll('label.prettyFile, .fileControl').forEach(label => {
    const fileInput = label.querySelector('input[type="file"]');
    if(!fileInput || label.dataset.fileWired === '1') return;
    label.dataset.fileWired = '1';
    label.setAttribute('tabindex', label.getAttribute('tabindex') || '0');
    label.setAttribute('role', 'button');
    label.addEventListener('click', ev => {
      if(ev.target === fileInput) return;
      ev.preventDefault();
      fileInput.click();
    });
    label.addEventListener('keydown', ev => {
      if(ev.key === 'Enter' || ev.key === ' '){
        ev.preventDefault();
        fileInput.click();
      }
    });
  });
}
wirePrettyFileInputs();

function clampColorByte(v){
  const n = parseInt(v, 10);
  if(!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(255, n));
}
function componentToHex(v){ return clampColorByte(v).toString(16).padStart(2, "0"); }
function rgbToHex(r,g,b){ return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`; }
function hexToRgb(hex){
  const m = String(hex || "").trim().match(/^#?([0-9a-fA-F]{6})$/);
  if(!m) return {r:0,g:0,b:0};
  const n = parseInt(m[1], 16);
  return {r:(n>>16)&255, g:(n>>8)&255, b:n&255};
}
function updateColorSwatch(colorInput){
  if(!colorInput) return;
  document.querySelectorAll(`[data-swatch="${colorInput.id}"]`).forEach(sw => sw.style.setProperty("--swatch", colorInput.value));
  if(colorInput === epubQuoteColorEl) updateQuoteColorPreview();
}
function syncRgbFromColor(colorInput, rEl, gEl, bEl){
  if(!colorInput) return;
  const rgb = hexToRgb(colorInput.value);
  if(rEl) rEl.value = rgb.r;
  if(gEl) gEl.value = rgb.g;
  if(bEl) bEl.value = rgb.b;
  updateColorSwatch(colorInput);
}
function syncColorFromRgb(colorInput, rEl, gEl, bEl){
  if(!colorInput) return;
  colorInput.value = rgbToHex(rEl && rEl.value, gEl && gEl.value, bEl && bEl.value);
  updateColorSwatch(colorInput);
}
function setupColorWidget(colorInput, rEl, gEl, bEl){
  if(!colorInput) return;
  colorInput.addEventListener("input", () => { syncRgbFromColor(colorInput, rEl, gEl, bEl); scheduleAutosave(); });
  [rEl,gEl,bEl].forEach(el => { if(el) el.addEventListener("input", () => { syncColorFromRgb(colorInput, rEl, gEl, bEl); scheduleAutosave(); }); });
  syncRgbFromColor(colorInput, rEl, gEl, bEl);
}
function updateQuoteColorPreview(){
  const color = epubQuoteColorEl ? epubQuoteColorEl.value : "#4f8aa4";
  document.querySelectorAll(".quotePresetList").forEach(el => el.style.setProperty("--quote-color", color));
}
setupColorWidget(epubEditTextColorEl, epubEditTextColorREl, epubEditTextColorGEl, epubEditTextColorBEl);
setupColorWidget(epubQuoteColorEl, epubQuoteColorREl, epubQuoteColorGEl, epubQuoteColorBEl);
[speakerUserColorEl, speakerCharacterColorEl].forEach(el => {
  if(!el) return;
  el.addEventListener("input", () => { updateColorSwatch(el); transformText(); scheduleAutosave(); });
  updateColorSwatch(el);
});

input.addEventListener("input", () => {
  if(!isApplyingClassicExcerpt) classicActiveChunks = null;
  transformText();
  scheduleAutosave();
});
if(classicFileInput) classicFileInput.addEventListener("change", e => { updateFileNameLabel(classicFileInput, classicFileNameEl); loadClassicFile(); });
if(epubCoverInputEl) epubCoverInputEl.addEventListener("change", e => { updateFileNameLabel(epubCoverInputEl, epubCoverFileNameEl, "선택 없음"); });
[excerptStartTextEl, excerptEndTextEl].forEach(el => { if(el) el.addEventListener("input", scheduleAutosave); });
if(epubEditEditor) epubEditEditor.addEventListener("input", () => { updateResultStats([], [], getActiveOutputValue()); updateEpubPreview(); scheduleAutosave(); });
if(epubEditEditor) epubEditEditor.addEventListener("scroll", () => scheduleAutosave(), {passive:true});
if(epubEditFileInput) epubEditFileInput.addEventListener("change", e => { updateFileNameLabel(epubEditFileInput, epubEditFileNameEl); loadEpubEditFile(); });
if(epubEditEditor){
  ["mouseup","keyup","touchend","pointerup"].forEach(ev => epubEditEditor.addEventListener(ev, rememberEditorSelection));
  document.addEventListener("selectionchange", () => { if(activeMode === "epubedit") rememberEditorSelection(); });
  epubEditEditor.addEventListener("input", () => { rememberEditorSelection(); scheduleAutosave(); updateEpubPreview(); });
  epubEditEditor.addEventListener("pointerdown", handleQuotePointerDown);
  epubEditEditor.addEventListener("pointermove", handleQuotePointerMove);
  epubEditEditor.addEventListener("contextmenu", handleQuoteContextMenu);
  ["pointerup","pointercancel","pointerleave","scroll"].forEach(ev => epubEditEditor.addEventListener(ev, clearQuoteLongPressTimer));
}
if(quoteUnwrapBtnEl) quoteUnwrapBtnEl.addEventListener("click", () => {
  if(currentQuoteMenuTarget && epubEditEditor && epubEditEditor.contains(currentQuoteMenuTarget)) unwrapQuoteBlock(currentQuoteMenuTarget);
  hideQuoteContextMenu();
});
document.addEventListener("click", e => { if(quoteContextMenuEl && !quoteContextMenuEl.contains(e.target)) hideQuoteContextMenu(); });
document.addEventListener("keydown", e => { if(e.key === "Escape") hideQuoteContextMenu(); });
if(epubFontInputEl) epubFontInputEl.addEventListener("change", e => { updateFileNameLabel(epubFontInputEl, epubFontFileNameEl, "선택 없음"); loadEpubFontFile(); });
downloadFileNameEls.forEach(el => {
  el.addEventListener("input", () => {
    downloadFileBaseName = el.value || "";
    syncDownloadFileNameInputs(el);
    scheduleAutosave();
  });
});
chatPaste.addEventListener("input", () => {
  resetReviewDecisions();
  transformText();
  scheduleAutosave();
});
chatPaste.addEventListener("paste", handleRichPaste);
[output, chatOutput].forEach(el => {
  if(!el) return;
  el.addEventListener("scroll", () => scheduleAutosave(), {passive:true});
  const preview = resultPreviewFor(el);
  if(preview) preview.addEventListener("scroll", () => scheduleAutosave(), {passive:true});
});

[
  removeDetailsEl,
  removeEmptyLinesEl,
  removeCellEmptyLinesEl,
  removeEmojiSentencesEl,
  removeHTMLEl,
  removeDecorEl,
  protectEnabledEl,
  quoteStyleEl,
  indentOutputEl,
  deleteContainsEnabledEl,
  deleteContainsModeEl,
  removeTablesEl,
  labelSpeakersEl,
  reviewDuplicatesEl,
  reviewOocPairsEl,
  oocCascadeModeEl,
  speakerMarkerPresetEl,
  speakerColorTargetEl
].forEach(el => el.addEventListener("change", transformText));

protectTokenEl.addEventListener("input", transformText);
deleteContainsTokenEl.addEventListener("input", transformText);
userNameEl.addEventListener("input", transformText);
characterNameEl.addEventListener("input", transformText);
speakerMarkerCustomEl.addEventListener("input", transformText);
if(speakerLabelColorEl) speakerLabelColorEl.addEventListener("input", transformText);
if(speakerLabelModeEl) speakerLabelModeEl.addEventListener("change", transformText);
[
  epubTitleEl, epubSubtitleEl, epubAuthorEl, epubSeriesEl, epubVolumeEl,
  epubDescriptionEl, epubTagsEl, epubLanguageEl, chapterSplitModeEl, chapterSizeEl,
  chapterSeparatorEl, chapterTitlePrefixEl, chapterFirstTitleEl, epubStylePresetEl, epubTextModeEl, epubCoverInputEl
].forEach(el => {
  if(!el) return;
  el.addEventListener(el.tagName === "SELECT" || el.type === "file" ? "change" : "input", () => updateEpubPreview());
});

[chapterKeywordInputEl, chapterOrderInputEl].forEach(el => {
  if(!el) return;
  el.addEventListener("input", () => {
    if(el === chapterKeywordInputEl) chapterKeywordQuery = el.value || "";
    if(el === chapterOrderInputEl) chapterOrderQuery = el.value || "";
    chapterMatchPage = 0;
    updateChapterDividerPanel();
    scheduleAutosave();
  });
  el.addEventListener("keydown", e => {
    if(e.key === "Enter"){ e.preventDefault(); chapterMatchPage = 0; updateChapterDividerPanel(); }
  });
});
if(chapterPositionEl) chapterPositionEl.addEventListener("change", () => { updateChapterDividerPanel(); scheduleAutosave(); });
if(chapterDividerPanelEl) chapterDividerPanelEl.addEventListener("click", handleChapterDividerClick);
chatFileInput.addEventListener("change", e => { updateFileNameLabel(chatFileInput, chatFileNameEl); loadChatFile(); });
duplicateReviewPanel.addEventListener("change", handleDuplicateReviewChange);
duplicateReviewPanel.addEventListener("click", handleDuplicateReviewClick);
duplicateReviewPanel.addEventListener("input", handleDuplicateReviewInput);
duplicateReviewPanel.addEventListener("keydown", handleDuplicateReviewKeydown);
containsReviewPanel.addEventListener("change", handleContainsReviewChange);
containsReviewPanel.addEventListener("click", handleContainsReviewClick);
containsReviewPanel.addEventListener("toggle", handleContainsReviewToggle, true);
oocReviewPanel.addEventListener("change", handleOocReviewChange);
oocReviewPanel.addEventListener("click", handleOocReviewClick);
oocReviewPanel.addEventListener("input", handleOocReviewInput);
oocReviewPanel.addEventListener("keydown", handleOocReviewKeydown);


function updateModeVisibility(){
  const showSpeakerOptions = true;
  speakerOnlyEls.forEach(el => el.classList.toggle("hidden", !showSpeakerOptions));
}


// ------------------ 작업 자동 저장 ------------------
const WORK_DB_NAME = "rofan-cleaner-work-cache";
const WORK_STORE_NAME = "work";
const WORK_STATE_KEY = "current";
const WORK_META_KEY = "rofan-cleaner-work-meta";
const WORK_FALLBACK_KEY = "rofan-cleaner-work-fallback";

function openWorkDB(){
  return new Promise((resolve, reject) => {
    if(!window.indexedDB){ reject(new Error("IndexedDB not supported")); return; }
    const req = indexedDB.open(WORK_DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if(!db.objectStoreNames.contains(WORK_STORE_NAME)) db.createObjectStore(WORK_STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error("IndexedDB open error"));
  });
}
function idbPut(key, value){
  return openWorkDB().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(WORK_STORE_NAME, "readwrite");
    tx.objectStore(WORK_STORE_NAME).put(value, key);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error || new Error("IndexedDB write error")); };
  }));
}
function idbGet(key){
  return openWorkDB().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(WORK_STORE_NAME, "readonly");
    const req = tx.objectStore(WORK_STORE_NAME).get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error || new Error("IndexedDB read error"));
    tx.oncomplete = () => db.close();
  }));
}
function idbDelete(key){
  return openWorkDB().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(WORK_STORE_NAME, "readwrite");
    tx.objectStore(WORK_STORE_NAME).delete(key);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error || new Error("IndexedDB delete error")); };
  }));
}
function collectWorkValues(){
  return {
    version: 5,
    savedAt: new Date().toISOString(),
    activeMode,
    classicInput: input ? input.value : "",
    classicLoadedFileText,
    classicLoadedChunks,
    classicActiveChunks,
    classicActiveDisplayText,
    excerptStartText: excerptStartTextEl ? excerptStartTextEl.value : "",
    excerptEndText: excerptEndTextEl ? excerptEndTextEl.value : "",
    epubEditHTML: epubEditEditor ? epubEditEditor.innerHTML : "",
    epubEditScroll: epubEditEditor ? epubEditEditor.scrollTop : 0,
    cachedEpubEditFileName,
    cachedEpubFontAsset,
    downloadFileBaseName,
    classicOutput: output ? output.value : "",
    classicOutputScroll: output ? getResultOutputScroll(output) : 0,
    chatHTML: chatPaste ? chatPaste.innerHTML : "",
    chatOutputValue: chatOutput ? chatOutput.value : "",
    chatOutputScroll: chatOutput ? getResultOutputScroll(chatOutput) : 0,
    cachedChatFileName,
    options: collectPresetValues(),
    duplicateDecisions,
    containsDecisions,
    oocDecisions,
    duplicatePageByGroup,
    duplicateGroupPage,
    duplicateFilterText,
    duplicateOrderQuery,
    oocGroupPage,
    oocFilterText,
    oocOrderQuery,
    chapterKeywordQuery,
    chapterOrderQuery,
    chapterMatchPage,
    cachedCoverAsset
  };
}
function applyActiveModeFromState(mode){
  activeMode = mode === "chat" || mode === "epubedit" ? mode : "classic";
  document.querySelectorAll(".tab").forEach(t => {
    const on = t.dataset.tab === activeMode;
    t.classList.toggle("active", on);
    t.setAttribute("aria-selected", on ? "true" : "false");
  });
  classicPanel.classList.toggle("hidden", activeMode !== "classic");
  chatPanel.classList.toggle("hidden", activeMode !== "chat");
  if(epubEditPanel) epubEditPanel.classList.toggle("hidden", activeMode !== "epubedit");
  chatOptions.classList.remove("hidden");
  updateModeVisibility();
}
async function saveWorkNow(){
  if(isRestoringWork) return;
  const state = collectWorkValues();
  try{
    await idbPut(WORK_STATE_KEY, state);
    localStorage.setItem(WORK_META_KEY, JSON.stringify({savedAt: state.savedAt, fileName: cachedChatFileName || "", mode: activeMode}));
    updateAutosaveBadge("자동 저장됨");
  }catch(err){
    try{
      localStorage.setItem(WORK_FALLBACK_KEY, JSON.stringify(state));
      localStorage.setItem(WORK_META_KEY, JSON.stringify({savedAt: state.savedAt, fileName: cachedChatFileName || "", mode: activeMode, fallback:true}));
      updateAutosaveBadge("자동 저장됨");
    }catch(err2){
      console.warn("autosave failed", err, err2);
      updateAutosaveBadge("저장 실패");
    }
  }
}
function scheduleAutosave(){
  if(isRestoringWork) return;
  updateAutosaveBadge("저장 중…");
  clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(saveWorkNow, 500);
}
function updateAutosaveBadge(text){
  const el = document.getElementById("autosaveStatus");
  if(!el) return;
  let suffix = "";
  const raw = localStorage.getItem(WORK_META_KEY);
  if(raw){
    try{
      const meta = JSON.parse(raw);
      if(meta.savedAt){
        const d = new Date(meta.savedAt);
        if(!Number.isNaN(d.getTime())) suffix = ` · ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
      }
      if(meta.fileName) suffix += ` · ${meta.fileName}`;
    }catch(_err){}
  }
  el.textContent = text + suffix;
}
function restoreOutputScrollFromState(state){
  if(!state) return;
  requestAnimationFrame(() => {
    if(output && Number.isFinite(Number(state.classicOutputScroll))) setResultOutputScroll(output, Number(state.classicOutputScroll) || 0);
    if(chatOutput && Number.isFinite(Number(state.chatOutputScroll))) setResultOutputScroll(chatOutput, Number(state.chatOutputScroll) || 0);
    if(epubEditEditor && Number.isFinite(Number(state.epubEditScroll))) epubEditEditor.scrollTop = Number(state.epubEditScroll) || 0;
  });
}
async function restoreSavedWork(){
  isRestoringWork = true;
  let state = null;
  try{ state = await idbGet(WORK_STATE_KEY); }catch(_err){}
  if(!state){
    const fallback = localStorage.getItem(WORK_FALLBACK_KEY);
    if(fallback){
      try{ state = JSON.parse(fallback); }catch(_err){}
    }
  }
  if(state){
    try{
      const restoredOptions = Object.assign({}, state.options || {});
      if((!state.version || state.version < 4) && restoredOptions.chapterSeparator === "---") restoredOptions.chapterSeparator = "—————";
      applyPresetValues(restoredOptions);
      if(input) input.value = state.classicInput || "";
      classicLoadedFileText = state.classicLoadedFileText || "";
      classicLoadedChunks = Array.isArray(state.classicLoadedChunks) ? state.classicLoadedChunks : null;
      classicActiveChunks = Array.isArray(state.classicActiveChunks) ? state.classicActiveChunks : null;
      classicActiveDisplayText = state.classicActiveDisplayText || "";
      if(excerptStartTextEl) excerptStartTextEl.value = state.excerptStartText || "";
      if(excerptEndTextEl) excerptEndTextEl.value = state.excerptEndText || "";
      if(epubEditEditor) epubEditEditor.innerHTML = state.epubEditHTML || "";
      cachedEpubEditFileName = state.cachedEpubEditFileName || "";
      cachedEpubFontAsset = state.cachedEpubFontAsset || null;
      downloadFileBaseName = state.downloadFileBaseName || "";
      syncDownloadFileNameInputs();
      if(cachedEpubFontAsset) applyCachedEpubFont();
      if(chatPaste) chatPaste.innerHTML = state.chatHTML || "";
      cachedChatFileName = state.cachedChatFileName || "";
      cachedCoverAsset = state.cachedCoverAsset || null;
      duplicateDecisions = state.duplicateDecisions || {};
      containsDecisions = state.containsDecisions || {};
      oocDecisions = state.oocDecisions || {};
      duplicatePageByGroup = state.duplicatePageByGroup || {};
      duplicateGroupPage = state.duplicateGroupPage || 0;
      duplicateFilterText = state.duplicateFilterText || "";
      duplicateOrderQuery = state.duplicateOrderQuery || "";
      oocGroupPage = state.oocGroupPage || 0;
      oocFilterText = state.oocFilterText || "";
      oocOrderQuery = state.oocOrderQuery || "";
      chapterKeywordQuery = state.chapterKeywordQuery || "";
      chapterOrderQuery = state.chapterOrderQuery || "";
      chapterMatchPage = state.chapterMatchPage || 0;
      if(chapterKeywordInputEl) chapterKeywordInputEl.value = chapterKeywordQuery;
      if(chapterOrderInputEl) chapterOrderInputEl.value = chapterOrderQuery;
      applyActiveModeFromState(state.activeMode || activeMode);
      updateAutosaveBadge("복원됨");
      showToast(cachedChatFileName ? `저장된 작업을 불러왔습니다: ${cachedChatFileName}` : "저장된 작업을 불러왔습니다.");
    }catch(err){
      console.error(err);
      updateAutosaveBadge("복원 실패");
    }
  }else{
    applyActiveModeFromState(activeMode);
    updateAutosaveBadge("자동 저장 대기");
  }
  isRestoringWork = false;
  transformText();
  if(state){
    if(output && state.classicOutput) setResultOutput(output, state.classicOutput);
    if(chatOutput && state.chatOutputValue) setResultOutput(chatOutput, state.chatOutputValue);
    restoreOutputScrollFromState(state);
  }
  updateResultStats([], [], getActiveOutputValue());
  updateEpubPreview();
  updateChapterDividerPanel();
  scheduleAutosave();
}
async function clearSavedWork(){
  if(!window.confirm("저장된 작업 캐시를 삭제하시겠습니까? 새로고침 복원 데이터도 함께 지워집니다.")) return;
  try{ await idbDelete(WORK_STATE_KEY); }catch(_err){}
  localStorage.removeItem(WORK_META_KEY);
  localStorage.removeItem(WORK_FALLBACK_KEY);
  cachedChatFileName = "";
  cachedCoverAsset = null;
  updateAutosaveBadge("캐시 삭제됨");
  showToast("저장된 작업 캐시를 삭제했습니다.");
}
function wireAutosave(){
  document.addEventListener("input", e => {
    if(e.target && e.target.closest && e.target.closest("#toast")) return;
    scheduleAutosave();
  }, true);
  document.addEventListener("change", e => {
    if(e.target === epubCoverInputEl) cacheCoverFile();
    scheduleAutosave();
  }, true);
  document.addEventListener("click", e => {
    if(e.target && e.target.closest && e.target.closest("button,.toggle,.tab,input[type='radio']")) scheduleAutosave();
  }, true);
}
async function cacheCoverFile(){
  const file = epubCoverInputEl && epubCoverInputEl.files && epubCoverInputEl.files[0];
  if(!file) return;
  if(file.size > 8 * 1024 * 1024){
    cachedCoverAsset = null;
    showToast("표지가 커서 자동 저장에서는 제외했습니다.");
    return;
  }
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error("cover read error"));
    reader.readAsDataURL(file);
  });
  cachedCoverAsset = {name:file.name || "cover", type:file.type || "image/jpeg", dataUrl};
}
function dataUrlToUint8Array(dataUrl){
  const m = String(dataUrl || "").match(/^data:([^;,]+)?(;base64)?,(.*)$/);
  if(!m) return new Uint8Array();
  const is64 = !!m[2];
  const raw = is64 ? atob(m[3]) : decodeURIComponent(m[3]);
  return Uint8Array.from(raw, ch => ch.charCodeAt(0));
}

// 탭 전환
document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    activeMode = tab.dataset.tab;
    document.querySelectorAll(".tab").forEach(t => {
      const on = t.dataset.tab === activeMode;
      t.classList.toggle("active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    });
    classicPanel.classList.toggle("hidden", activeMode !== "classic");
    chatPanel.classList.toggle("hidden", activeMode !== "chat");
    if(epubEditPanel) epubEditPanel.classList.toggle("hidden", activeMode !== "epubedit");
    chatOptions.classList.remove("hidden");
    updateModeVisibility();
    transformText();
    scheduleAutosave();
  });
});

// ------------------ 공통 토큰 ------------------
function splitTokens(raw){
  return (raw || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
}
function getProtectTokens(){
  if (!protectEnabledEl.checked) return [];
  return splitTokens(protectTokenEl.value || "");
}
function isProtectedText(t, tokens){
  if (!t || !tokens || tokens.length === 0) return false;
  return tokens.some(tok => tok && t.includes(tok));
}
function getDeleteContainsTokens(){
  if (!deleteContainsEnabledEl.checked) return [];
  return splitTokens(deleteContainsTokenEl.value || "");
}
function shouldDeleteByContains(t, tokens){
  if (!t || !tokens || tokens.length === 0) return false;
  const text = String(t);
  const lowerText = text.toLowerCase();
  return tokens.some(tok => {
    if(!tok) return false;
    const token = String(tok);
    return lowerText.includes(token.toLowerCase());
  });
}
function resetReviewDecisions(){
  duplicateDecisions = {};
  containsDecisions = {};
  oocDecisions = {};
  duplicatePageByGroup = {};
  duplicateGroupPage = 0;
  duplicateFilterText = "";
  duplicateOrderQuery = "";
  oocGroupPage = 0;
  oocFilterText = "";
  oocOrderQuery = "";
}

// ------------------ 기호/구분선 판정 ------------------
function getProtectedChapterSeparators(){
  const out = new Set();
  const sep = chapterSeparatorEl ? String(chapterSeparatorEl.value || "").trim() : "";
  const mode = chapterSplitModeEl ? chapterSplitModeEl.value : "";
  if(sep && mode === "separator") out.add(sep);
  return out;
}
function isProtectedChapterSeparatorLine(line, preserveSet){
  const s = (line || "").trim();
  return !!(s && preserveSet && preserveSet.has(s));
}
function isDecorOnlyLine(line, preserveSet){
  const s=(line||"").trim();
  if(!s) return false;
  if(isProtectedChapterSeparatorLine(s, preserveSet)) return false;
  if(/^[-*_—–]{3,}$/.test(s)) return true;
  if(/^[<>\[\]\(\){}|\\/·•….,:;'"`~!@#$%^&+=-]+$/.test(s)) return true;
  return false;
}
function isDecorOnlyParagraph(p, preserveSet){
  const lines=(p||"").split("\n").map(l=>l.trim()).filter(Boolean);
  if(!lines.length) return false;
  if(lines.some(l => isProtectedChapterSeparatorLine(l, preserveSet))) return false;
  return lines.every(l => isDecorOnlyLine(l, preserveSet));
}
function removeDecorLines(p, preserveSet){
  const kept = (p||"").split("\n").filter(l => !isDecorOnlyLine(l, preserveSet));
  return kept.join("\n").trim();
}
function shouldRemoveCellEmptyLines(){
  return !!(removeCellEmptyLinesEl && removeCellEmptyLinesEl.checked);
}
function normalizeBlankLinesInsideCell(text){
  if(removeEmptyLinesEl.checked || shouldRemoveCellEmptyLines()){
    return String(text || "").replace(/\n\s*\n+/g,"\n");
  }
  return text;
}
function isTableLikeText(t){
  const s = (t || "").trim();
  if (!s) return false;
  const pipeCount = (s.match(/\|/g) || []).length;
  if (pipeCount >= 2) return true;
  if (/^[\s|:.-]{3,}$/.test(s) && s.includes("|")) return true;
  return false;
}

// ------------------ details 제거 (기존 로그용, 보호 키워드 예외) ------------------
function filterDetailsByProtection(text, tokens){
  return (text || "").replace(/<details\b[\s\S]*?<\/details>/gi, (block) => {
    if (!tokens || tokens.length === 0) return "";
    let inner = block
      .replace(/<summary[\s\S]*?<\/summary>/gi, "")
      .replace(/<\/?details[^>]*>/gi, "");
    const paras = inner.split(/\n\s*\n+/).map(p => p.trim()).filter(Boolean);
    const kept = paras.filter(p => isProtectedText(p, tokens));
    if (kept.length === 0) return "";
    return "\n\n" + kept.join("\n\n") + "\n\n";
  })
  .replace(/^\s*<\/?details.*?>\s*$/gim, "")
  .replace(/^\s*<summary.*?>.*?<\/summary>\s*$/gim, "");
}

// ------------------ 별표 지문 파서(기존 로그용) ------------------
function parseChunks(text){
  const s=(text||"").replace(/\r/g,"");
  const out=[];
  let i=0, normal="";

  const flush=()=>{
    if(!normal) return;
    normal.split(/\n\s*\n+/).map(p=>p.trim()).filter(Boolean)
      .forEach((p, idx)=>out.push({id:"classic-" + out.length + "-" + idx, kind:"normal", text:p, owner:"character", color:"", fromTable:false, fromDetails:false, blockId:"classic-" + out.length}));
    normal="";
  };

  while(i<s.length){
    if(s[i]!=="*"){ normal+=s[i++]; continue; }

    flush();
    i++;

    let content="";
    while(i<s.length && s[i]!=="*"){ content+=s[i++]; }
    if(i<s.length && s[i]==="*") i++;

    out.push({id:"classic-" + out.length, kind:"scene", text:content.trim(), owner:"user", color:"", fromTable:false, fromDetails:false, blockId:"classic-" + out.length});

    while(i<s.length && (s[i]===" " || s[i]==="\t" || s[i]==="\n")){
      i++;
      if(i<s.length && s[i]==="*") break;
    }
  }

  flush();
  return out;
}

// ------------------ 따옴표 ------------------
function getQuotes(style){
  if(style==="straight") return ['"', '"'];
  if(style==="doubleCurly") return ['“', '”'];
  if(style==="singleCurly") return ['‘', '’'];
  return ["",""];
}
function isAlreadyQuoted(t){
  const pairs=[['"','"'],['“','”'],['‘','’']];
  return pairs.some(([o,c])=>t.startsWith(o) && t.endsWith(c) && t.length>=2);
}
function getSpeakerName(owner){
  if(owner === "user") return (userNameEl.value || "").trim() || "유저";
  if(owner === "character") return (characterNameEl.value || "").trim() || "캐릭터";
  return "";
}
function getSpeakerMarker(){
  const preset = speakerMarkerPresetEl ? speakerMarkerPresetEl.value : "none";
  if(preset === "none") return "";
  if(preset === "custom") return (speakerMarkerCustomEl.value || "").trim();
  return preset;
}
function wrapColorHTML(text, color){
  const safeColor = /^#[0-9a-f]{6}$/i.test(color || "") ? color : "#17181c";
  return `<span style="color:${safeColor}">${escapeHTML(text)}</span>`;
}
function speakerColorForOwner(owner){
  const fallback = speakerLabelColorEl && speakerLabelColorEl.value ? speakerLabelColorEl.value : "#4f849c";
  const el = owner === "user" ? speakerUserColorEl : owner === "character" ? speakerCharacterColorEl : null;
  const value = el && el.value ? el.value : fallback;
  return /^#[0-9a-f]{6}$/i.test(value || "") ? value : "#4f849c";
}
function makeSpeakerLabel(chunk){
  if(!(activeMode === "chat" || activeMode === "classic")) return "";
  if(!labelSpeakersEl.checked || !chunk.owner) return "";
  const name = getSpeakerName(chunk.owner);
  if(!name) return "";
  const marker = getSpeakerMarker();
  const colorTarget = speakerColorTargetEl ? speakerColorTargetEl.value : "none";
  const color = speakerColorForOwner(chunk.owner);
  if(colorTarget === "marker" && marker){
    return wrapColorHTML(marker, color) + name;
  }
  const label = marker + name;
  if(colorTarget === "all") return wrapColorHTML(label, color);
  return label;
}
function labelChunk(text, chunk, shouldLabel){
  if(!shouldLabel) return text;
  const label = makeSpeakerLabel(chunk);
  if(!label) return text;
  return label + "\n" + text;
}

// ------------------ 로판Ai 저장 파일 불러오기 ------------------
function activateChatTab(){
  activeMode = "chat";
  document.querySelectorAll(".tab").forEach(t => {
    const on = t.dataset.tab === activeMode;
    t.classList.toggle("active", on);
    t.setAttribute("aria-selected", on ? "true" : "false");
  });
  classicPanel.classList.add("hidden");
  chatPanel.classList.remove("hidden");
  if(epubEditPanel) epubEditPanel.classList.add("hidden");
  chatOptions.classList.remove("hidden");
  updateModeVisibility();
}
function readFileAsArrayBuffer(file){
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error("file read error"));
    reader.readAsArrayBuffer(file);
  });
}
function isZipBytes(bytes){
  return bytes && bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b;
}
function decodeBytesSmart(bytes){
  if(bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe){
    return new TextDecoder("utf-16le").decode(bytes);
  }
  if(bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff){
    return new TextDecoder("utf-16be").decode(bytes);
  }
  let text = new TextDecoder("utf-8").decode(bytes);
  const replacementCount = (text.match(/�/g) || []).length;
  if(replacementCount > Math.max(20, text.length * 0.01)){
    try{
      const alt = new TextDecoder("windows-949").decode(bytes);
      if((alt.match(/�/g) || []).length < replacementCount) text = alt;
    }catch(_err){}
  }
  return text.replace(/^\uFEFF/, "");
}
async function loadChatFile(){
  const file = chatFileInput.files && chatFileInput.files[0];
  if(!file) return;

  try{
    const buffer = await readFileAsArrayBuffer(file);
    const bytes = new Uint8Array(buffer);
    const lowerName = (file.name || "").toLowerCase();

    if(isZipBytes(bytes) || /\.zip$/i.test(lowerName)){
      chatFileInput.value = "";
      showToast("ZIP 파일은 변환 대상이 아닙니다. MHT/HTML/Markdown/TXT 파일을 선택해 주세요.");
      return;
    }

    const raw = decodeBytesSmart(bytes);
    const looksMHT = /\.(mht|mhtml)$/i.test(lowerName) || /MIME-Version:\s*1\.0/i.test(raw) || /Content-Type:\s*multipart\/related/i.test(raw);
    const looksHTML = /<!doctype\s+html\b|<html\b|<body\b|<(div|p|span)\b/i.test(raw);
    const looksStructuredMarkdown = /<!--\s*rofan:/i.test(raw) || /\.(md|markdown)$/i.test(lowerName);
    const allowedExt = /\.(mht|mhtml|html|htm|md|markdown|txt)$/i.test(lowerName);

    if(!allowedExt && !looksMHT && !looksHTML && !looksStructuredMarkdown){
      chatFileInput.value = "";
      showToast("지원하지 않는 파일입니다. .mht/.html/.md/.txt 파일을 선택해 주세요.");
      return;
    }

    let sanitized = "";
    if(looksStructuredMarkdown){
      sanitized = structuredMarkdownToHtml(raw) || plainTextToHtml(raw);
    }else if(looksMHT || looksHTML){
      const html = looksMHT ? extractHTMLFromMHT(raw) : raw;
      if(!html || !looksLikeHTML(html)){
        showToast("파일 안에서 HTML 채팅 내용을 찾지 못했습니다.");
        return;
      }
      sanitized = sanitizePastedHTML(extractLikelyChatHTML(html));
    }else{
      sanitized = plainTextToHtml(raw);
    }
    if(!htmlToPlainText(sanitized)){
      showToast("불러온 파일에서 변환할 텍스트를 찾지 못했습니다.");
      return;
    }

    activateChatTab();
    resetReviewDecisions();
    chatPaste.innerHTML = sanitized;
    cachedChatFileName = file.name || "저장 파일";
    transformText();
    updateChapterDividerPanel();
    scheduleAutosave();
    showToast("파일을 불러왔습니다.");
  }catch(err){
    console.error(err);
    showToast("파일을 읽지 못했습니다.");
  }
}
function looksLikeHTML(text){
  return /<!doctype\s+html\b|<html\b|<body\b|<(div|p|span|br|i|em|details|table)\b/i.test(String(text || ""));
}
function extractHTMLFromMHT(raw){
  const text = String(raw || "");
  const boundaryMatch = text.match(/boundary=(?:"([^"]+)"|([^;\r\n]+))/i);
  if(boundaryMatch){
    const boundary = (boundaryMatch[1] || boundaryMatch[2] || "").trim();
    const parts = text.split("--" + boundary);
    const htmlParts = [];
    for(const part of parts){
      const sepMatch = part.match(/\r?\n\r?\n/);
      if(!sepMatch) continue;
      const sepIndex = sepMatch.index;
      const sepLength = sepMatch[0].length;
      const headers = part.slice(0, sepIndex);
      if(!/Content-Type:\s*text\/html\b/i.test(headers)) continue;
      let body = part.slice(sepIndex + sepLength);
      body = body.replace(/\r?\n--\s*$/g, "");
      const encMatch = headers.match(/Content-Transfer-Encoding:\s*([^\r\n]+)/i);
      const enc = encMatch ? encMatch[1].trim().toLowerCase() : "";
      if(enc.includes("base64")) body = decodeBase64UTF8(body);
      else if(enc.includes("quoted-printable")) body = decodeQuotedPrintableUTF8(body);
      htmlParts.push(body);
    }
    if(htmlParts.length){
      htmlParts.sort((a,b) => scoreHTMLPart(b) - scoreHTMLPart(a));
      return htmlParts[0];
    }
  }

  const docMatch = text.match(/<!doctype\s+html[\s\S]*$/i) || text.match(/<html[\s\S]*$/i) || text.match(/<body[\s\S]*$/i);
  return docMatch ? docMatch[0] : text;
}
function scoreHTMLPart(part){
  const s = String(part || "");
  let score = Math.min(s.length, 500000);
  if(/<!doctype\s+html|<html\b/i.test(s)) score += 500000;
  score += (s.match(/data-narration/gi) || []).length * 1000;
  score += (s.match(/class=["'][^"']*mt-1/gi) || []).length * 1000;
  return score;
}
function decodeBase64UTF8(str){
  const cleaned = String(str || "").replace(/\s+/g, "");
  const binary = atob(cleaned);
  const bytes = Uint8Array.from(binary, ch => ch.charCodeAt(0));
  return new TextDecoder("utf-8").decode(bytes);
}
function decodeQuotedPrintableUTF8(str){
  const qp = String(str || "").replace(/=\r?\n/g, "");
  const bytes = [];
  for(let i=0; i<qp.length; i++){
    if(qp[i] === "=" && /^[0-9a-fA-F]{2}$/.test(qp.slice(i+1, i+3))){
      bytes.push(parseInt(qp.slice(i+1, i+3), 16));
      i += 2;
    }else{
      const code = qp.charCodeAt(i);
      if(code <= 0xff) bytes.push(code);
      else{
        const encoded = new TextEncoder().encode(qp[i]);
        encoded.forEach(b => bytes.push(b));
      }
    }
  }
  return new TextDecoder("utf-8").decode(Uint8Array.from(bytes));
}
function extractLikelyChatHTML(html){
  const doc = new DOMParser().parseFromString(html || "", "text/html");
  const scoreContainer = (el) => {
    if(!el) return 0;
    const textLen = (el.innerText || el.textContent || "").length;
    const pCount = el.querySelectorAll ? el.querySelectorAll("p").length : 0;
    const replyCount = el.querySelectorAll ? el.querySelectorAll("div.mt-1").length : 0;
    const narrationCount = el.querySelectorAll ? el.querySelectorAll("[data-narration]").length : 0;
    return replyCount * 100000 + narrationCount * 20000 + pCount * 1000 + Math.min(textLen, 100000);
  };

  const overflowCandidates = Array.from(doc.querySelectorAll("div"))
    .filter(el => /overflow-y-auto/.test(String(el.className || "")));
  if(overflowCandidates.length){
    overflowCandidates.sort((a,b) => scoreContainer(b) - scoreContainer(a));
    const container = overflowCandidates[0];
    const children = Array.from(container.children || []).filter(el => scoreContainer(el) > 0);
    if(children.length){
      children.sort((a,b) => scoreContainer(b) - scoreContainer(a));
      return children[0].innerHTML || children[0].outerHTML;
    }
    return container.innerHTML;
  }

  const candidates = Array.from(doc.querySelectorAll("main, section, article, div"));
  candidates.push(doc.body);
  candidates.sort((a,b) => scoreContainer(b) - scoreContainer(a));
  const best = candidates.find(el => scoreContainer(el) > 0) || doc.body;
  return best ? best.innerHTML : html;
}
function htmlToPlainText(html){
  const temp = document.createElement("div");
  temp.innerHTML = html || "";
  return (temp.innerText || temp.textContent || "").trim();
}

// ------------------ 로판Ai 전체 채팅방 붙여넣기 ------------------
function handleRichPaste(e){
  const data = e.clipboardData || window.clipboardData;
  if(!data) return;

  const html = data.getData("text/html");
  const text = data.getData("text/plain");

  if(html){
    e.preventDefault();
    resetReviewDecisions();
    insertHtmlAtCursor(sanitizePastedHTML(html));
    transformText();
    return;
  }

  if(text){
    e.preventDefault();
    resetReviewDecisions();
    insertHtmlAtCursor(escapeHTML(text).replace(/\n/g,"<br>"));
    transformText();
  }
}
function sanitizePastedHTML(html){
  const doc = new DOMParser().parseFromString(html || "", "text/html");
  doc.querySelectorAll("script,style,meta,link,iframe,object,embed").forEach(n => n.remove());
  doc.body.querySelectorAll("*").forEach(el => {
    [...el.attributes].forEach(attr => {
      const name = attr.name.toLowerCase();
      const value = String(attr.value || "").trim().toLowerCase();
      if(name.startsWith("on")) el.removeAttribute(attr.name);
      if((name === "href" || name === "src") && value.startsWith("javascript:")) el.removeAttribute(attr.name);
    });
  });
  return doc.body.innerHTML;
}
function insertHtmlAtCursor(html){
  chatPaste.focus();
  const selection = window.getSelection();
  if(!selection || selection.rangeCount === 0){
    chatPaste.insertAdjacentHTML("beforeend", html);
    return;
  }
  const range = selection.getRangeAt(0);
  range.deleteContents();
  const temp = document.createElement("div");
  temp.innerHTML = html;
  const frag = document.createDocumentFragment();
  let node, lastNode = null;
  while((node = temp.firstChild)){
    lastNode = frag.appendChild(node);
  }
  range.insertNode(frag);
  if(lastNode){
    range.setStartAfter(lastNode);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }
}
function escapeHTML(str){
  return String(str || "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");
}
function escapeAttr(str){
  return escapeHTML(str).replace(/`/g,"&#096;");
}
function htmlFromResultText(text){
  const escaped = escapeHTML(text || "");
  // 결과창은 안전하게 escape한 뒤, 이 앱이 만든 제한적인 span 색상 태그만 다시 렌더링합니다.
  // HTML/Markdown/EPUB 내보내기에는 raw 값이 그대로 쓰입니다.
  return escaped.replace(/&lt;span\b([\s\S]*?)&gt;([\s\S]*?)&lt;\/span&gt;/gi, (match, rawAttrs, inner) => {
    const attrs = String(rawAttrs || "");
    const colorMatch = attrs.match(/color\s*:\s*(#[0-9a-fA-F]{6})/i);
    const color = colorMatch ? colorMatch[1] : "";
    const ownerMatch = attrs.match(/data-speaker-owner=&quot;([a-zA-Z_-]+)&quot;/i);
    const hasSpeakerClass = /speaker-label/i.test(attrs);
    const attrParts = [];
    if(hasSpeakerClass) attrParts.push('class="speaker-label"');
    if(ownerMatch) attrParts.push(`data-speaker-owner="${escapeAttr(ownerMatch[1])}"`);
    if(color) attrParts.push(`style="color:${color}"`);
    if(!attrParts.length) return inner;
    return `<span ${attrParts.join(" ")}>${inner}</span>`;
  });
}
function resultPreviewFor(el){
  if(el === output) return outputPreview;
  if(el === chatOutput) return chatOutputPreview;
  return null;
}
function syncResultPreview(el){
  const preview = resultPreviewFor(el);
  if(!preview || !el) return;
  const oldScroll = preview.scrollTop;
  preview.innerHTML = htmlFromResultText(el.value || "");
  preview.dataset.placeholder = el.getAttribute("placeholder") || "변환 결과";
  preview.scrollTop = oldScroll;
}
function setResultOutput(el, value){
  if(!el) return;
  el.value = value || "";
  syncResultPreview(el);
}
function getResultOutputScroll(el){
  const preview = resultPreviewFor(el);
  return preview ? preview.scrollTop : (el ? el.scrollTop : 0);
}
function setResultOutputScroll(el, value){
  const preview = resultPreviewFor(el);
  const v = Number(value) || 0;
  if(preview) preview.scrollTop = v;
  if(el) el.scrollTop = v;
}

function syncActiveResultHeight(){
  const panel = activeMode === "chat" ? chatPanel : activeMode === "classic" ? classicPanel : null;
  if(!panel || panel.classList.contains("hidden")) return;
  const left = panel.querySelector(".editorGrid > .editorBox:not(.resultBox)");
  const resultBox = panel.querySelector(".editorGrid > .editorBox.resultBox");
  const preview = resultBox ? resultBox.querySelector(".richResultBox") : null;
  const label = resultBox ? resultBox.querySelector(".editorLabel") : null;
  if(!left || !resultBox || !preview) return;
  const leftHeight = Math.max(360, Math.round(left.getBoundingClientRect().height));
  const labelHeight = label ? Math.ceil(label.getBoundingClientRect().height) : 0;
  resultBox.style.minHeight = leftHeight + "px";
  preview.style.height = Math.max(300, leftHeight - labelHeight - 8) + "px";
}
function isItalicElement(el){
  if(!el || el.nodeType !== 1) return false;
  const dataKind = String(el.getAttribute("data-kind") || "").toLowerCase();
  if(/scene|narration|지문/.test(dataKind)) return true;
  if(/normal|dialogue|대사/.test(dataKind)) return false;
  const tag = el.tagName;
  if(tag === "I" || tag === "EM" || tag === "CITE") return true;
  if(String(el.getAttribute("data-narration") || "").toLowerCase() === "true") return true;

  const style = (el.getAttribute("style") || "").toLowerCase();
  if(/font-style\s*:\s*italic/.test(style)) return true;
  if(/font-style\s*:\s*oblique/.test(style)) return true;

  const className = String(el.className || "").toLowerCase();
  if(/\b(italic|italics|emphasis)\b/.test(className)) return true;

  try{
    const computed = window.getComputedStyle(el);
    if(computed && (computed.fontStyle === "italic" || computed.fontStyle === "oblique")) return true;
  }catch(_err){}

  return false;
}
function isBlockElement(el){
  if(!el || el.nodeType !== 1) return false;
  const blockTags = new Set([
    "ADDRESS","ARTICLE","ASIDE","BLOCKQUOTE","DD","DETAILS","DIALOG","DIV","DL","DT",
    "FIELDSET","FIGCAPTION","FIGURE","FOOTER","FORM","H1","H2","H3","H4","H5","H6",
    "HEADER","HR","LI","MAIN","NAV","OL","P","PRE","SECTION","SUMMARY","TABLE","TBODY",
    "TD","TFOOT","TH","THEAD","TR","UL"
  ]);
  if(blockTags.has(el.tagName)) return true;
  const role = (el.getAttribute("role") || "").toLowerCase();
  return ["article","paragraph","row","table","grid","list","listitem"].includes(role);
}
function isTableElement(el){
  if(!el || el.nodeType !== 1) return false;
  if(["TABLE","TBODY","TFOOT","THEAD","TR","TD","TH","CAPTION","COL","COLGROUP"].includes(el.tagName)) return true;
  const role = (el.getAttribute("role") || "").toLowerCase();
  if(["table","grid","row","cell","columnheader","rowheader"].includes(role)) return true;
  const className = String(el.className || "").toLowerCase();
  if(/\b(table|grid)\b/.test(className)) return true;
  return false;
}
function isRemovableBlockText(text){
  const s = normalizeParagraphText(text || "");
  if(!s) return false;
  if(/^🩸?\s*기록지/.test(s) || /^기록지/.test(s)) return true;
  if(isTableLikeText(s)) return true;
  return false;
}
function isRemovableBlockElement(el){
  if(!el || el.nodeType !== 1) return false;
  if(isTableElement(el)) return true;
  const text = (el.innerText || el.textContent || "").trim();
  if(/^🩸?\s*기록지/.test(text) || /^기록지/.test(text)) return true;
  return false;
}
function isSkippableElement(el){
  if(!el || el.nodeType !== 1) return false;
  if(["SCRIPT","STYLE","META","LINK","NOSCRIPT","IFRAME","OBJECT","EMBED","SVG","CANVAS","BUTTON","INPUT","TEXTAREA","SELECT","OPTION"].includes(el.tagName)) return true;
  const ariaHidden = (el.getAttribute("aria-hidden") || "").toLowerCase();
  const hidden = el.hasAttribute("hidden") || ariaHidden === "true";
  if(hidden) return true;
  const className = String(el.className || "").toLowerCase();
  if(/(^|\s)(select-none|sr-only|hidden|invisible)(\s|$)/.test(className)) return true;
  const style = String(el.getAttribute("style") || "").toLowerCase().replace(/\s+/g, "");
  if(/display:none/.test(style) || /visibility:hidden/.test(style)) return true;
  const title = el.getAttribute("title") || "";
  if(["북마크 추가", "분기 생성"].includes(title)) return true;
  return false;
}
function normalizeParagraphText(text){
  return (text || "")
    .replace(/\u00a0/g," ")
    .replace(/[ \t]+/g," ")
    .replace(/\s+([,.!?;:])/g,"$1")
    .trim();
}
function normalizeColorValue(value){
  let v = String(value || "").trim().replace(/!important/ig, "");
  if(!v) return "";
  const hex = v.match(/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
  if(hex){
    let h = hex[1];
    if(h.length === 3) h = h.split("").map(ch => ch + ch).join("");
    if(h.length === 8) h = h.slice(0,6);
    return "#" + h.toUpperCase();
  }
  const rgb = v.match(/^rgba?\(([^)]+)\)$/i);
  if(rgb){
    const nums = rgb[1].split(",").slice(0,3).map(x => Math.max(0, Math.min(255, parseInt(x, 10) || 0)));
    if(nums.length === 3) return "#" + nums.map(n => n.toString(16).padStart(2,"0")).join("").toUpperCase();
  }
  const named = {white:"#FFFFFF", black:"#000000", yellow:"#FFFF00", gray:"#808080", grey:"#808080"};
  return named[v.toLowerCase()] || v.toLowerCase();
}
function getInlineColor(el){
  if(!el || el.nodeType !== 1) return "";
  const style = el.getAttribute("style") || "";
  const colorMatch = style.match(/(?:^|;)\s*color\s*:\s*([^;]+)/i);
  if(colorMatch) return normalizeColorValue(colorMatch[1]);
  const colorAttr = el.getAttribute("color");
  if(colorAttr) return normalizeColorValue(colorAttr);
  const className = String(el.className || "");
  const arbitrary = className.match(/text-\[#([0-9a-f]{3,8})\]/i);
  if(arbitrary) return normalizeColorValue("#" + arbitrary[1]);
  const cls = className.toLowerCase();
  if(/\btext-white\b/.test(cls)) return "#FFFFFF";
  if(/\btext-indigo-400\b/.test(cls)) return "#818CF8";
  if(/\btext-yellow-400\b/.test(cls)) return "#FACC15";
  if(/\btext-neutral-400\b|\btext-zinc-400\b/.test(cls)) return "#A3A3A3";
  if(/\btext-neutral-200\b|\btext-zinc-200\b/.test(cls)) return "#E5E5E5";
  return "";
}
function ownerFromColor(color, className){
  const c = normalizeColorValue(color || "");
  const cls = String(className || "").toLowerCase();
  if(["#818CF8", "#A3A3A3", "#A5B4FC", "#6366F1"].includes(c)) return "user";
  if(["#FFFFFF", "#FFC200", "#FACC15", "#EAB308", "#FEF08A", "#E5E5E5"].includes(c)) return "character";
  if(/\btext-indigo-/.test(cls)) return "user";
  if(/\btext-white\b|\btext-yellow-|\btext-amber-/.test(cls)) return "character";
  return "";
}
function ownerLabel(owner){
  if(owner === "user") return getSpeakerName("user");
  if(owner === "character") return getSpeakerName("character");
  return "구분 없음";
}
function getElementKindHint(el){
  if(!el || el.nodeType !== 1) return "";
  const dataKind = String(el.getAttribute("data-kind") || "").toLowerCase();
  if(/scene|narration|지문/.test(dataKind)) return "scene";
  if(/normal|dialogue|대사/.test(dataKind)) return "normal";
  return "";
}
function getElementBlockId(el){
  if(!el || el.nodeType !== 1) return "";
  return (el.getAttribute("data-block-id") || el.getAttribute("data-block") || "").trim();
}

function getElementOwnerHint(el, color){
  if(!el || el.nodeType !== 1) return "";
  const dataOwner = String(el.getAttribute("data-owner") || "").toLowerCase();
  if(/user|human|me|내|유저/.test(dataOwner)) return "user";
  if(/assistant|ai|character|bot|캐릭터/.test(dataOwner)) return "character";
  const author = String(el.getAttribute("data-author") || el.getAttribute("data-message-author") || el.getAttribute("data-role") || "").toLowerCase();
  if(/user|human|me|내|유저/.test(author)) return "user";
  if(/assistant|ai|character|bot|캐릭터/.test(author)) return "character";
  const className = String(el.className || "");
  if(/(^|\s)mt-1(\s|$)/.test(className)) return "character";

  // 로판Ai 저장본은 같은 p 태그 안에서도 글자색으로 유저/캐릭터 시점이 갈립니다.
  // 그래서 p 태그를 무조건 유저로 보지 않고, 색상 단서를 먼저 믿습니다.
  const byColor = ownerFromColor(color, className);
  if(byColor) return byColor;

  if(el.tagName === "P") return "user";
  return "";
}
function isUiOnlyText(text){
  const s = normalizeParagraphText(text);
  if(!s) return true;
  if(/^\d+\s*\/\s*\d+$/.test(s)) return true;
  if(/^(복사|삭제|수정|북마크|분기|다시 생성|재생성)$/.test(s)) return true;
  return false;
}
function hasSkippableAncestor(el, root){
  let cur = el.parentElement;
  while(cur && cur !== root){
    if(isSkippableElement(cur)) return true;
    cur = cur.parentElement;
  }
  return false;
}
function collectRofanContentBlocks(root){
  const blocks = [];
  // 기본 대화는 p / div.mt-1로 잡히지만, MHT 저장본의 첫 캐릭터 메시지는
  // p로 감싸지지 않고 색상 span만 있는 경우가 있어 함께 후보에 넣습니다.
  // 부모 p가 이미 잡힌 span은 아래 contains 검사로 중복 제거됩니다.
  const candidates = Array.from(root.querySelectorAll('[data-owner][data-kind], .rofan-block, p, div.mt-1, span[style*="color"], div[style*="color"]'));
  candidates.forEach((el, index) => {
    if(blocks.some(b => b.el.contains(el))) return;
    if(isSkippableElement(el) || hasSkippableAncestor(el, root)) return;
    const text = normalizeParagraphText(el.innerText || el.textContent || "");
    if(isUiOnlyText(text)) return;
    const color = getInlineColor(el);
    const owner = getElementOwnerHint(el, color);
    if(!owner) return;

    // 같은 색상 span 안에 실제 문단 전체가 있고, 그 안에 장식용 작은 span이 다시 들어가는 구조가 많습니다.
    // 이미 선택된 더 큰 메시지 후보 안의 요소는 건너뛰고, 반대로 현재 요소가 앞서 잡은 작은 조각을 포함하면
    // 큰 메시지를 남기도록 작은 조각을 제거합니다.
    for(let i=blocks.length-1; i>=0; i--){
      if(el.contains(blocks[i].el)){
        blocks.splice(i, 1);
      }
    }
    blocks.push({el, owner, index});
  });
  return blocks;
}
function parseRofanChatChunks(root){
  const chunks = [];
  const blocks = [];
  let chunkSeq = 0;
  let blockSeq = 0;

  const pushChunksFromElement = (el, baseOwner) => {
    const blockId = getElementBlockId(el) || ("b" + (blockSeq++));
    const baseKind = getElementKindHint(el);
    const start = chunks.length;
    let buffer = "";
    let bufferKind = null;
    let bufferOwner = baseOwner || "";
    let bufferColor = "";
    let bufferFromTable = false;
    let bufferFromDetails = false;

    const flush = () => {
      const text = normalizeParagraphText(buffer);
      if(text){
        chunks.push({
          id: "c" + (chunkSeq++),
          kind: bufferKind || baseKind || "normal",
          text,
          owner: bufferOwner || "",
          color: bufferColor || "",
          fromTable: bufferFromTable,
          fromDetails: bufferFromDetails,
          blockId
        });
      }
      buffer = "";
      bufferKind = null;
      bufferOwner = baseOwner || "";
      bufferColor = "";
      bufferFromTable = false;
      bufferFromDetails = false;
    };

    const addInlineText = (text, ctx) => {
      const raw = String(text || "").replace(/\r/g,"");
      if(!raw) return;
      const kind = ctx.kind || (ctx.italic ? "scene" : "normal");
      const owner = ctx.owner || ownerFromColor(ctx.color, "") || "";
      const parts = raw.split("\n");
      parts.forEach((part, idx) => {
        const normalized = part.replace(/\u00a0/g," ").replace(/[ \t]+/g," ");
        if(normalized){
          if(buffer && ((bufferKind && bufferKind !== kind) || (bufferOwner && owner && bufferOwner !== owner))) flush();
          if(!bufferKind) bufferKind = kind;
          if(!bufferOwner && owner) bufferOwner = owner;
          if(!bufferColor && ctx.color) bufferColor = ctx.color;
          buffer += normalized;
          if(ctx.fromTable) bufferFromTable = true;
          if(ctx.fromDetails) bufferFromDetails = true;
        }
        if(idx < parts.length - 1) flush();
      });
    };

    const walk = (node, ctx) => {
      if(!node) return;
      if(node.nodeType === Node.TEXT_NODE){
        addInlineText(node.nodeValue, ctx);
        return;
      }
      if(node.nodeType !== Node.ELEMENT_NODE) return;

      const childEl = node;
      if(isSkippableElement(childEl)) return;

      if(childEl.tagName === "BR"){
        flush();
        return;
      }

      const color = getInlineColor(childEl) || ctx.color || "";
      const ownerHint = getElementOwnerHint(childEl, color);
      const nextCtx = {
        italic: ctx.italic || isItalicElement(childEl),
        kind: getElementKindHint(childEl) || ctx.kind || "",
        fromTable: ctx.fromTable || isRemovableBlockElement(childEl),
        fromDetails: ctx.fromDetails || childEl.tagName === "DETAILS",
        owner: ownerHint || ctx.owner || "",
        color
      };

      const block = isBlockElement(childEl) && childEl !== el;
      if(block) flush();
      Array.from(childEl.childNodes).forEach(child => walk(child, nextCtx));
      if(block) flush();
    };

    Array.from(el.childNodes).forEach(child => walk(child, {
      italic: isItalicElement(el),
      kind: baseKind || "",
      fromTable: isRemovableBlockElement(el),
      fromDetails: el.tagName === "DETAILS",
      owner: baseOwner || getElementOwnerHint(el, getInlineColor(el)) || "",
      color: getInlineColor(el) || ""
    }));
    flush();

    const blockText = chunks.slice(start).map(c => c.text).join("\n\n").trim();
    if(blockText){
      blocks.push({id:blockId, owner:baseOwner || "", text:blockText, startChunk:start, endChunk:chunks.length});
    }else{
      chunks.splice(start);
    }
  };

  const semanticBlocks = collectRofanContentBlocks(root);
  if(semanticBlocks.length){
    semanticBlocks.forEach(block => pushChunksFromElement(block.el, block.owner));
  }else{
    pushChunksFromElement(root, "");
  }

  const mergedBlocks = mergeRofanBlocksById(blocks, chunks);
  blocks.splice(0, blocks.length, ...mergedBlocks);
  preserveLeadingCharacterBlocks(blocks, chunks);
  const responseBlocks = normalizeResponseBlocks(blocks, chunks);
  blocks.splice(0, blocks.length, ...responseBlocks);
  return {chunks, blocks};
}

function mergeRofanBlocksById(blocks, chunks){
  if(!blocks || !blocks.length) return blocks || [];
  const map = new Map();
  const order = [];
  blocks.forEach(block => {
    const id = block && block.id;
    if(!id) return;
    if(!map.has(id)){
      map.set(id, {id, owner:block.owner || "", text:"", startChunk:block.startChunk, endChunk:block.endChunk});
      order.push(id);
    }else{
      const cur = map.get(id);
      if(!cur.owner && block.owner) cur.owner = block.owner;
      cur.startChunk = Math.min(cur.startChunk, block.startChunk);
      cur.endChunk = Math.max(cur.endChunk, block.endChunk);
    }
  });
  return order.map(id => {
    const b = map.get(id);
    const related = (chunks || []).filter(c => c.blockId === id);
    if(related.length){
      b.owner = b.owner || (related.find(c => c.owner) || {}).owner || "";
      b.text = related.map(c => c.text).filter(Boolean).join("\n\n").trim();
      const positions = related.map(c => (chunks || []).indexOf(c)).filter(i => i >= 0);
      if(positions.length){ b.startChunk = Math.min(...positions); b.endChunk = Math.max(...positions) + 1; }
    }
    return b;
  }).filter(b => b.text);
}

function preserveLeadingCharacterBlocks(blocks, chunks){
  // 채팅방 맨 앞의 인트로/첫 답변은 캐릭터 발화인 경우가 많습니다.
  // 색상이나 구조 때문에 유저 p로 들어온 선행 블록은 첫 실제 유저 입력 전 캐릭터 블록으로 보정합니다.
  if(!blocks || !blocks.length) return;
  const firstCharacterIndex = blocks.findIndex(b => b.owner === "character");
  if(firstCharacterIndex <= 0) return;
  for(let i=0; i<firstCharacterIndex; i++){
    const block = blocks[i];
    if(block.owner !== "user") continue;
    const slice = chunks.slice(block.startChunk, block.endChunk);
    const hasCharacterColor = slice.some(c => ownerFromColor(c.color, "") === "character");
    const allScene = slice.length && slice.every(c => c.kind === "scene");
    if(hasCharacterColor || allScene){
      block.owner = "character";
      slice.forEach(c => { c.owner = "character"; });
    }
  }
}

function isLikelyChapterSeparatorText(text){
  const clean = String(text || "").replace(/<[^>]*>/g, "").replace(/\s+/g, "").trim();
  if(!clean) return false;
  return /^[\-—―─━_]{3,}$/.test(clean);
}

function normalizeResponseBlocks(blocks, chunks){
  if(!Array.isArray(blocks) || !blocks.length) return blocks || [];
  const sorted = blocks.slice().sort((a,b)=>(a.startChunk||0)-(b.startChunk||0));
  const grouped = [];
  let current = null;
  let seq = 0;
  const finish = () => {
    if(!current) return;
    const related = chunks.slice(current.startChunk, current.endChunk).filter(Boolean);
    current.text = related.map(c => c.text).filter(Boolean).join("\n\n").trim();
    const owners = related.map(c => c.owner).filter(Boolean);
    current.owner = current.owner || owners[0] || "";
    if(current.text) grouped.push(current);
    current = null;
  };
  sorted.forEach(block => {
    const start = Math.max(0, block.startChunk || 0);
    const end = Math.max(start, block.endChunk || start);
    const related = chunks.slice(start, end).filter(Boolean);
    const owner = block.owner || (related.find(c => c.owner) || {}).owner || "";
    const text = related.map(c => c.text).filter(Boolean).join("\n\n").trim();
    const separator = isLikelyChapterSeparatorText(text);
    const canMerge = current && !separator && owner && current.owner === owner && current.endChunk === start;
    if(!canMerge) finish();
    if(!current){
      current = {id:`rb${seq++}`, owner, text:"", startChunk:start, endChunk:end};
    }else{
      current.endChunk = Math.max(current.endChunk, end);
    }
    const id = current.id;
    for(let i=start; i<end; i++){
      if(chunks[i]) chunks[i].blockId = id;
    }
    if(separator){
      finish();
    }
  });
  finish();
  return grouped;
}

function normalizeChunkResponseBlocks(chunks){
  if(!Array.isArray(chunks) || !chunks.length) return chunks || [];
  let seq = 0;
  let currentId = "";
  let currentOwner = "";
  chunks.forEach(chunk => {
    const owner = chunk.owner || "character";
    const separator = isLikelyChapterSeparatorText(chunk.text);
    if(!currentId || separator || owner !== currentOwner){
      currentId = `md-rb${seq++}`;
      currentOwner = owner;
    }
    chunk.blockId = currentId;
    if(separator){
      currentId = "";
      currentOwner = "";
    }
  });
  return chunks;
}

// ------------------ 중복/삭제 확인 패널 ------------------
function normalizeForCompare(text){
  return String(text || "")
    .replace(/\s+/g, "")
    .replace(/[“”‘’"']/g, "")
    .trim();
}
function hashString(str){
  let h = 2166136261;
  const s = String(str || "");
  for(let i=0; i<s.length; i++){
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}
function previewText(text, limit){
  // 중복 후보 검토에서는 내용을 확인해야 하므로 뒤를 생략하지 않고 전체를 보여준다.
  return normalizeParagraphText(text || "");
}
function findNextAnswerBlock(blocks, index){
  for(let i=index + 1; i<blocks.length; i++){
    if(blocks[i].owner === "character") return blocks[i];
    if(blocks[i].owner === "user") return null;
  }
  return null;
}
function findNextUserBlockAfter(blocks, block){
  if(!block) return null;
  const index = blocks.findIndex(b => b && b.id === block.id);
  if(index < 0) return null;
  for(let i=index + 1; i<blocks.length; i++){
    if(blocks[i].owner === "user") return blocks[i];
  }
  return null;
}
function findPrevUserBlock(blocks, index){
  for(let i=index - 1; i>=0; i--){
    if(blocks[i].owner === "user") return blocks[i];
    if(blocks[i].owner === "character") return null;
  }
  return null;
}
function splitSentencesForCompare(text){
  return String(text || "")
    .replace(/([.!?。！？]|[다요죠까네군니다]\.)/g, "$1\n")
    .split(/\n|(?<=[.!?。！？])\s+/)
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => normalizeForCompare(s))
    .filter(s => s.length >= 8);
}
function overlapSentenceCount(a, b){
  const aSet = new Set(splitSentencesForCompare(a));
  const bList = splitSentencesForCompare(b);
  let count = 0;
  bList.forEach(s => { if(aSet.has(s)) count++; });
  return count;
}
function promptRepresentative(prompts){
  const map = new Map();
  prompts.forEach(p => {
    const key = normalizeForCompare(p.text);
    if(!map.has(key)) map.set(key, {text:p.text, count:0, length:p.text.length});
    const item = map.get(key);
    item.count++;
    if(p.text.length > item.length){ item.text = p.text; item.length = p.text.length; }
  });
  return Array.from(map.values()).sort((a,b) => b.count - a.count || b.length - a.length)[0]?.text || prompts[0]?.text || "";
}
function buildDuplicateAnswerGroups(blocks){
  const promptOccurrences = [];
  blocks.forEach((block, index) => {
    if(block.owner !== "user") return;
    const norm = normalizeForCompare(block.text);
    if(norm.length < 30) return;
    const answer = findNextAnswerBlock(blocks, index);
    if(!answer) return;
    promptOccurrences.push({promptBlock:block, answerBlock:answer, promptNorm:norm});
  });

  const parent = Array.from({length:promptOccurrences.length}, (_,i)=>i);
  const find = (x) => parent[x] === x ? x : (parent[x] = find(parent[x]));
  const unite = (a,b) => { const ra=find(a), rb=find(b); if(ra!==rb) parent[rb]=ra; };
  for(let i=0; i<promptOccurrences.length; i++){
    for(let j=i+1; j<promptOccurrences.length; j++){
      if(promptOccurrences[i].promptNorm === promptOccurrences[j].promptNorm || overlapSentenceCount(promptOccurrences[i].promptBlock.text, promptOccurrences[j].promptBlock.text) >= 2){
        unite(i,j);
      }
    }
  }
  const promptMap = new Map();
  promptOccurrences.forEach((occ, idx) => {
    const r = find(idx);
    if(!promptMap.has(r)) promptMap.set(r, []);
    promptMap.get(r).push(occ);
  });
  const promptGroups = Array.from(promptMap.values())
    .filter(list => list.length > 1)
    .map(list => {
      const keySeed = list.map(o => o.promptBlock.id).join("|");
      return {key:"prompt-" + hashString(keySeed), type:"prompt", promptText:promptRepresentative(list.map(o => o.promptBlock)), occurrences:list.map(o => ({...o, nextUserBlock: findNextUserBlockAfter(blocks, o.answerBlock)}))};
    });

  const coveredAnswerIds = new Set();
  promptGroups.forEach(g => g.occurrences.forEach(o => coveredAnswerIds.add(o.answerBlock.id)));

  const answerGroups = new Map();
  blocks.forEach((block, index) => {
    if(block.owner !== "character" || coveredAnswerIds.has(block.id)) return;
    const norm = normalizeForCompare(block.text);
    if(norm.length < 80) return;
    const key = "answer-" + hashString(norm);
    if(!answerGroups.has(key)) answerGroups.set(key, {key, type:"answer", promptText:block.text, occurrences:[]});
    answerGroups.get(key).occurrences.push({promptBlock:findPrevUserBlock(blocks, index), answerBlock:block, nextUserBlock:findNextUserBlockAfter(blocks, block)});
  });

  return promptGroups.concat(Array.from(answerGroups.values()).filter(g => g.occurrences.length > 1)).slice(0, 80);
}
function getDroppedBlockIdsFromDuplicateDecisions(groups){
  const dropped = new Set();
  groups.forEach(group => {
    const decision = duplicateDecisions[group.key] || "all";
    if(decision === "all") return;
    group.occurrences.forEach(occ => {
      const keepId = occ.answerBlock ? occ.answerBlock.id : (occ.promptBlock ? occ.promptBlock.id : "");
      if(keepId === decision) return;
      if(occ.promptBlock) dropped.add(occ.promptBlock.id);
      if(occ.answerBlock) dropped.add(occ.answerBlock.id);
    });
  });
  return dropped;
}
function groupMatchesDuplicateFilter(group, idx){
  const keyword = normalizeParagraphText(duplicateFilterText || "").toLowerCase();
  const order = String(duplicateOrderQuery || "").trim();
  if(order){
    const n = Number(order);
    if(Number.isFinite(n) && n > 0 && (idx + 1) !== n) return false;
  }
  if(!keyword) return true;
  const hay = [group.promptText || ""];
  (group.occurrences || []).forEach(occ => {
    if(occ.promptBlock) hay.push(occ.promptBlock.text || "");
    if(occ.answerBlock) hay.push(occ.answerBlock.text || "");
  });
  return hay.join("\n").toLowerCase().includes(keyword);
}
function getFilteredDuplicateGroups(){
  return (currentDuplicateGroups || []).map((group, index) => ({group, index})).filter(item => groupMatchesDuplicateFilter(item.group, item.index));
}
function updateDuplicateReviewPanel(groups){
  currentDuplicateGroups = groups || [];
  if(activeMode !== "chat" || !reviewDuplicatesEl.checked){
    duplicateReviewPanel.classList.add("hidden");
    duplicateReviewPanel.innerHTML = "";
    return;
  }
  if(!currentDuplicateGroups.length){
    duplicateReviewPanel.classList.remove("hidden");
    duplicateReviewPanel.innerHTML = `<div class="reviewHead"><div><div class="reviewTitle">중복 답변 확인</div><div class="reviewMeta">같은 입력이나 같은 답변이 반복된 후보를 찾지 못했습니다.</div></div></div>`;
    return;
  }

  const filtered = getFilteredDuplicateGroups();
  const total = currentDuplicateGroups.length;
  const count = filtered.length;
  duplicateGroupPage = Math.max(0, Math.min(Math.max(0, count - 1), duplicateGroupPage || 0));

  let html = `<div class="reviewHead"><div><div class="reviewTitle">중복 답변 확인</div><div class="reviewMeta">한 묶음씩 넘겨 보며 선택합니다.</div></div><div class="smallMuted">${count}/${total}묶음</div></div>`;
  html += `<div class="reviewSearchBar"><input type="search" data-dupe-search="keyword" placeholder="후보 내용 검색" value="${escapeAttr(duplicateFilterText)}"><input type="number" min="1" data-dupe-search="order" placeholder="순서" value="${escapeAttr(duplicateOrderQuery)}"><button type="button" class="btn primary" data-dupe-search-apply="1">검색</button><button type="button" class="btn subtle" data-dupe-search-clear="1">초기화</button></div>`;

  if(!count){
    html += `<div class="emptyState">검색 조건에 맞는 중복 후보가 없습니다.</div>`;
    duplicateReviewPanel.classList.remove("hidden");
    duplicateReviewPanel.innerHTML = html;
    return;
  }

  const wrap = filtered[duplicateGroupPage];
  const group = wrap.group;
  const gIdx = wrap.index;
  const selected = duplicateDecisions[group.key] || "all";
  const current = Math.max(0, Math.min(group.occurrences.length - 1, duplicatePageByGroup[group.key] || 0));
  duplicatePageByGroup[group.key] = current;
  const occ = group.occurrences[current];
  const answer = occ.answerBlock || occ.promptBlock;
  const answerId = answer ? answer.id : "";
  const title = group.type === "prompt" ? "같은 입력에 대한 답변 후보" : "반복된 답변 후보";
  const prevGroupDisabled = duplicateGroupPage <= 0 ? "disabled" : "";
  const nextGroupDisabled = duplicateGroupPage >= count - 1 ? "disabled" : "";
  const prevCandDisabled = current <= 0 ? "disabled" : "";
  const nextCandDisabled = current >= group.occurrences.length - 1 ? "disabled" : "";

  html += `<div class="dupeCard">`;
  html += `<div class="reviewNav"><div><div class="reviewTitle">${title}</div><div class="reviewMeta">전체 ${gIdx + 1}/${total} · 검색 결과 ${duplicateGroupPage + 1}/${count} · 후보 ${group.occurrences.length}개</div></div><div class="navButtons"><button type="button" class="navIconBtn" data-dupe-group-page="prev" ${prevGroupDisabled} aria-label="이전 묶음">‹</button><button type="button" class="navIconBtn" data-dupe-group-page="next" ${nextGroupDisabled} aria-label="다음 묶음">›</button></div></div>`;
  const nextUser = occ.nextUserBlock || findNextUserBlockAfter((currentParsedBlocks || []), answer);
  const nextUserHtml = nextUser
    ? `<details class="nextPromptFold"><summary><span class="nextFoldIcon">›</span><span>유저 다음 지문</span></summary><div class="previewText fullPreview nextPreview">${escapeHTML(nextUser.text || "")}</div></details>`
    : `<details class="nextPromptFold"><summary><span class="nextFoldIcon">›</span><span>유저 다음 지문</span></summary><div class="emptyState nextEmpty">다음 유저 지문이 없습니다.</div></details>`;
  html += `<div class="dupeCompareGrid">`;
  html += `<div class="reviewBlock"><div class="dupeSummary"><span class="pill">연결 유저 지문</span><span class="pill">${current + 1}/${group.occurrences.length}</span></div><div class="previewText fullPreview">${escapeHTML(occ.promptBlock ? occ.promptBlock.text : "")}</div>${nextUserHtml}</div>`;
  html += `<div class="reviewBlock"><div class="dupeSummary withNav"><span><span class="pill">${escapeHTML(ownerLabel(answer ? answer.owner : ""))}</span><span class="pill">답변 후보 ${current + 1}/${group.occurrences.length}</span></span><span class="navButtons"><button type="button" class="navIconBtn" data-dupe-page="prev" data-dupe-key="${escapeAttr(group.key)}" ${prevCandDisabled} aria-label="이전 후보">‹</button><button type="button" class="navIconBtn" data-dupe-page="next" data-dupe-key="${escapeAttr(group.key)}" ${nextCandDisabled} aria-label="다음 후보">›</button></span></div><div class="previewText fullPreview">${escapeHTML(answer ? answer.text : "")}</div></div>`;
  html += `</div>`;
  html += `<div class="reviewChoices choiceRow"><label class="reviewChoice"><input type="radio" name="dupe_${escapeAttr(group.key)}" data-dupe-key="${escapeAttr(group.key)}" value="all" ${selected === "all" ? "checked" : ""}>모두 유지</label><label class="reviewChoice"><input type="radio" name="dupe_${escapeAttr(group.key)}" data-dupe-key="${escapeAttr(group.key)}" value="${escapeAttr(answerId)}" ${selected === answerId ? "checked" : ""}>현재 후보만 유지</label></div>`;
  html += `</div>`;

  duplicateReviewPanel.classList.remove("hidden");
  duplicateReviewPanel.innerHTML = html;
}
function handleDuplicateReviewChange(e){
  const target = e.target;
  if(!target || !target.matches('input[type="radio"][data-dupe-key]')) return;
  duplicateDecisions[target.dataset.dupeKey] = target.value;
  transformText();
}
function handleDuplicateReviewClick(e){
  const apply = e.target.closest("button[data-dupe-search-apply]");
  if(apply){
    duplicateGroupPage = 0;
    updateDuplicateReviewPanel(currentDuplicateGroups);
    return;
  }
  const clear = e.target.closest("button[data-dupe-search-clear]");
  if(clear){
    duplicateFilterText = "";
    duplicateOrderQuery = "";
    duplicateGroupPage = 0;
    updateDuplicateReviewPanel(currentDuplicateGroups);
    return;
  }
  const groupButton = e.target.closest("button[data-dupe-group-page]");
  if(groupButton && !groupButton.disabled){
    const filtered = getFilteredDuplicateGroups();
    const max = Math.max(0, filtered.length - 1);
    duplicateGroupPage = groupButton.dataset.dupeGroupPage === "next" ? Math.min(max, duplicateGroupPage + 1) : Math.max(0, duplicateGroupPage - 1);
    updateDuplicateReviewPanel(currentDuplicateGroups);
    return;
  }
  const button = e.target.closest("button[data-dupe-page]");
  if(!button || button.disabled) return;
  const key = button.dataset.dupeKey;
  const group = currentDuplicateGroups.find(g => g.key === key);
  if(!group) return;
  const max = Math.max(0, group.occurrences.length - 1);
  const cur = Math.max(0, Math.min(max, duplicatePageByGroup[key] || 0));
  duplicatePageByGroup[key] = button.dataset.dupePage === "next" ? Math.min(max, cur + 1) : Math.max(0, cur - 1);
  updateDuplicateReviewPanel(currentDuplicateGroups);
}
function handleDuplicateReviewInput(e){
  const target = e.target;
  if(!target) return;
  if(target.matches('[data-dupe-search="keyword"]')){
    duplicateFilterText = target.value || "";
  }else if(target.matches('[data-dupe-search="order"]')){
    duplicateOrderQuery = target.value || "";
  }
}
function handleDuplicateReviewKeydown(e){
  const target = e.target;
  if(!target || !target.matches('[data-dupe-search]') || e.key !== "Enter") return;
  e.preventDefault();
  duplicateGroupPage = 0;
  updateDuplicateReviewPanel(currentDuplicateGroups);
}
function getChunkKey(chunk, index){
  return "chunk-" + (chunk.blockId || "x") + "-" + hashString((chunk.owner || "") + "|" + (chunk.kind || "") + "|" + normalizeForCompare(chunk.text)) + "-" + index;
}
function getContainsGroupKey(chunk){
  return "contains-" + hashString((chunk.owner || "") + "|" + (chunk.kind || "") + "|" + String(chunk.text || ""));
}
function getContainsSnippet(text){
  const t = normalizeParagraphText(text || "");
  if(!t) return "빈 문단";
  return t.length > 25 ? t.slice(0, 25) + "…" : t;
}
function getTokenKey(token){
  return "token-" + hashString(String(token || "").toLowerCase());
}
function tokenMatchesText(text, token){
  if(!text || !token) return false;
  return String(text).toLowerCase().includes(String(token).toLowerCase());
}
function buildContainsReviewItems(chunks, dropBlockIds, deleteTokens, dropChunkIds){
  const tokens = getProtectTokens();
  if(!deleteContainsEnabledEl.checked || deleteContainsModeEl.value !== "review" || !deleteTokens.length) return [];
  const tokenGroups = new Map();
  deleteTokens.forEach(rawToken => {
    const token = String(rawToken || "").trim();
    if(!token) return;
    const tokenKey = getTokenKey(token);
    if(!tokenGroups.has(tokenKey)) tokenGroups.set(tokenKey, { token, tokenKey, rows:new Map(), count:0 });
  });

  chunks.map((chunk, index) => ({chunk, index, key:getChunkKey(chunk, index), groupKey:getContainsGroupKey(chunk)}))
    .filter(item => !dropBlockIds.has(item.chunk.blockId))
    .filter(item => !(dropChunkIds && dropChunkIds.has(item.chunk.id)))
    .filter(item => !isProtectedText(item.chunk.text, tokens))
    .forEach(item => {
      deleteTokens.forEach(rawToken => {
        const token = String(rawToken || "").trim();
        if(!token || !tokenMatchesText(item.chunk.text, token)) return;
        const tokenKey = getTokenKey(token);
        const group = tokenGroups.get(tokenKey);
        if(!group) return;
        if(!group.rows.has(item.groupKey)) group.rows.set(item.groupKey, {...item, count:0, keys:[]});
        const row = group.rows.get(item.groupKey);
        row.count++;
        row.keys.push(item.key);
        group.count++;
      });
    });

  return Array.from(tokenGroups.values())
    .map(group => ({...group, rows:Array.from(group.rows.values())}))
    .filter(group => group.rows.length > 0);
}
function updateContainsReviewPanel(items){
  currentContainsItems = items || [];
  if(!deleteContainsEnabledEl.checked || deleteContainsModeEl.value !== "review"){
    containsReviewPanel.classList.add("hidden");
    containsReviewPanel.innerHTML = "";
    return;
  }
  if(!currentContainsItems.length){
    containsReviewPanel.classList.remove("hidden");
    containsReviewPanel.innerHTML = `<div class="reviewHead"><div><div class="reviewTitle">특정 글자 포함 문단 확인</div><div class="reviewMeta">현재 키워드에 걸리는 문단이 없습니다.</div></div></div>`;
    return;
  }

  const totalRows = currentContainsItems.reduce((sum, group) => sum + group.rows.length, 0);
  const totalHits = currentContainsItems.reduce((sum, group) => sum + group.count, 0);
  let html = `<div class="reviewHead"><div><div class="reviewTitle">특정 글자 포함 문단 확인</div><div class="reviewMeta">키워드별로 묶었습니다. 접힌 상태에서도 남김/삭제를 고를 수 있습니다. ${totalRows}개 묶음 · ${totalHits}개 감지</div></div><div class="bulkButtons"><button type="button" class="btn subtle" data-contains-bulk="keep">모두 남김</button><button type="button" class="btn subtle warn" data-contains-bulk="delete">모두 삭제</button></div></div>`;

  currentContainsItems.forEach((group, gidx) => {
    const open = containsOpenTouched ? containsOpenGroups.has(group.tokenKey) : gidx === 0;
    const allDeleted = (group.rows || []).length > 0 && (group.rows || []).every(item => containsDecisions[item.groupKey || item.key] === "delete");
    const summaryState = allDeleted ? "삭제" : "남김";
    html += `<details class="containsKeywordGroup" data-contains-group="${escapeAttr(group.tokenKey)}"${open ? " open" : ""}><summary><span class="keywordSummaryLeft"><span class="keywordTitle">${escapeHTML(group.token)}</span><span class="keywordMeta">${group.rows.length}개 묶음 · 총 ${group.count}개 · ${summaryState}</span></span><span class="keywordSummaryActions" data-stop-summary><button type="button" class="miniChoiceBtn${!allDeleted ? " active" : ""}" data-contains-group-bulk="keep" data-contains-group-key="${escapeAttr(group.tokenKey)}">묶음 남김</button><button type="button" class="miniChoiceBtn warn${allDeleted ? " active" : ""}" data-contains-group-bulk="delete" data-contains-group-key="${escapeAttr(group.tokenKey)}">묶음 삭제</button></span></summary><div class="containsRows">`;
    group.rows.forEach((item, idx) => {
      const key = item.groupKey || item.key;
      const decision = containsDecisions[key] || "keep";
      const chunk = item.chunk;
      const kindLabel = chunk.kind === "scene" ? "지문" : "대사";
      const extra = item.count && item.count > 1 ? ` 외 ${item.count - 1}개` : "";
      html += `<details class="containsRow"><summary><span class="containsPreview">${escapeHTML(getContainsSnippet(chunk.text))}${escapeHTML(extra)}</span><span class="containsRight"><span class="pill">${escapeHTML(ownerLabel(chunk.owner))}</span><span class="pill">${kindLabel}</span><span class="inlineChoice" data-stop-summary><label><input type="radio" name="contains_${escapeAttr(key)}" data-contains-key="${escapeAttr(key)}" data-contains-group-key="${escapeAttr(group.tokenKey)}" value="keep" ${decision !== "delete" ? "checked" : ""}>남김</label><label><input type="radio" name="contains_${escapeAttr(key)}" data-contains-key="${escapeAttr(key)}" data-contains-group-key="${escapeAttr(group.tokenKey)}" value="delete" ${decision === "delete" ? "checked" : ""}>삭제</label></span></span></summary><div class="reviewBlock"><div class="previewText compactPreview">${escapeHTML(chunk.text)}</div></div></details>`;
    });
    html += `</div></details>`;
  });
  containsReviewPanel.classList.remove("hidden");
  containsReviewPanel.innerHTML = html;
}
function handleContainsReviewChange(e){
  const target = e.target;
  if(!target || !target.matches('input[type="radio"][data-contains-key]')) return;
  containsDecisions[target.dataset.containsKey] = target.value;
  if(target.dataset.containsGroupKey){
    containsOpenTouched = true;
    containsOpenGroups.add(target.dataset.containsGroupKey);
  }
  transformText();
}
function handleContainsReviewToggle(e){
  const detail = e.target;
  if(!detail || !detail.classList || !detail.classList.contains("containsKeywordGroup")) return;
  const key = detail.dataset.containsGroup;
  if(!key) return;
  containsOpenTouched = true;
  if(detail.open) containsOpenGroups.add(key);
  else containsOpenGroups.delete(key);
}
function handleContainsReviewClick(e){
  const control = e.target.closest('[data-stop-summary]');
  if(control){
    e.stopPropagation();
  }
  const groupButton = e.target.closest("button[data-contains-group-bulk]");
  if(groupButton){
    e.preventDefault();
    e.stopPropagation();
    const groupKey = groupButton.dataset.containsGroupKey;
    const value = groupButton.dataset.containsGroupBulk === "delete" ? "delete" : "keep";
    const group = currentContainsItems.find(item => item.tokenKey === groupKey);
    if(group){
      (group.rows || []).forEach(item => { containsDecisions[item.groupKey || item.key] = value; });
      containsOpenTouched = true;
      if(groupKey) containsOpenGroups.add(groupKey);
      transformText();
    }
    return;
  }
  const button = e.target.closest("button[data-contains-bulk]");
  if(!button) return;
  const value = button.dataset.containsBulk === "delete" ? "delete" : "keep";
  currentContainsItems.forEach(group => {
    (group.rows || []).forEach(item => { containsDecisions[item.groupKey || item.key] = value; });
  });
  transformText();
}


function countSimpleSentences(text){
  const parts = String(text || "").split(/[.!?。！？\n]+/).map(s => s.trim()).filter(Boolean);
  return Math.max(1, parts.length || 0);
}
function isOocPrompt(text){
  return /ooc/i.test(String(text || ""));
}
function isTrivialContinuationPrompt(text){
  const t = normalizeParagraphText(text || "");
  if(!t) return true;
  if(/^[\s*＊·•・.。…\-—_]+$/.test(t)) return true;
  if(/이어|이어서|계속|계속해서|다음|출력|응답/.test(t) && countSimpleSentences(t) <= 1 && t.length <= 90) return true;
  return false;
}
function stripBracketedOocText(text){
  let t = String(text || "");
  const stripInline = value => String(value || "")
    .replace(/\[[^\]]*ooc[^\]]*\]/gi, "")
    .replace(/<[^>]*ooc[^>]*>/gi, "")
    .replace(/\*\*[^*]*ooc[^*]*\*\*/gi, "")
    .replace(/\([^)]*ooc[^)]*\)/gi, "")
    .replace(/【[^】]*ooc[^】]*】/gi, "")
    .replace(/「[^」]*ooc[^」]*」/gi, "");
  t = stripInline(t);
  const paragraphs = t.split(/\n\s*\n/).map(part => {
    const cleaned = stripInline(part).trim();
    if(/ooc/i.test(cleaned)) return "";
    return cleaned;
  }).filter(Boolean);
  return paragraphs.join("\n\n").replace(/\n{3,}/g, "\n\n").trim();
}
function getOocReviewKey(block){
  return "ooc-" + (block && block.id ? block.id : hashString(block ? block.text : ""));
}
function buildOocReviewItems(blocks, alreadyDropped){
  if(activeMode !== "chat" || !reviewOocPairsEl || !reviewOocPairsEl.checked) return [];
  const cascade = oocCascadeModeEl && oocCascadeModeEl.value === "cascade";
  const items = [];
  for(let i=0; i<blocks.length; i++){
    const block = blocks[i];
    if(!block || block.owner !== "user" || !isOocPrompt(block.text) || (alreadyDropped && alreadyDropped.has(block.id))) continue;
    const answerBlocks = [];
    let j = i + 1;
    while(j < blocks.length){
      const cur = blocks[j];
      if(!cur) { j++; continue; }
      if(alreadyDropped && alreadyDropped.has(cur.id)){ j++; continue; }
      if(cur.owner === "character"){
        answerBlocks.push(cur);
        j++;
        continue;
      }
      if(cur.owner === "user"){
        if(cascade && isTrivialContinuationPrompt(cur.text)){
          j++;
          continue;
        }
        break;
      }
      j++;
    }
    items.push({key:getOocReviewKey(block), promptBlock:block, answerBlocks});
  }
  return items.slice(0, 120);
}
function oocItemMatchesFilter(item, idx){
  const keyword = normalizeParagraphText(oocFilterText || "").toLowerCase();
  const order = String(oocOrderQuery || "").trim();
  if(order){
    const n = Number(order);
    if(Number.isFinite(n) && n > 0 && (idx + 1) !== n) return false;
  }
  if(!keyword) return true;
  const hay = [item.promptBlock ? item.promptBlock.text : ""].concat((item.answerBlocks || []).map(b => b.text || "")).join("\n").toLowerCase();
  return hay.includes(keyword);
}
function getFilteredOocItems(){
  return (currentOocItems || []).map((item, index) => ({item, index})).filter(w => oocItemMatchesFilter(w.item, w.index));
}
function updateOocReviewPanel(items){
  currentOocItems = items || [];
  if(activeMode !== "chat" || !reviewOocPairsEl || !reviewOocPairsEl.checked){
    oocReviewPanel.classList.add("hidden");
    oocReviewPanel.innerHTML = "";
    return;
  }
  if(!currentOocItems.length){
    oocReviewPanel.classList.remove("hidden");
    oocReviewPanel.innerHTML = `<div class="reviewHead"><div><div class="reviewTitle">OOC 응답 검토</div><div class="reviewMeta">OOC가 들어간 유저 지문을 찾지 못했습니다.</div></div></div>`;
    return;
  }
  const filtered = getFilteredOocItems();
  const total = currentOocItems.length;
  const count = filtered.length;
  oocGroupPage = Math.max(0, Math.min(Math.max(0, count - 1), oocGroupPage || 0));

  let html = `<div class="reviewHead"><div><div class="reviewTitle">OOC 응답 검토</div><div class="reviewMeta">OOC가 포함된 지문을 한 개씩 확인합니다.</div></div><div class="bulkButtons"><button type="button" class="btn subtle" data-ooc-bulk="keepPrompt">전체 지문만 삭제</button><button type="button" class="btn subtle" data-ooc-bulk="delete">전체 응답까지 삭제</button></div></div>`;
  html += `<div class="reviewSearchBar"><input type="search" data-ooc-search="keyword" placeholder="OOC/응답 내용 검색" value="${escapeAttr(oocFilterText)}"><input type="number" min="1" data-ooc-search="order" placeholder="순서" value="${escapeAttr(oocOrderQuery)}"><button type="button" class="btn primary" data-ooc-search-apply="1">검색</button><button type="button" class="btn subtle" data-ooc-search-clear="1">초기화</button></div>`;
  if(!count){
    html += `<div class="emptyState">검색 조건에 맞는 OOC 지문이 없습니다.</div>`;
    oocReviewPanel.classList.remove("hidden");
    oocReviewPanel.innerHTML = html;
    return;
  }
  const wrap = filtered[oocGroupPage];
  const item = wrap.item;
  const idx = wrap.index;
  const decision = oocDecisions[item.key] || "strip";
  const answerCount = item.answerBlocks.length;
  const answersText = item.answerBlocks.map((b, n) => `응답 ${n + 1}\n${b.text}`).join("\n\n");
  const prevDisabled = oocGroupPage <= 0 ? "disabled" : "";
  const nextDisabled = oocGroupPage >= count - 1 ? "disabled" : "";
  html += `<div class="dupeCard oocCard">`;
  html += `<div class="reviewNav"><div><div class="reviewTitle">OOC 지문 ${idx + 1}</div><div class="reviewMeta">전체 ${idx + 1}/${total} · 검색 결과 ${oocGroupPage + 1}/${count} · 연결 응답 ${answerCount}개</div></div><div class="navButtons"><button type="button" class="navIconBtn" data-ooc-page="prev" ${prevDisabled} aria-label="이전 OOC">‹</button><button type="button" class="navIconBtn" data-ooc-page="next" ${nextDisabled} aria-label="다음 OOC">›</button></div></div>`;
  html += `<div class="dupeCompareGrid">`;
  html += `<div class="reviewBlock"><div class="dupeSummary"><span class="pill">OOC 포함 지문</span></div><div class="previewText">${escapeHTML(item.promptBlock.text)}</div></div>`;
  html += `<div class="reviewBlock"><div class="dupeSummary"><span class="pill">연결 캐릭터 응답</span><span class="pill">${answerCount}개</span></div>${answerCount ? `<div class="previewText">${escapeHTML(answersText)}</div>` : `<div class="emptyState">연결된 캐릭터 응답이 없습니다.</div>`}</div>`;
  html += `</div>`;
  html += `<div class="reviewChoices choiceRow threeChoices"><label class="reviewChoice"><input type="radio" name="ooc_${escapeAttr(item.key)}" data-ooc-key="${escapeAttr(item.key)}" value="strip" ${decision === "strip" ? "checked" : ""}>OOC 문단만 삭제</label><label class="reviewChoice"><input type="radio" name="ooc_${escapeAttr(item.key)}" data-ooc-key="${escapeAttr(item.key)}" value="prompt" ${decision === "prompt" ? "checked" : ""}>전체 유저 지문 삭제</label><label class="reviewChoice"><input type="radio" name="ooc_${escapeAttr(item.key)}" data-ooc-key="${escapeAttr(item.key)}" value="delete" ${decision === "delete" ? "checked" : ""}>응답까지 삭제</label></div>`;
  html += `</div>`;
  oocReviewPanel.classList.remove("hidden");
  oocReviewPanel.innerHTML = html;
}
function handleOocReviewChange(e){
  const target = e.target;
  if(!target || !target.matches('input[type="radio"][data-ooc-key]')) return;
  oocDecisions[target.dataset.oocKey] = target.value;
  transformText();
}
function handleOocReviewClick(e){
  const bulk = e.target.closest("button[data-ooc-bulk]");
  if(bulk){
    const value = bulk.dataset.oocBulk === "delete" ? "delete" : "prompt";
    currentOocItems.forEach(item => { oocDecisions[item.key] = value; });
    transformText();
    return;
  }
  const pageBtn = e.target.closest("button[data-ooc-page]");
  if(pageBtn){
    const filtered = getFilteredOocItems();
    const max = Math.max(0, filtered.length - 1);
    oocGroupPage = pageBtn.dataset.oocPage === "next" ? Math.min(max, oocGroupPage + 1) : Math.max(0, oocGroupPage - 1);
    updateOocReviewPanel(currentOocItems);
  }
  if(e.target.closest("button[data-ooc-search-apply]")){
    oocGroupPage = 0;
    updateOocReviewPanel(currentOocItems);
    return;
  }
  if(e.target.closest("button[data-ooc-search-clear]")){
    oocFilterText = "";
    oocOrderQuery = "";
    oocGroupPage = 0;
    updateOocReviewPanel(currentOocItems);
  }
}
function handleOocReviewInput(e){
  const target = e.target;
  if(!target) return;
  if(target.matches('[data-ooc-search="keyword"]')) oocFilterText = target.value || "";
  if(target.matches('[data-ooc-search="order"]')) oocOrderQuery = target.value || "";
}
function handleOocReviewKeydown(e){
  if(e.key !== "Enter") return;
  if(e.target && e.target.matches('[data-ooc-search]')){
    e.preventDefault();
    oocGroupPage = 0;
    updateOocReviewPanel(currentOocItems);
  }
}
function getDroppedBlockIdsFromOocDecisions(items){
  const dropped = new Set();
  (items || []).forEach(item => {
    const decision = oocDecisions[item.key] || "strip";
    if(decision === "prompt" || decision === "delete"){
      if(item.promptBlock) dropped.add(item.promptBlock.id);
    }
    if(decision === "delete"){
      item.answerBlocks.forEach(b => dropped.add(b.id));
    }
  });
  return dropped;
}
function getOocStripMap(items){
  const map = new Map();
  (items || []).forEach(item => {
    const decision = oocDecisions[item.key] || "strip";
    if(decision === "strip" && item.promptBlock) map.set(item.promptBlock.id, true);
  });
  return map;
}
function mergeSets(){
  const merged = new Set();
  Array.from(arguments).forEach(set => {
    if(!set) return;
    set.forEach(v => merged.add(v));
  });
  return merged;
}
function createStructuralDeletePlan(chunks, dropBlockIds){
  const tokens = getProtectTokens();
  const dropChunkIds = new Set();
  (chunks || []).forEach(chunk => {
    if(!chunk || (dropBlockIds && dropBlockIds.has(chunk.blockId))) return;
    const t = String(chunk.text || "").trim();
    if(!t) return;
    const protectedHere = isProtectedText(t, tokens);
    if(removeDetailsEl.checked && chunk.fromDetails && !protectedHere){
      dropChunkIds.add(chunk.id);
      return;
    }
    if(removeTablesEl.checked && !protectedHere && (chunk.fromTable || isRemovableBlockText(t))){
      // 표/블록 제거는 문단 단위(chunk)로만 처리합니다.
      // 같은 응답 블록 안의 뒤쪽 지문까지 blockId로 삭제하지 않도록 여기에서 범위를 고정합니다.
      dropChunkIds.add(chunk.id);
    }
  });
  return { dropBlockIds: dropBlockIds || new Set(), dropChunkIds };
}
function makeDeleteOptions(base){
  const out = Object.assign({}, base || {});
  out.dropBlockIds = out.dropBlockIds || new Set();
  out.dropChunkIds = out.dropChunkIds || new Set();
  return out;
}

function shouldIndentOutput(){
  return !!(indentOutputEl && indentOutputEl.checked);
}
function indentRenderedText(text){
  if(!shouldIndentOutput()) return text;
  return String(text || "").split("\n").map(line => line.trim() ? "　" + line : line).join("\n");
}


function hasEmojiText(text){
  const value = String(text || "");
  try{
    if(/[\p{Extended_Pictographic}\p{Regional_Indicator}]/u.test(value)) return true;
  }catch(_err){}
  return /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}\u{2B00}-\u{2BFF}\u{1F1E6}-\u{1F1FF}]/u.test(value);
}
function splitSentencesKeepingBreaks(line){
  const text = String(line || "");
  if(!text) return [""];
  const parts = text.match(/[^.!?。！？…]+[.!?。！？…]+[”’"')\]\}]*|[^.!?。！？…]+/g);
  return parts && parts.length ? parts : [text];
}
function removeEmojiSentencesFromText(text){
  return String(text || "")
    .split(/(\n+)/)
    .map(part => {
      if(/^\n+$/.test(part)) return part;
      return splitSentencesKeepingBreaks(part).filter(sentence => !hasEmojiText(sentence)).join("").trim();
    })
    .join("")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
function shouldRemoveEmojiSentences(){
  const el = document.getElementById("removeEmojiSentences");
  return !!(el && el.checked);
}

// ------------------ 출력 공통 렌더러 ------------------
function renderChunks(chunks, options){
  options = makeDeleteOptions(options);
  const tokens = getProtectTokens();
  const deleteTokens = options.deleteTokens || [];
  const dropBlockIds = options.dropBlockIds || new Set();
  const dropChunkIds = options.dropChunkIds || new Set();
  const quoteStyle = quoteStyleEl.value;
  const [openQ, closeQ] = getQuotes(quoteStyle);
  const labeledBlockIds = new Set();
  const allowSpeakerLabels = !!options.labelSpeakers;

  const renderedItems = chunks.map((chunk, index) => {
    const {kind, text: raw, fromTable, fromDetails} = chunk;
    if(dropBlockIds.has(chunk.blockId) || dropChunkIds.has(chunk.id)) return null;
    let t = (raw || "").trim();
    if(options.oocStripMap && options.oocStripMap.has(chunk.blockId)){
      t = stripBracketedOocText(t);
    }
    if(!t) return "";

    if(removeHTMLEl.checked){
      t = t.replace(/<script[\s\S]*?<\/script>/gi,"");
      t = t.replace(/<style[\s\S]*?<\/style>/gi,"");
      t = t.replace(/<br\s*\/?>/gi,"\n");
      t = t.replace(/<\/p>/gi,"\n");
      t = t.replace(/<[^>]+>/g,"");
      t = t.replace(/<[^>\n]*/g,"");
      t = t.trim();
      if(!t) return "";
    }

    t = t.replace(/\*\*(.*?)\*\*/g,"$1");
    t = t.replace(/__(.*?)__/g,"$1");

    const protectedHere = isProtectedText(t, tokens);

    if(shouldRemoveEmojiSentences() && !protectedHere){
      t = removeEmojiSentencesFromText(t);
      if(!t) return "";
    }

    if(removeDetailsEl.checked && fromDetails && !protectedHere) return "";
    if(options.removeTables && !protectedHere && (fromTable || isRemovableBlockText(t))) return "";

    if(shouldDeleteByContains(t, deleteTokens) && !protectedHere){
      if(options.deleteContainsMode === "review"){
        const key = getContainsGroupKey(chunk);
        const legacyKey = getChunkKey(chunk, index);
        if(options.containsDecisions && (options.containsDecisions[key] === "delete" || options.containsDecisions[legacyKey] === "delete")) return "";
      }else{
        return "";
      }
    }

    if(removeDecorEl.checked && !protectedHere){
      const preserveDecor = getProtectedChapterSeparators();
      if(isDecorOnlyParagraph(t, preserveDecor)) return "";
      t = removeDecorLines(t, preserveDecor);
      if(!t) return "";
    }

    if(protectedHere){
      const kept = indentRenderedText(normalizeBlankLinesInsideCell(t));
      const shouldLabel = allowSpeakerLabels && !labeledBlockIds.has(chunk.blockId);
      if(shouldLabel) labeledBlockIds.add(chunk.blockId);
      return { text: labelChunk(kept, chunk, shouldLabel), blockId: chunk.blockId, owner: chunk.owner || "", kind: chunk.kind || "normal" };
    }

    if(kind==="scene"){
      const scene = indentRenderedText(normalizeBlankLinesInsideCell(t));
      const shouldLabel = allowSpeakerLabels && !labeledBlockIds.has(chunk.blockId);
      if(shouldLabel) labeledBlockIds.add(chunk.blockId);
      return { text: labelChunk(scene, chunk, shouldLabel), blockId: chunk.blockId, owner: chunk.owner || "", kind: chunk.kind || "scene" };
    }

    if(isDecorOnlyParagraph(t, getProtectedChapterSeparators())) return { text: t, blockId: chunk.blockId, owner: chunk.owner || "", kind: chunk.kind || "normal" };

    let dialogue = t;
    if(quoteStyle !== "none" && !isAlreadyQuoted(t)) dialogue = openQ + t + closeQ;
    dialogue = indentRenderedText(dialogue);
    const shouldLabel = allowSpeakerLabels && !labeledBlockIds.has(chunk.blockId);
    if(shouldLabel) labeledBlockIds.add(chunk.blockId);
    return { text: labelChunk(dialogue, chunk, shouldLabel), blockId: chunk.blockId, owner: chunk.owner || "", kind: chunk.kind || "normal" };
  }).filter(item => item && item.text);

  let outputText;
  if(removeEmptyLinesEl.checked){
    outputText = renderedItems.map(item => item.text).join("\n").trim();
  }else if(shouldRemoveCellEmptyLines()){
    outputText = renderedItems.map((item, idx) => {
      if(idx === 0) return item.text;
      const prev = renderedItems[idx - 1];
      return (prev && prev.blockId === item.blockId ? "\n" : "\n\n") + item.text;
    }).join("").trim();
  }else{
    outputText = renderedItems.map(item => item.text).join("\n\n").trim();
  }
  if(options.returnItems) return {text: outputText, items: renderedItems};
  return outputText;
}

// ------------------ 메인 변환 ------------------
function shouldRenderSpeakerLabels(){
  if(!(activeMode === "chat" || activeMode === "classic")) return false;
  if(!labelSpeakersEl || !labelSpeakersEl.checked) return false;
  const mode = speakerLabelModeEl ? speakerLabelModeEl.value : "output";
  return mode !== "reviewOnly";
}
function afterTransform(chunks, blocks, renderedText){
  updateResultStats(chunks || [], blocks || [], renderedText || "");
  updateEpubPreview();
  updateChapterDividerPanel();
  syncActiveResultHeight();
}
function transformText(){
  if(activeMode === "epubedit"){
    lastStructuredItems = [];
    updateEpubPreview();
    updateResultStats([], [], epubEditEditor ? editorPlainText(epubEditEditor) : "");
    return;
  }else if(activeMode === "chat"){
    const parsed = parseRofanChatChunks(chatPaste);
    currentParsedBlocks = parsed.blocks || [];
    const duplicateGroups = reviewDuplicatesEl.checked ? buildDuplicateAnswerGroups(parsed.blocks) : [];
    const duplicateDropBlockIds = getDroppedBlockIdsFromDuplicateDecisions(duplicateGroups);
    updateDuplicateReviewPanel(duplicateGroups);

    const oocItems = buildOocReviewItems(parsed.blocks, duplicateDropBlockIds);
    updateOocReviewPanel(oocItems);
    const oocDropBlockIds = getDroppedBlockIdsFromOocDecisions(oocItems);
    const oocStripMap = getOocStripMap(oocItems);
    const dropBlockIds = mergeSets(duplicateDropBlockIds, oocDropBlockIds);
    const structuralPlan = createStructuralDeletePlan(parsed.chunks, dropBlockIds);

    const deleteTokens = getDeleteContainsTokens();
    const containsItems = buildContainsReviewItems(parsed.chunks, dropBlockIds, deleteTokens, structuralPlan.dropChunkIds);
    updateContainsReviewPanel(containsItems);

    const renderedPack = renderChunks(parsed.chunks, {
      removeTables: removeTablesEl.checked,
      deleteTokens,
      deleteContainsMode: deleteContainsModeEl.value,
      containsDecisions,
      dropBlockIds,
      dropChunkIds: structuralPlan.dropChunkIds,
      oocStripMap,
      labelSpeakers: shouldRenderSpeakerLabels(),
      returnItems: true
    });
    const rendered = renderedPack.text;
    lastStructuredItems = renderedPack.items || [];
    setResultOutput(chatOutput, rendered);
    afterTransform(parsed.chunks, parsed.blocks, rendered);
    return;
  }

  let text = input.value || "";
  const tokens = getProtectTokens();
  const structuredChunks = parseStructuredMarkdownToChunks(text);

  if(!structuredChunks){
    if(removeDetailsEl.checked){
      text = filterDetailsByProtection(text, tokens);
      text = text.replace(/<summary.*?>.*?<\/summary>/gi,"");
    }

    if(removeHTMLEl.checked){
      text = text.replace(/<script[\s\S]*?<\/script>/gi,"");
      text = text.replace(/<style[\s\S]*?<\/style>/gi,"");
      text = text.replace(/<br\s*\/?>/gi,"\n");
      text = text.replace(/<\/p>/gi,"\n");
      text = text.replace(/<[^>]+>/g,"");
      text = text.replace(/<[^>\n]*/g,"");
    }

    text = text.replace(/\*\*(.*?)\*\*/g,"$1");
    text = text.replace(/__(.*?)__/g,"$1");
  }

  const chunks = (classicActiveChunks && classicActiveChunks.length) ? cloneChunks(classicActiveChunks) : (structuredChunks || parseChunks(text));
  const deleteTokens = getDeleteContainsTokens();
  currentDuplicateGroups = [];
  duplicateReviewPanel.classList.add("hidden");
  duplicateReviewPanel.innerHTML = "";
  if(oocReviewPanel){ oocReviewPanel.classList.add("hidden"); oocReviewPanel.innerHTML = ""; }
  const emptyDrop = new Set();
  const structuralPlan = createStructuralDeletePlan(chunks, emptyDrop);
  const containsItems = buildContainsReviewItems(chunks, emptyDrop, deleteTokens, structuralPlan.dropChunkIds);
  updateContainsReviewPanel(containsItems);
  const renderedPack = renderChunks(chunks, {
    removeTables: removeTablesEl.checked,
    deleteTokens,
    deleteContainsMode: deleteContainsModeEl.value,
    containsDecisions,
    dropBlockIds: emptyDrop,
    dropChunkIds: structuralPlan.dropChunkIds,
    labelSpeakers: shouldRenderSpeakerLabels(),
    returnItems: true
  });
  const rendered = renderedPack.text;
  lastStructuredItems = renderedPack.items || [];
  setResultOutput(output, rendered);
  afterTransform(chunks, [], rendered);
}

// ------------------ UI ------------------
function getActiveOutput(){
  if(activeMode === "chat") return chatOutput;
  if(activeMode === "epubedit") return epubEditEditor;
  return output;
}
function copyResult(){
  const value = getPlainActiveOutputValue();
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(value)
      .then(() => showToast("복사되었습니다."))
      .catch(() => fallbackCopy(value));
    return;
  }
  fallbackCopy(value);
}
function fallbackCopy(value){
  const temp = document.createElement("textarea");
  temp.value = value;
  temp.setAttribute("readonly", "");
  temp.style.position = "fixed";
  temp.style.left = "-9999px";
  document.body.appendChild(temp);
  temp.select();
  document.execCommand("copy");
  document.body.removeChild(temp);
  showToast("복사되었습니다.");
}
function showToast(msg){
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.style.opacity = "1";
  setTimeout(()=>{ t.style.opacity = "0"; }, 1600);
}
function syncDownloadFileNameInputs(source){
  downloadFileNameEls.forEach(el => {
    if(el !== source) el.value = downloadFileBaseName || "";
  });
}
function currentDownloadBaseName(fallback){
  let typed = downloadFileBaseName || "";
  downloadFileNameEls.forEach(el => {
    if(!typed && el.value) typed = el.value;
  });
  typed = String(typed || fallback || "download").trim();
  return typed || "download";
}
function safeDownloadFileName(ext, fallback){
  return safeFileName(currentDownloadBaseName(fallback), ext);
}
function downloadTxt(){
  const blob=new Blob([getPlainActiveOutputValue()],{type:"text/plain;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url;
  const fallback = activeMode === "chat" ? "cleaned_rofan_chat" : (activeMode === "epubedit" ? "edited_epub_text" : "cleaned_log");
  a.download=safeDownloadFileName(".txt", fallback);
  a.click();
  URL.revokeObjectURL(url);
}
function clearAll(){
  if(!window.confirm("정말 초기화하시겠습니까? 현재 입력과 변환 결과가 비워집니다.")) return;
  resetReviewDecisions();
  cachedChatFileName = "";
  duplicateGroupPage = 0;
  duplicateFilterText = "";
  duplicateOrderQuery = "";
  oocGroupPage = 0;
  oocFilterText = "";
  oocOrderQuery = "";
  chapterKeywordQuery = "";
  chapterOrderQuery = "";
  chapterMatchPage = 0;
  if(chapterKeywordInputEl) chapterKeywordInputEl.value = "";
  if(chapterOrderInputEl) chapterOrderInputEl.value = "";
  if(duplicateReviewPanel){ duplicateReviewPanel.innerHTML = ""; duplicateReviewPanel.classList.add("hidden"); }
  if(containsReviewPanel){ containsReviewPanel.innerHTML = ""; containsReviewPanel.classList.add("hidden"); }
  if(oocReviewPanel){ oocReviewPanel.innerHTML = ""; oocReviewPanel.classList.add("hidden"); }

  if(activeMode === "epubedit"){
    if(epubEditEditor){ epubEditEditor.innerHTML = ""; epubEditEditor.scrollTop = 0; }
    if(epubEditFileInput) epubEditFileInput.value = "";
    if(epubEditFileNameEl) epubEditFileNameEl.textContent = "선택된 파일 없음";
    cachedEpubEditFileName = "";
    savedEditorRange = null;
    lastStructuredItems = [];
    updateEpubPreview();
    updateResultStats([], [], "");
  }else if(activeMode === "chat"){
    if(chatPaste) chatPaste.innerHTML="";
    if(chatOutput){ setResultOutput(chatOutput, ""); setResultOutputScroll(chatOutput, 0); }
    if(chatFileInput) chatFileInput.value="";
    if(chatFileNameEl) chatFileNameEl.textContent = "선택된 파일 없음";
    lastStructuredItems = [];
    transformText();
    updateResultStats([], [], getActiveOutputValue());
  }else{
    if(input) input.value="";
    if(output){ setResultOutput(output, ""); setResultOutputScroll(output, 0); }
    if(classicFileInput) classicFileInput.value = "";
    if(classicFileNameEl) classicFileNameEl.textContent = "선택된 파일 없음";
    if(excerptStartTextEl) excerptStartTextEl.value = "";
    if(excerptEndTextEl) excerptEndTextEl.value = "";
    classicLoadedFileText = "";
    classicLoadedChunks = null;
    classicActiveChunks = null;
    classicActiveDisplayText = "";
    lastStructuredItems = [];
    transformText();
    updateResultStats([], [], getActiveOutputValue());
  }
  updateEpubPreview();
  updateChapterDividerPanel();
  scheduleAutosave();
  showToast("초기화했습니다.");
}


// ------------------ 통계 / EPUB / 내보내기 ------------------
function stripHTMLTags(text){
  return String(text || "").replace(/<[^>]*>/g, "");
}
function normalizeSpeakerCompareLine(line){
  return stripHTMLTags(line || "").replace(/\s+/g, "").trim();
}
function getPossibleSpeakerLabels(){
  const names = [getSpeakerName("user"), getSpeakerName("character")].filter(Boolean);
  const marker = getSpeakerMarker();
  const labels = [];
  names.forEach(name => {
    labels.push(name);
    if(marker) labels.push(marker + name, marker + " " + name);
  });
  return labels.map(normalizeSpeakerCompareLine).filter(Boolean);
}
function stripSpeakerLabelLines(text){
  const labels = new Set(getPossibleSpeakerLabels());
  if(!labels.size) return text;
  return String(text || "").split(/\n/).filter(line => !labels.has(normalizeSpeakerCompareLine(line))).join("\n").replace(/\n{3,}/g,"\n\n").trim();
}
function getPreparedOutputForExport(){
  const active = getActiveOutput();
  let text = activeMode === "epubedit" ? editorPlainText(epubEditEditor) : ((active && active.value) || "");
  text = String(text || "").replace(/\r/g, "");
  const mode = epubTextModeEl ? epubTextModeEl.value : "current";
  const labelMode = speakerLabelModeEl ? speakerLabelModeEl.value : "output";
  if(mode === "removeLabels" || labelMode === "hideInEpub" || labelMode === "reviewOnly"){
    text = stripSpeakerLabelLines(text);
  }
  if(mode === "novel"){
    text = stripSpeakerLabelLines(text).replace(/\n{3,}/g,"\n\n").trim();
  }
  return text.trim();
}
function getResultStats(text, chunks){
  const clean = stripHTMLTags(text || "");
  const paragraphs = clean.split(/\n\s*\n+/).map(p=>p.trim()).filter(Boolean);
  return {
    chars: clean.length,
    charsNoSpace: clean.replace(/\s/g,"").length,
    paragraphs: paragraphs.length,
    chunks: chunks.length,
    scenes: chunks.filter(c => c.kind === "scene").length,
    dialogues: chunks.filter(c => c.kind !== "scene").length,
    user: chunks.filter(c => c.owner === "user").length,
    character: chunks.filter(c => c.owner === "character").length
  };
}
function fmtNum(n){ return Number(n || 0).toLocaleString("ko-KR"); }
function updateResultStats(chunks, blocks, renderedText){
  const stats = getResultStats(renderedText || "", chunks || []);
  if(resultStatsEl){
    resultStatsEl.innerHTML = `
      <div class="stat"><strong>${fmtNum(stats.chars)}</strong><span>글자</span></div>
      <div class="stat"><strong>${fmtNum(stats.charsNoSpace)}</strong><span>공백 제외</span></div>
      <div class="stat"><strong>${fmtNum(stats.paragraphs)}</strong><span>문단</span></div>
      <div class="stat"><strong>${fmtNum(stats.scenes)}</strong><span>지문</span></div>
      <div class="stat"><strong>${fmtNum(stats.dialogues)}</strong><span>대사</span></div>
      <div class="stat"><strong>${fmtNum(currentDuplicateGroups.length)}</strong><span>중복 묶음</span></div>
      <div class="stat"><strong>${fmtNum(currentContainsItems.length)}</strong><span>키워드 후보</span></div>`;
  }
  updateRiskPanel(renderedText || "");
  if(workflowHintEl){
    const missing = !renderedText ? "입력하면 바로 정리됩니다." : `${fmtNum(stats.paragraphs)}개 문단 준비됨`;
    workflowHintEl.textContent = missing;
  }
}
const RISK_TERMS = ["OOC", "시스템", "기록지", "설정", "요약", "이전 대화", "AI", "모델", "검열", "�"];
function countTermInsensitive(text, term){
  const hay = String(text || "").toLowerCase();
  const needle = String(term || "").toLowerCase();
  if(!needle) return 0;
  let count = 0, pos = 0;
  while((pos = hay.indexOf(needle, pos)) !== -1){ count++; pos += needle.length; }
  return count;
}
function updateRiskPanel(text){
  if(!riskPanelEl) return;
  const found = RISK_TERMS.map(term => ({term, count:countTermInsensitive(text, term)})).filter(x => x.count > 0);
  if(!found.length){
    riskPanelEl.innerHTML = `<div class="emptyState">위험 문구 없음</div>`;
    return;
  }
  riskPanelEl.innerHTML = found.map(x => `<button type="button" class="riskChip" onclick="appendDeleteKeyword('${escapeAttr(x.term)}')"><span>${escapeHTML(x.term)}</span><b>${x.count}</b></button>`).join("") + `<div class="miniHelp">누르면 삭제 키워드에 추가됩니다.</div>`;
}
function appendDeleteKeyword(term){
  const tokens = splitTokens(deleteContainsTokenEl.value || "");
  if(!tokens.some(t => t.toLowerCase() === String(term).toLowerCase())) tokens.push(term);
  deleteContainsTokenEl.value = tokens.join(", ");
  deleteContainsEnabledEl.checked = true;
  deleteContainsModeEl.value = "review";
  transformText();
  showToast("검토 키워드에 추가했습니다.");
}
function resetDuplicateChoices(){
  if(!window.confirm("중복 답변 검토 선택을 초기화하시겠습니까?")) return;
  duplicateDecisions = {};
  duplicatePageByGroup = {};
  duplicateGroupPage = 0;
  duplicateFilterText = "";
  duplicateOrderQuery = "";
  oocGroupPage = 0;
  oocFilterText = "";
  oocOrderQuery = "";
  transformText();
  showToast("중복 선택을 초기화했습니다.");
}
function resetContainsChoices(){
  if(!window.confirm("키워드 검토 선택을 초기화하시겠습니까?")) return;
  containsDecisions = {};
  transformText();
  showToast("키워드 검토 선택을 초기화했습니다.");
}
function resetReviewOnly(){
  if(!window.confirm("모든 검토 선택을 초기화하시겠습니까?")) return;
  resetReviewDecisions();
  transformText();
  showToast("검토 선택을 초기화했습니다.");
}

function getActiveOutputValue(){
  if(activeMode === "epubedit") return epubEditEditor ? editorPlainText(epubEditEditor) : "";
  const el = getActiveOutput();
  return el ? (el.value || "") : "";
}
function getPlainActiveOutputValue(){
  return stripHTMLTags(getActiveOutputValue()).replace(/&nbsp;/gi, " ").trim();
}
function setActiveOutputValue(value){
  if(activeMode === "epubedit"){
    if(epubEditEditor) epubEditEditor.innerHTML = plainTextToHtml(value || "");
    updateResultStats([], [], value || "");
    updateEpubPreview();
    updateChapterDividerPanel();
    scheduleAutosave();
    return;
  }
  const el = getActiveOutput();
  if(!el) return;
  setResultOutput(el, value);
  updateResultStats([], [], value || "");
  updateEpubPreview();
  updateChapterDividerPanel();
  scheduleAutosave();
}
function splitOutputParagraphsWithOffsets(text){
  const re = /\n\s*\n+/g;
  const parts = [];
  let start = 0;
  let m;
  while((m = re.exec(text))){
    const raw = text.slice(start, m.index);
    if(raw.trim()) parts.push({text:raw.trim(), start, end:m.index});
    start = re.lastIndex;
  }
  const raw = text.slice(start);
  if(raw.trim()) parts.push({text:raw.trim(), start, end:text.length});
  return parts;
}
function getChapterSearchMatches(){
  const q = String(chapterKeywordQuery || "").trim().toLowerCase();
  const order = String(chapterOrderQuery || "").trim();
  const text = getActiveOutputValue();
  let matches = splitOutputParagraphsWithOffsets(text).map((p, index) => ({...p, index}));
  if(q) matches = matches.filter(p => p.text.toLowerCase().includes(q));
  if(order){
    const n = Number(order);
    if(Number.isFinite(n) && n > 0) matches = matches.filter((_p, idx) => idx + 1 === n || _p.index + 1 === n);
  }
  return matches;
}
function updateChapterDividerPanel(){
  if(!chapterDividerPanelEl) return;
  const separator = (chapterSeparatorEl && chapterSeparatorEl.value.trim()) || "—————";
  const useSeparatorMode = chapterSplitModeEl && chapterSplitModeEl.value === "separator";
  currentChapterMatches = getChapterSearchMatches();
  const total = currentChapterMatches.length;
  chapterMatchPage = Math.max(0, Math.min(Math.max(0, total - 1), chapterMatchPage || 0));
  const current = total ? currentChapterMatches[chapterMatchPage] : null;
  let html = `<div class="miniToolHead"><div><strong>구분선 삽입</strong><span>${useSeparatorMode ? "검색한 지문 위/아래에 챕터 구분선을 넣습니다." : "나누기를 구분선 기준으로 바꾸면 EPUB 챕터가 나뉩니다."}</span></div><span class="smallMuted">${total ? `${chapterMatchPage + 1}/${total}` : "0개"}</span></div>`;
  if(!total){
    html += `<div class="emptyState">키워드를 입력하면 해당 문단이 표시됩니다.</div>`;
  }else{
    const prevDisabled = chapterMatchPage <= 0 ? "disabled" : "";
    const nextDisabled = chapterMatchPage >= total - 1 ? "disabled" : "";
    html += `<div class="chapterMatchCard"><div class="dupeSummary withNav"><span><span class="pill">문단 ${current.index + 1}</span><span class="pill">구분선 ${escapeHTML(separator)}</span></span><span class="navButtons"><button type="button" class="navIconBtn" data-chapter-match-page="prev" ${prevDisabled} aria-label="이전 문단">‹</button><button type="button" class="navIconBtn" data-chapter-match-page="next" ${nextDisabled} aria-label="다음 문단">›</button></span></div><div class="previewText fullPreview">${escapeHTML(current.text)}</div><div class="chapterInsertRow"><button type="button" class="btn primary" data-chapter-insert="1">현재 문단에 구분선 넣기</button></div></div>`;
  }
  chapterDividerPanelEl.innerHTML = html;
}
function makeEditorChapterSeparator(separator){
  const hr = document.createElement("hr");
  hr.setAttribute("data-chapter-separator", "true");
  hr.setAttribute("aria-label", separator || "챕터 구분선");
  hr.className = "chapter-editor-separator";
  return hr;
}
function insertChapterDividerIntoEditor(current, position, separator){
  if(!epubEditEditor) return false;
  const normalize = value => String(value || "").replace(/\s+/g, " ").trim();
  const nodes = Array.from(epubEditEditor.childNodes).filter(node => {
    if(node.nodeType === Node.ELEMENT_NODE && node.tagName === "HR") return true;
    return !!normalize(node.innerText || node.textContent || "");
  });
  const wanted = normalize(current && current.text);
  let target = nodes.find(node => normalize(node.innerText || node.textContent || "") === wanted);
  if(!target) target = nodes[current ? current.index : -1];
  const marker = makeEditorChapterSeparator(separator);
  if(target && target.parentNode){
    target.parentNode.insertBefore(marker, position === "after" ? target.nextSibling : target);
  }else{
    epubEditEditor.appendChild(marker);
  }
  return true;
}
function refreshChapterViews(){
  updateEpubPreview();
  updateChapterDividerPanel();
  requestAnimationFrame(() => updateEpubPreview());
}
function insertChapterDividerAtCurrentMatch(){
  const matches = getChapterSearchMatches();
  if(!matches.length){ showToast("구분선을 넣을 문단을 찾지 못했습니다."); return; }
  const current = matches[Math.max(0, Math.min(matches.length - 1, chapterMatchPage || 0))];
  const separator = (chapterSeparatorEl && chapterSeparatorEl.value.trim()) || "—————";
  const position = chapterPositionEl ? chapterPositionEl.value : "before";
  if(chapterSplitModeEl) chapterSplitModeEl.value = "separator";

  if(activeMode === "epubedit" && epubEditEditor){
    insertChapterDividerIntoEditor(current, position, separator);
    refreshChapterViews();
    scheduleAutosave();
  }else{
    const text = getActiveOutputValue();
    const paras = splitOutputParagraphsWithOffsets(text).map(p => p.text);
    const insertAt = position === "after" ? current.index + 1 : current.index;
    paras.splice(insertAt, 0, separator);
    setActiveOutputValue(paras.join("\n\n"));
    refreshChapterViews();
    scheduleAutosave();
  }
  showToast(position === "after" ? "문단 아래에 구분선을 넣었습니다." : "문단 위에 구분선을 넣었습니다.");
}
function handleChapterDividerClick(e){
  const pageBtn = e.target.closest("button[data-chapter-match-page]");
  if(pageBtn){
    const max = Math.max(0, currentChapterMatches.length - 1);
    chapterMatchPage = pageBtn.dataset.chapterMatchPage === "next" ? Math.min(max, chapterMatchPage + 1) : Math.max(0, chapterMatchPage - 1);
    updateChapterDividerPanel();
    scheduleAutosave();
    return;
  }
  if(e.target.closest("button[data-chapter-insert]")) insertChapterDividerAtCurrentMatch();
}
function getEpubConfig(){
  const title = (epubTitleEl && epubTitleEl.value.trim()) || "정리한 로그";
  return {
    title,
    subtitle: (epubSubtitleEl && epubSubtitleEl.value.trim()) || "",
    author: (epubAuthorEl && epubAuthorEl.value.trim()) || "",
    series: (epubSeriesEl && epubSeriesEl.value.trim()) || "",
    volume: (epubVolumeEl && epubVolumeEl.value.trim()) || "",
    description: (epubDescriptionEl && epubDescriptionEl.value.trim()) || "",
    tags: splitTokens(epubTagsEl ? epubTagsEl.value : ""),
    language: (epubLanguageEl && epubLanguageEl.value.trim()) || "ko",
    chapterMode: chapterSplitModeEl ? chapterSplitModeEl.value : "none",
    chapterSize: Math.max(1, parseInt(chapterSizeEl ? chapterSizeEl.value : "7000", 10) || 7000),
    separator: (chapterSeparatorEl && chapterSeparatorEl.value.trim()) || "—————",
    chapterPrefix: (chapterTitlePrefixEl && chapterTitlePrefixEl.value.trim()) || "Chapter",
    firstChapterTitle: (chapterFirstTitleEl && chapterFirstTitleEl.value.trim()) || "",
    stylePreset: epubStylePresetEl ? epubStylePresetEl.value : "novel"
  };
}
function getChapterTitle(idx, cfg){
  const c = cfg || getEpubConfig();
  if(idx === 0 && c.firstChapterTitle) return c.firstChapterTitle;
  return `${c.chapterPrefix} ${idx + 1}`;
}
function chapterLeadText(ch){
  const raw = ch && ch.bodyHtml ? blockHtmlToText(ch.bodyHtml) : String((ch && ch.body) || "");
  return raw.replace(/\s+/g, " ").trim().slice(0, 80);
}
function renderChapterTocHtml(chapters, compact){
  if(!chapters || !chapters.length) return `<div class="emptyState">챕터가 아직 없습니다. 결과가 생기면 목차가 표시됩니다.</div>`;
  const rows = chapters.slice(0, compact ? 12 : 50).map((ch, idx) => {
    const count = fmtNum(stripHTMLTags(ch.body || blockHtmlToText(ch.bodyHtml || "")).length);
    const lead = chapterLeadText(ch);
    return `<div class="chapterTocRow"><b>${idx + 1}</b><span><strong>${escapeHTML(ch.title)}</strong>${lead ? `<small>${escapeHTML(lead)}</small>` : ""}</span><em>${count}자</em></div>`;
  }).join("");
  const more = chapters.length > (compact ? 12 : 50) ? `<div class="miniHelp">외 ${chapters.length - (compact ? 12 : 50)}개 챕터</div>` : "";
  return `<div class="chapterTocBox"><div class="tocSummary"><strong>현재 목차</strong><span>${chapters.length}개 챕터</span></div>${rows}${more}</div>`;
}
function splitTextIntoParagraphs(text){
  return String(text || "").replace(/\r/g,"").split(/\n\s*\n+/).map(p => p.trim()).filter(Boolean);
}
function isConfiguredChapterSeparator(text, cfg){
  const raw = String(text || "");
  const clean = raw.replace(/<[^>]*>/g, "").replace(/&nbsp;/gi, " ").replace(/\s+/g, "").trim();
  const sep = String((cfg && cfg.separator) || (chapterSeparatorEl && chapterSeparatorEl.value) || "—————").replace(/\s+/g, "").trim();
  if(!clean || !sep) return false;
  if(clean === sep) return true;
  const dashLine = /^[\-—―─━_]{3,}$/;
  return dashLine.test(clean) && dashLine.test(sep);
}

function splitTextIntoChapters(text){
  const cfg = getEpubConfig();
  const source = String(text || "").trim();
  if(!source) return [];
  const chapters = [];
  const makeTitle = (idx) => getChapterTitle(idx, cfg);
  if(cfg.chapterMode === "separator"){
    const paras = splitTextIntoParagraphs(source);
    let bucket = [];
    const flush = () => {
      const body = bucket.join("\n\n").trim();
      if(body) chapters.push({title:makeTitle(chapters.length), body});
      bucket = [];
    };
    paras.forEach(p => {
      if(isConfiguredChapterSeparator(p, cfg)) flush();
      else bucket.push(p);
    });
    flush();
  }else if(cfg.chapterMode === "paragraphs"){
    const paras = splitTextIntoParagraphs(source);
    for(let i=0; i<paras.length; i += cfg.chapterSize){
      chapters.push({title:makeTitle(chapters.length), body:paras.slice(i, i + cfg.chapterSize).join("\n\n")});
    }
  }else if(cfg.chapterMode === "chars"){
    const paras = splitTextIntoParagraphs(source);
    let bucket = [], count = 0;
    paras.forEach(p => {
      if(bucket.length && count + p.length > cfg.chapterSize){
        chapters.push({title:makeTitle(chapters.length), body:bucket.join("\n\n")});
        bucket = []; count = 0;
      }
      bucket.push(p); count += p.length;
    });
    if(bucket.length) chapters.push({title:makeTitle(chapters.length), body:bucket.join("\n\n")});
  }else{
    chapters.push({title:cfg.title, body:source});
  }
  return chapters.length ? chapters : [{title:cfg.title, body:source}];
}
function escapeXML(str){
  return String(str || "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#39;");
}
function restoreAllowedInlineSpans(escaped){
  return String(escaped || "").replace(/&lt;span\b([\s\S]*?)&gt;([\s\S]*?)&lt;\/span&gt;/gi, (match, rawAttrs, inner) => {
    const attrs = String(rawAttrs || "");
    const colorMatch = attrs.match(/color\s*:\s*(#[0-9a-fA-F]{6})/i);
    const color = colorMatch ? colorMatch[1] : "";
    const ownerMatch = attrs.match(/data-speaker-owner=&quot;([a-zA-Z_-]+)&quot;/i);
    const hasSpeakerClass = /speaker-label/i.test(attrs);
    const attrParts = [];
    if(hasSpeakerClass) attrParts.push('class="speaker-label"');
    if(ownerMatch) attrParts.push(`data-speaker-owner="${escapeXML(ownerMatch[1])}"`);
    if(color) attrParts.push(`style="color:${color}"`);
    if(!attrParts.length) return inner;
    return `<span ${attrParts.join(" ")}>${inner}</span>`;
  });
}
function paragraphToXhtml(p){
  const lines = String(p || "").split(/\n/).map(line => restoreAllowedInlineSpans(escapeXML(line)));
  return `<p>${lines.join("<br/>")}</p>`;
}
function textToXhtmlBody(text){
  return splitTextIntoParagraphs(text).map(paragraphToXhtml).join("\n");
}
function getEpubCss(){
  const preset = getEpubConfig().stylePreset;
  const fontFace = cachedEpubFontAsset ? `@font-face{font-family:"UploadedEpubFont";src:url("${escapeXML(cachedEpubFontAsset.epubName || cachedEpubFontAsset.name || "uploaded-font.woff")}");} body{font-family:"UploadedEpubFont",serif !important;}` : "";
  const base = `body{line-height:1.82;word-break:keep-all;overflow-wrap:break-word;} p{margin:0 0 1em;} h1{font-size:1.45em;margin:0 0 1.2em;} .cover{text-align:center;} .cover img{max-width:100%;height:auto;} blockquote{margin:1em 0;} .quoteLine{padding:.25em 0 .25em 1em;border-left:4px solid #4f8aa4;background:transparent;border-radius:0;text-align:left;} .quotePostype{padding:.9em 1.05em;border-left:4px solid #4f8aa4;background:#f3f9fc;border-radius:.75em;text-align:left;} .quoteBlog{padding:1em .5em;border-top:1px solid #bdd8e3;border-bottom:1px solid #bdd8e3;border-left:0;background:transparent;border-radius:0;text-align:center;} .quoteSoft{padding:1em 1.1em;border-left:0;background:#eaf5fa;border:1px solid #d4e9f1;border-radius:1em;text-align:center;} .rofan-block[data-owner]{margin:0 0 1em;} .rofan-block[data-kind="scene"]{font-style:normal;}`;
  if(preset === "paper") return fontFace + base + ` body{font-family:serif;} p{text-indent:1em;margin-bottom:.65em;}`;
  if(preset === "script") return fontFace + base + ` body{font-family:sans-serif;} p{margin-bottom:1.1em;} p:nth-child(odd){padding-left:.5em;border-left:2px solid #ddd;}`;
  if(preset === "backup") return fontFace + base + ` body{font-family:monospace;font-size:.92em;} p{white-space:pre-wrap;margin-bottom:1.2em;}`;
  return fontFace + base + ` body{font-family:serif;} p{margin-bottom:.95em;}`;
}
function updateEpubPreview(){
  const text = getPreparedOutputForExport();
  const chapters = getExportChapters();
  const cfg = getEpubConfig();
  if(chapterPreviewEl){
    chapterPreviewEl.innerHTML = renderChapterTocHtml(chapters, false);
  }
  if(chapterTocInlineEl){
    chapterTocInlineEl.innerHTML = renderChapterTocHtml(chapters, true);
  }
  if(epubPreviewEl){
    const first = chapters[0] ? chapters[0].body : "";
    const previewBody = activeMode === "epubedit" && chapters[0] && chapters[0].bodyHtml ? chapterBodyToXhtml(chapters[0]) : splitTextIntoParagraphs(first).slice(0, 12).map(paragraphToXhtml).join("\n");
    epubPreviewEl.innerHTML = `
      <div class="previewMeta"><b>${escapeHTML(cfg.title)}</b>${cfg.author ? `<span>${escapeHTML(cfg.author)}</span>` : ""}<span>${chapters.length || 0}개 챕터</span></div>
      <div class="bookPreview">${previewBody || `<p class="mutedText">미리보기 없음</p>`}</div>`;
  }
}
function safeFileName(name, ext){
  const base = String(name || "download").replace(/[\\/:*?"<>|]/g,"_").replace(/\s+/g,"_").slice(0,80) || "download";
  return base + ext;
}
function downloadBlob(blob, filename){
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function itemKindLabel(kind){ return kind === "scene" ? "scene" : "dialogue"; }
function safeMetaValue(value, fallback){
  const v = String(value || "").replace(/[;\n>]/g, "").trim();
  return v || fallback;
}
function stripCurrentSpeakerLabelsFromItemText(text){
  return stripSpeakerLabelLines(String(text || "")).trim();
}
function shouldKeepSpeakerLabelsForExport(){
  if(!(activeMode === "chat" || activeMode === "classic")) return false;
  if(!labelSpeakersEl || !labelSpeakersEl.checked) return false;
  const mode = speakerLabelModeEl ? speakerLabelModeEl.value : "output";
  return mode === "output";
}
function mergeStructuredItemsByBlock(items){
  const out = [];
  (items || []).forEach((item, idx) => {
    if(!item || !String(item.text || "").trim()) return;
    const blockId = item.blockId || ("block-" + idx);
    const owner = item.owner || "character";
    const kind = item.kind || "normal";
    const last = out[out.length - 1];
    if(last && last.blockId === blockId && last.owner === owner && last.kind === kind){
      last.text = [last.text, item.text].filter(Boolean).join("\n\n");
    }else{
      out.push({blockId, owner, kind, text:item.text || ""});
    }
  });
  return out;
}

function structuredItemsToHtml(items){
  return mergeStructuredItemsByBlock(items).map((item, idx) => {
    const owner = escapeAttr(safeMetaValue(item.owner, idx === 0 ? "character" : "character"));
    const kind = escapeAttr(safeMetaValue(item.kind, "normal"));
    const blockId = escapeAttr(safeMetaValue(item.blockId, "block-" + idx));
    const cleanText = shouldKeepSpeakerLabelsForExport() ? String(item.text || "").trim() : stripCurrentSpeakerLabelsFromItemText(item.text || "");
    const paragraphs = String(cleanText || "").split(/\n+/).filter(Boolean).map(t => `<p>${htmlFromResultText(t)}</p>`).join("\n");
    return paragraphs ? `<div class="rofan-block" data-block-id="${blockId}" data-owner="${owner}" data-kind="${kind}">${paragraphs}</div>` : "";
  }).filter(Boolean).join("\n");
}
function structuredItemsToMarkdown(items){
  return mergeStructuredItemsByBlock(items).map((item, idx) => {
    const owner = safeMetaValue(item.owner, idx === 0 ? "character" : "character");
    const kind = safeMetaValue(item.kind, "normal");
    const blockId = safeMetaValue(item.blockId, "block-" + idx);
    const body = shouldKeepSpeakerLabelsForExport() ? String(item.text || "").trim() : stripCurrentSpeakerLabelsFromItemText(item.text || "");
    return body ? `<!-- rofan:block=${blockId};owner=${owner};kind=${kind} -->\n${body}` : "";
  }).filter(Boolean).join("\n\n");
}

function chunksToStructuredMarkdown(chunks){
  return structuredItemsToMarkdown((chunks || []).filter(c => c && String(c.text || '').trim()).map((c, idx) => ({
    blockId: c.blockId || ('block-' + idx),
    owner: c.owner || 'character',
    kind: c.kind || 'normal',
    text: c.text || ''
  })));
}
function parseRofanCommentAttrs(src){
  const attrs = {};
  String(src || "").split(";").forEach(part => {
    const eq = part.indexOf("=");
    if(eq < 0) return;
    const key = part.slice(0, eq).trim().toLowerCase();
    const val = part.slice(eq + 1).trim();
    if(key) attrs[key] = val;
  });
  return attrs;
}
function parseStructuredMarkdownToChunks(raw){
  const text = String(raw || '').replace(/\r/g, '');
  const re = /<!--\s*rofan:([^>]*)-->/gi;
  let match, last = 0, items = [];
  while((match = re.exec(text))){
    if(items.length){ items[items.length - 1].body = text.slice(last, match.index).trim(); }
    const attrs = parseRofanCommentAttrs(match[1] || "");
    const owner = safeMetaValue(attrs.owner, 'character');
    const kind = safeMetaValue(attrs.kind, 'normal');
    let block = safeMetaValue(attrs.block || attrs.blockid || attrs['block-id'], '');
    if(!block){
      const prev = items[items.length - 1];
      block = prev && prev.owner === owner ? prev.block : ('md-' + items.length);
    }
    items.push({owner, kind, block, body:''});
    last = re.lastIndex;
  }
  if(!items.length) return null;
  items[items.length - 1].body = text.slice(last).trim();
  const chunks = [];
  let seq = 0;
  items.forEach((it) => {
    String(it.body || '').split(/\n\s*\n+/).map(p => p.trim()).filter(Boolean).forEach(p => {
      chunks.push({id:'mdc-' + (seq++), kind:it.kind || 'normal', owner:it.owner || 'character', text:p, color:'', fromTable:false, fromDetails:false, blockId:it.block || ('md-' + seq)});
    });
  });
  return chunks.length ? normalizeChunkResponseBlocks(chunks) : null;
}

function structuredMarkdownToHtml(raw){
  const chunks = parseStructuredMarkdownToChunks(raw);
  return chunks ? structuredItemsToHtml(chunks.map(c => ({blockId:c.blockId, owner:c.owner, kind:c.kind, text:c.text}))) : '';
}
function parseHtmlToRofanChunks(html){
  const holder = document.createElement('div');
  holder.innerHTML = sanitizePastedHTML(extractLikelyChatHTML(String(html || '')));
  return parseRofanChatChunks(holder).chunks || [];
}
function fileContentToChunks(raw, fileName){
  const lower = String(fileName || '').toLowerCase();
  const text = String(raw || '');
  if(/\.(md|markdown)$/i.test(lower) || /<!--\s*rofan:/i.test(text)){
    const chunks = parseStructuredMarkdownToChunks(text);
    if(chunks && chunks.length) return chunks;
  }
  if(/\.(mht|mhtml)$/i.test(lower) || /MIME-Version:\s*1\.0/i.test(text) || /Content-Type:\s*multipart\/related/i.test(text)){
    const html = extractHTMLFromMHT(text);
    const chunks = parseHtmlToRofanChunks(html);
    if(chunks && chunks.length) return chunks;
  }
  if(/\.(html|htm)$/i.test(lower) || looksLikeHTML(text)){
    const chunks = parseHtmlToRofanChunks(text);
    if(chunks && chunks.length) return chunks;
  }
  return null;
}
function cloneChunks(chunks){
  return (chunks || []).map((c, idx) => Object.assign({}, c, {id:c.id || ('clone-' + idx)}));
}
function chunksDisplayText(chunks){
  return (chunks || []).map(c => c.text || '').filter(Boolean).join("\n\n").trim();
}
function sliceChunksByStartEnd(chunks, startNeedle, endNeedle){
  const records = [];
  let text = "";
  (chunks || []).forEach((c, idx) => {
    if(idx) text += "\n\n";
    const start = text.length;
    text += c.text || "";
    const end = text.length;
    records.push({chunk:c, start, end});
  });
  let rangeStart = 0, rangeEnd = text.length;
  const start = String(startNeedle || "").trim();
  const end = String(endNeedle || "").trim();
  if(start){ const i = text.indexOf(start); if(i >= 0) rangeStart = i; }
  if(end){ const j = text.indexOf(end, rangeStart); if(j >= 0) rangeEnd = j + end.length; }
  return records.filter(r => r.end > rangeStart && r.start < rangeEnd).map(r => Object.assign({}, r.chunk));
}
function fileContentToStructuredMarkdown(raw, fileName){
  const chunks = fileContentToChunks(raw, fileName);
  if(chunks && chunks.length) return chunksToStructuredMarkdown(chunks);
  return String(raw || '');
}

function exportedBodyHtml(){
  if(activeMode !== "epubedit" && lastStructuredItems && lastStructuredItems.length){
    return structuredItemsToHtml(lastStructuredItems);
  }
  return getExportChapters().map(ch => chapterBodyToXhtml(ch)).join("\n");
}

function buildStandaloneHTML(){
  const cfg = getEpubConfig();
  const chapters = getExportChapters();
  const toc = chapters.map((ch, idx) => `<li><a href="#ch${idx+1}">${escapeXML(ch.title)}</a></li>`).join("\n");
  const body = (activeMode !== "epubedit" && lastStructuredItems && lastStructuredItems.length)
    ? `<section id="ch1"><h1>${escapeXML(cfg.title)}</h1>${structuredItemsToHtml(lastStructuredItems)}</section>`
    : chapters.map((ch, idx) => `<section id="ch${idx+1}"><h1>${escapeXML(ch.title)}</h1>${chapterBodyToXhtml(ch)}</section>`).join("\n");
  return `<!doctype html><html lang="${escapeXML(cfg.language)}"><head><meta charset="utf-8"><title>${escapeXML(cfg.title)}</title><style>${getEpubCss()} nav{margin-bottom:2rem;padding:1rem;border:1px solid #ddd;border-radius:12px;} section{max-width:720px;margin:0 auto 3rem;}</style></head><body><nav><strong>목차</strong><ol>${toc}</ol></nav>${body}</body></html>`;
}
function downloadHtml(){
  const cfg = getEpubConfig();
  downloadBlob(new Blob([buildStandaloneHTML()], {type:"text/html;charset=utf-8"}), safeDownloadFileName(".html", cfg.title));
}
function downloadMarkdown(){
  const cfg = getEpubConfig();
  const chapters = getExportChapters(true);
  let md = `# ${cfg.title}\n\n`;
  if(cfg.subtitle) md += `_${cfg.subtitle}_\n\n`;
  if(cfg.author) md += `작가: ${cfg.author}\n\n`;
  if(cfg.description) md += `${cfg.description}\n\n`;
  if(activeMode !== "epubedit" && lastStructuredItems && lastStructuredItems.length){
    md += structuredItemsToMarkdown(lastStructuredItems) + "\n";
  }else if(activeMode === "epubedit" && editorStructuredMarkdown()){
    md += editorStructuredMarkdown() + "\n";
  }else if(activeMode === "epubedit"){
    md += editorHtmlForExport() + "\n";
  }else{
    chapters.forEach(ch => { md += `## ${ch.title}\n\n${ch.body}\n\n`; });
  }
  downloadBlob(new Blob([md], {type:"text/markdown;charset=utf-8"}), safeDownloadFileName(".md", cfg.title));
}
function downloadDoc(){
  const cfg = getEpubConfig();
  const html = buildStandaloneHTML();
  downloadBlob(new Blob([html], {type:"application/msword;charset=utf-8"}), safeDownloadFileName(".doc", cfg.title));
}
function makeXhtmlDoc(title, body){
  return `<?xml version="1.0" encoding="utf-8"?>\n<!DOCTYPE html>\n<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="${escapeXML(getEpubConfig().language)}" xml:lang="${escapeXML(getEpubConfig().language)}"><head><meta charset="utf-8"/><title>${escapeXML(title)}</title><link rel="stylesheet" type="text/css" href="styles.css"/></head><body>${body}</body></html>`;
}
async function getCoverInfo(){
  const file = epubCoverInputEl && epubCoverInputEl.files && epubCoverInputEl.files[0];
  const typeMap = {jpg:"image/jpeg", jpeg:"image/jpeg", png:"image/png", webp:"image/webp", gif:"image/gif"};
  if(file){
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g,"") || "jpg";
    return {name:`cover.${ext}`, media:typeMap[ext] || file.type || "image/jpeg", data:new Uint8Array(await file.arrayBuffer())};
  }
  if(cachedCoverAsset && cachedCoverAsset.dataUrl){
    const ext = ((cachedCoverAsset.name || "cover.jpg").split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g,"") || "jpg";
    return {name:`cover.${ext}`, media:typeMap[ext] || cachedCoverAsset.type || "image/jpeg", data:dataUrlToUint8Array(cachedCoverAsset.dataUrl)};
  }
  return null;
}
function uuidLike(){
  const s = `${Date.now()}-${Math.random()}-${getEpubConfig().title}`;
  return "id-" + hashString(s);
}
async function downloadEpub(){
  const cfg = getEpubConfig();
  const chapters = getExportChapters();
  if(!chapters.length){ showToast("EPUB으로 만들 결과가 없습니다."); return; }
  const cover = await getCoverInfo();
  const entries = [];
  entries.push({name:"mimetype", data:"application/epub+zip"});
  entries.push({name:"META-INF/container.xml", data:`<?xml version="1.0" encoding="UTF-8"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`});
  entries.push({name:"OEBPS/styles.css", data:getEpubCss()});
  const chapterItems = [];
  chapters.forEach((ch, idx) => {
    const file = `chapter-${String(idx+1).padStart(3,"0")}.xhtml`;
    chapterItems.push({id:`ch${idx+1}`, href:file, title:ch.title});
    entries.push({name:`OEBPS/${file}`, data:makeXhtmlDoc(ch.title, `<h1>${escapeXML(ch.title)}</h1>${chapterBodyToXhtml(ch)}`)});
  });
  if(cachedEpubFontAsset && cachedEpubFontAsset.dataUrl){
    entries.push({name:`OEBPS/${cachedEpubFontAsset.epubName || cachedEpubFontAsset.name}`, data:dataUrlToUint8Array(cachedEpubFontAsset.dataUrl)});
  }
  if(cover){
    entries.push({name:`OEBPS/${cover.name}`, data:cover.data});
    entries.push({name:"OEBPS/cover.xhtml", data:makeXhtmlDoc("Cover", `<section class="cover"><img src="${escapeXML(cover.name)}" alt="cover"/></section>`)});
  }
  const navItems = chapterItems.map(item => `<li><a href="${escapeXML(item.href)}">${escapeXML(item.title)}</a></li>`).join("");
  entries.push({name:"OEBPS/nav.xhtml", data:makeXhtmlDoc("목차", `<nav epub:type="toc" id="toc"><h1>목차</h1><ol>${navItems}</ol></nav>`)});
  const uid = uuidLike();
  const metaTags = [
    `<dc:identifier id="pub-id">${escapeXML(uid)}</dc:identifier>`,
    `<dc:title>${escapeXML(cfg.title)}</dc:title>`,
    cfg.subtitle ? `<dc:title id="subtitle">${escapeXML(cfg.subtitle)}</dc:title>` : "",
    cfg.author ? `<dc:creator>${escapeXML(cfg.author)}</dc:creator>` : "",
    `<dc:language>${escapeXML(cfg.language)}</dc:language>`,
    cfg.description ? `<dc:description>${escapeXML(cfg.description)}</dc:description>` : "",
    ...cfg.tags.map(tag => `<dc:subject>${escapeXML(tag)}</dc:subject>`),
    cfg.series ? `<meta property="belongs-to-collection" id="series">${escapeXML(cfg.series)}</meta>` : "",
    cfg.volume ? `<meta property="group-position">${escapeXML(cfg.volume)}</meta>` : "",
    `<meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d{3}Z$/, "Z")}</meta>`,
    cover ? `<meta name="cover" content="cover-image"/>` : ""
  ].filter(Boolean).join("\n");
  const manifest = [
    `<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>`,
    `<item id="css" href="styles.css" media-type="text/css"/>`,
    cover ? `<item id="cover" href="cover.xhtml" media-type="application/xhtml+xml"/>` : "",
    cover ? `<item id="cover-image" href="${escapeXML(cover.name)}" media-type="${escapeXML(cover.media)}" properties="cover-image"/>` : "",
    cachedEpubFontAsset ? `<item id="uploaded-font" href="${escapeXML(cachedEpubFontAsset.epubName || cachedEpubFontAsset.name)}" media-type="${escapeXML(cachedEpubFontAsset.type || "font/woff")}"/>` : "",
    ...chapterItems.map(item => `<item id="${item.id}" href="${escapeXML(item.href)}" media-type="application/xhtml+xml"/>`)
  ].filter(Boolean).join("\n");
  const spine = [cover ? `<itemref idref="cover" linear="no"/>` : "", ...chapterItems.map(item => `<itemref idref="${item.id}"/>`)].filter(Boolean).join("\n");
  const opf = `<?xml version="1.0" encoding="UTF-8"?><package version="3.0" unique-identifier="pub-id" xmlns="http://www.idpf.org/2007/opf" xmlns:dc="http://purl.org/dc/elements/1.1/"><metadata>${metaTags}</metadata><manifest>${manifest}</manifest><spine>${spine}</spine></package>`;
  entries.push({name:"OEBPS/content.opf", data:opf});
  const blob = createZipBlob(entries, "application/epub+zip");
  downloadBlob(blob, safeDownloadFileName(".epub", cfg.title));
}
let CRC_TABLE = null;
function getCRCTable(){
  if(CRC_TABLE) return CRC_TABLE;
  CRC_TABLE = new Uint32Array(256);
  for(let n=0; n<256; n++){
    let c=n;
    for(let k=0; k<8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    CRC_TABLE[n] = c >>> 0;
  }
  return CRC_TABLE;
}
function crc32(bytes){
  const table = getCRCTable();
  let c = 0 ^ -1;
  for(let i=0; i<bytes.length; i++) c = (c >>> 8) ^ table[(c ^ bytes[i]) & 0xff];
  return (c ^ -1) >>> 0;
}
function dosDateTime(date){
  const d = date || new Date();
  const time = ((d.getHours() & 31) << 11) | ((d.getMinutes() & 63) << 5) | ((Math.floor(d.getSeconds()/2)) & 31);
  const day = ((d.getFullYear() - 1980) << 9) | ((d.getMonth()+1) << 5) | d.getDate();
  return {time, day};
}
function writeU16(dv, offset, value){ dv.setUint16(offset, value, true); }
function writeU32(dv, offset, value){ dv.setUint32(offset, value >>> 0, true); }
function createZipBlob(entries, type){
  const enc = new TextEncoder();
  const chunks = [];
  const central = [];
  let offset = 0;
  const dt = dosDateTime(new Date());
  entries.forEach(entry => {
    const nameBytes = enc.encode(entry.name);
    const dataBytes = entry.data instanceof Uint8Array ? entry.data : enc.encode(String(entry.data || ""));
    const crc = crc32(dataBytes);
    const local = new Uint8Array(30 + nameBytes.length);
    const dv = new DataView(local.buffer);
    writeU32(dv,0,0x04034b50); writeU16(dv,4,20); writeU16(dv,6,0x0800); writeU16(dv,8,0);
    writeU16(dv,10,dt.time); writeU16(dv,12,dt.day); writeU32(dv,14,crc); writeU32(dv,18,dataBytes.length); writeU32(dv,22,dataBytes.length);
    writeU16(dv,26,nameBytes.length); writeU16(dv,28,0); local.set(nameBytes,30);
    chunks.push(local, dataBytes);
    const cd = new Uint8Array(46 + nameBytes.length);
    const cdv = new DataView(cd.buffer);
    writeU32(cdv,0,0x02014b50); writeU16(cdv,4,20); writeU16(cdv,6,20); writeU16(cdv,8,0x0800); writeU16(cdv,10,0);
    writeU16(cdv,12,dt.time); writeU16(cdv,14,dt.day); writeU32(cdv,16,crc); writeU32(cdv,20,dataBytes.length); writeU32(cdv,24,dataBytes.length);
    writeU16(cdv,28,nameBytes.length); writeU16(cdv,30,0); writeU16(cdv,32,0); writeU16(cdv,34,0); writeU16(cdv,36,0); writeU32(cdv,38,0); writeU32(cdv,42,offset);
    cd.set(nameBytes,46);
    central.push(cd);
    offset += local.length + dataBytes.length;
  });
  const centralSize = central.reduce((sum, c) => sum + c.length, 0);
  const centralOffset = offset;
  chunks.push(...central);
  const end = new Uint8Array(22);
  const edv = new DataView(end.buffer);
  writeU32(edv,0,0x06054b50); writeU16(edv,4,0); writeU16(edv,6,0); writeU16(edv,8,entries.length); writeU16(edv,10,entries.length); writeU32(edv,12,centralSize); writeU32(edv,16,centralOffset); writeU16(edv,20,0);
  chunks.push(end);
  return new Blob(chunks, {type:type || "application/zip"});
}
function collectPresetValues(){
  const ids = ["removeDetails","removeEmptyLines","removeCellEmptyLines","removeEmojiSentences","removeHTML","removeDecor","protectEnabled","protectToken","quoteStyle","indentOutput","deleteContainsEnabled","deleteContainsToken","deleteContainsMode","removeTables","reviewDuplicates","reviewOocPairs","oocCascadeMode","speakerLabelMode","labelSpeakers","userName","characterName","speakerMarkerPreset","speakerMarkerCustom","speakerLabelColor","speakerUserColor","speakerCharacterColor","speakerColorTarget","epubTitle","epubSubtitle","epubAuthor","epubSeries","epubVolume","epubDescription","epubTags","epubLanguage","chapterSplitMode","chapterSize","chapterSeparator","chapterTitlePrefix","chapterFirstTitle","chapterKeywordInput","chapterOrderInput","chapterPosition","epubStylePreset","epubTextMode","epubEditTextColor","epubQuoteColor","epubEditTextColorR","epubEditTextColorG","epubEditTextColorB","epubQuoteColorR","epubQuoteColorG","epubQuoteColorB"];
  const data = {};
  ids.forEach(id => {
    const el = document.getElementById(id);
    if(!el) return;
    data[id] = el.type === "checkbox" ? el.checked : el.value;
  });
  return data;
}
function refreshColorWidgets(){
  syncRgbFromColor(epubEditTextColorEl, epubEditTextColorREl, epubEditTextColorGEl, epubEditTextColorBEl);
  syncRgbFromColor(epubQuoteColorEl, epubQuoteColorREl, epubQuoteColorGEl, epubQuoteColorBEl);
  [speakerUserColorEl, speakerCharacterColorEl].forEach(updateColorSwatch);
  updateQuoteColorPreview();
}
function applyPresetValues(data){
  Object.entries(data || {}).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if(!el) return;
    if(el.type === "checkbox") el.checked = !!value;
    else el.value = value;
  });
  refreshColorWidgets();
}
function saveCurrentPreset(){
  localStorage.setItem("rofan-cleaner-preset", JSON.stringify(collectPresetValues()));
  showToast("현재 옵션을 저장했습니다.");
  scheduleAutosave();
}
function loadSavedPreset(){
  const raw = localStorage.getItem("rofan-cleaner-preset");
  if(!raw){ showToast("저장된 프리셋이 없습니다."); return; }
  try{
    applyPresetValues(JSON.parse(raw));
    transformText();
    updateChapterDividerPanel();
    scheduleAutosave();
    showToast("프리셋을 불러왔습니다.");
  }catch(err){
    console.error(err);
    showToast("프리셋을 불러오지 못했습니다.");
  }
}
function clearSavedPreset(){
  if(!window.confirm("저장된 프리셋을 삭제하시겠습니까?")) return;
  localStorage.removeItem("rofan-cleaner-preset");
  showToast("저장된 프리셋을 삭제했습니다.");
}
function updateFileNameLabel(inputEl, labelEl, emptyText){
  if(!labelEl) return;
  const file = inputEl && inputEl.files && inputEl.files[0];
  labelEl.textContent = file ? (file.name || "선택됨") : (emptyText || "선택된 파일 없음");
}


wireAutosave();


// ------------------ EPUB 수정 탭 / 파일 발췌 ------------------
function plainTextToHtml(text){
  return String(text || "").replace(/\r/g, "").split(/\n\s*\n+/).map(p => `<p>${escapeHTML(p).replace(/\n/g,"<br>")}</p>`).join("\n");
}
function editorPlainText(el){
  if(!el) return "";
  return (el.innerText || el.textContent || "").replace(/\u00a0/g," ").trim();
}
async function readFileAsTextSmart(file){
  const buffer = await readFileAsArrayBuffer(file);
  const bytes = new Uint8Array(buffer);
  return decodeBytesSmart(bytes);
}
async function loadClassicFile(){
  const file = classicFileInput && classicFileInput.files && classicFileInput.files[0];
  if(!file) return;
  try{
    const raw = await readFileAsTextSmart(file);
    const chunks = fileContentToChunks(raw, file.name || "");
    if(chunks && chunks.length){
      classicLoadedChunks = chunks;
      classicLoadedFileText = chunksDisplayText(chunks);
    }else{
      classicLoadedChunks = null;
      classicLoadedFileText = String(raw || "");
    }
    applyClassicExcerpt();
    showToast("파일을 불러왔습니다.");
  }catch(err){ console.error(err); showToast("파일을 읽지 못했습니다."); }
}

function sliceByStartEnd(text, startNeedle, endNeedle){
  let s = String(text || "");
  const start = String(startNeedle || "").trim();
  const end = String(endNeedle || "").trim();
  if(start){ const i = s.indexOf(start); if(i >= 0) s = s.slice(i); }
  if(end){ const j = s.indexOf(end); if(j >= 0) s = s.slice(0, j + end.length); }
  return s.trim();
}
function applyClassicExcerpt(){
  const start = excerptStartTextEl ? excerptStartTextEl.value : "";
  const end = excerptEndTextEl ? excerptEndTextEl.value : "";
  let next = "";
  if(classicLoadedChunks && classicLoadedChunks.length){
    classicActiveChunks = sliceChunksByStartEnd(classicLoadedChunks, start, end);
    next = chunksDisplayText(classicActiveChunks);
  }else{
    const base = classicLoadedFileText || (input ? input.value : "");
    next = sliceByStartEnd(base, start, end);
    classicActiveChunks = null;
  }
  classicActiveDisplayText = next;
  isApplyingClassicExcerpt = true;
  if(input) input.value = next;
  isApplyingClassicExcerpt = false;
  transformText();
  scheduleAutosave();
}

function activateEpubEditTab(){
  activeMode = "epubedit";
  document.querySelectorAll(".tab").forEach(t => {
    const on = t.dataset.tab === activeMode;
    t.classList.toggle("active", on);
    t.setAttribute("aria-selected", on ? "true" : "false");
  });
  classicPanel.classList.add("hidden");
  chatPanel.classList.add("hidden");
  if(epubEditPanel) epubEditPanel.classList.remove("hidden");
  updateModeVisibility();
}
async function loadEpubEditFile(){
  const file = epubEditFileInput && epubEditFileInput.files && epubEditFileInput.files[0];
  if(!file) return;
  try{
    const lower = (file.name || "").toLowerCase();
    let html = "";
    if(/\.epub$/i.test(lower)){
      html = await extractHtmlFromEpubFile(file);
    }else{
      const raw = await readFileAsTextSmart(file);
      if(/\.(html|htm)$/i.test(lower) || looksLikeHTML(raw)) html = sanitizeEditorHTML(raw);
      else html = markdownOrTextToEditorHTML(raw, /\.(md|markdown)$/i.test(lower));
    }
    if(!html || !stripHTMLTags(html).trim()){ showToast("불러올 본문을 찾지 못했습니다."); return; }
    activateEpubEditTab();
    epubEditEditor.innerHTML = html;
    cachedEpubEditFileName = file.name || "원고 파일";
    transformText();
    scheduleAutosave();
    showToast("EPUB 수정 원고를 불러왔습니다.");
  }catch(err){ console.error(err); showToast("파일을 읽지 못했습니다."); }
}
function parseStructuredMarkdown(raw){
  const chunks = parseStructuredMarkdownToChunks(raw);
  if(!chunks || !chunks.length) return "";
  return structuredItemsToHtml(chunks.map(c => ({blockId:c.blockId, owner:c.owner, kind:c.kind, text:c.text})));
}

function markdownOrTextToEditorHTML(raw, isMarkdown){
  let text = String(raw || "").replace(/\r/g, "");
  if(isMarkdown){
    const structured = parseStructuredMarkdown(text);
    if(structured) return structured;
    text = text.replace(/^#{1,6}\s+/gm, "");
    text = text.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/__([^_]+)__/g, "$1");
    text = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1");
    text = text.replace(/^>\s?/gm, "");
  }
  return plainTextToHtml(text);
}
function sanitizeInlineStyle(style){
  const allowed = [];
  String(style || "").split(";").forEach(part => {
    const [rawName, ...rest] = part.split(":");
    if(!rawName || !rest.length) return;
    const name = rawName.trim().toLowerCase();
    const value = rest.join(":").trim();
    if(!/^(color|font-size|font-family|background|background-color|border|border-color|border-left|border-left-color|border-top|border-top-color|border-bottom|border-bottom-color|border-radius|padding|margin|text-align|line-height|font-weight|font-style)$/.test(name)) return;
    if(/url\s*\(|expression\s*\(|javascript:/i.test(value)) return;
    allowed.push(`${name}:${value}`);
  });
  return allowed.join(";");
}
function sanitizeEditorHTML(html){
  const doc = new DOMParser().parseFromString(String(html || ""), "text/html");
  doc.querySelectorAll("script,style,meta,link,iframe,object,embed").forEach(n => n.remove());
  doc.body.querySelectorAll("*").forEach(el => {
    [...el.attributes].forEach(attr => {
      const name = attr.name.toLowerCase();
      if(name.startsWith("on")) el.removeAttribute(attr.name);
      else if(name === "style"){ const clean = sanitizeInlineStyle(attr.value); clean ? el.setAttribute("style", clean) : el.removeAttribute("style"); }
      else if(!(name === "class" || name === "style" || name === "data-owner" || name === "data-kind" || name === "title" || name === "lang" || name === "xml:lang")){ el.removeAttribute(attr.name); }
    });
  });
  return doc.body.innerHTML || plainTextToHtml(doc.body.innerText || "");
}
async function inflateRawDeflate(bytes){
  if(!("DecompressionStream" in window)) throw new Error("deflate unsupported");
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}
function readU16(bytes, o){ return bytes[o] | (bytes[o+1] << 8); }
function readU32(bytes, o){ return (bytes[o] | (bytes[o+1]<<8) | (bytes[o+2]<<16) | (bytes[o+3]<<24)) >>> 0; }
async function readZipTextEntries(bytes){
  const entries = [];
  let eocd = -1;
  for(let i=bytes.length-22; i>=0 && i>bytes.length-66000; i--){ if(readU32(bytes,i)===0x06054b50){ eocd=i; break; } }
  if(eocd < 0) throw new Error("zip eocd not found");
  const count = readU16(bytes, eocd+10);
  let pos = readU32(bytes, eocd+16);
  for(let n=0; n<count; n++){
    if(readU32(bytes,pos)!==0x02014b50) break;
    const method=readU16(bytes,pos+10), compSize=readU32(bytes,pos+20), nameLen=readU16(bytes,pos+28), extraLen=readU16(bytes,pos+30), commentLen=readU16(bytes,pos+32), localOff=readU32(bytes,pos+42);
    const name = new TextDecoder().decode(bytes.slice(pos+46,pos+46+nameLen));
    pos += 46 + nameLen + extraLen + commentLen;
    if(!/\.(xhtml|html|htm|opf|ncx)$/i.test(name)) continue;
    const lo = localOff;
    const lfNameLen=readU16(bytes,lo+26), lfExtraLen=readU16(bytes,lo+28);
    const dataStart = lo + 30 + lfNameLen + lfExtraLen;
    let data = bytes.slice(dataStart, dataStart + compSize);
    if(method === 8) data = await inflateRawDeflate(data);
    else if(method !== 0) continue;
    entries.push({name, text:new TextDecoder("utf-8").decode(data)});
  }
  return entries;
}
async function extractHtmlFromEpubFile(file){
  const bytes = new Uint8Array(await file.arrayBuffer());
  const entries = await readZipTextEntries(bytes);
  const bodyEntries = entries.filter(e => /\.(xhtml|html|htm)$/i.test(e.name) && !/nav|toc|cover/i.test(e.name)).sort((a,b)=>a.name.localeCompare(b.name));
  const html = bodyEntries.map(e => sanitizeEditorHTML(e.text)).join("\n<hr/>\n");
  return html || "";
}
function selectEditorRangeForText(query){
  if(!epubEditEditor || !query) return false;
  const walker = document.createTreeWalker(epubEditEditor, NodeFilter.SHOW_TEXT);
  let node;
  while((node = walker.nextNode())){
    const idx = node.nodeValue.toLowerCase().indexOf(String(query).toLowerCase());
    if(idx >= 0){
      const range = document.createRange();
      range.setStart(node, idx); range.setEnd(node, idx + query.length);
      const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
      node.parentElement && node.parentElement.scrollIntoView({behavior:"smooth", block:"center"});
      return true;
    }
  }
  return false;
}
function findInEpubEditor(){
  const q = epubFindTextEl ? epubFindTextEl.value.trim() : "";
  if(!q){ showToast("찾을 내용을 입력하세요."); return; }
  showToast(selectEditorRangeForText(q) ? "찾았습니다." : "찾지 못했습니다.");
}
function replaceOneInEpubEditor(){
  const q = epubFindTextEl ? epubFindTextEl.value : "";
  const r = epubReplaceTextEl ? epubReplaceTextEl.value : "";
  if(!q) return;
  if(selectEditorRangeForText(q)){
    document.execCommand("insertText", false, r);
    transformText(); scheduleAutosave(); showToast("바꿨습니다.");
  }else showToast("찾지 못했습니다.");
}
function replaceAllInEpubEditor(){
  const q = epubFindTextEl ? epubFindTextEl.value : "";
  const r = epubReplaceTextEl ? epubReplaceTextEl.value : "";
  if(!q || !epubEditEditor) return;
  const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"), "gi");
  epubEditEditor.innerHTML = epubEditEditor.innerHTML.replace(re, escapeHTML(r));
  transformText(); scheduleAutosave(); showToast("모두 바꿨습니다.");
}
function rememberEditorSelection(){
  const sel = window.getSelection();
  if(!sel || !sel.rangeCount || !epubEditEditor) return;
  const range = sel.getRangeAt(0);
  if(epubEditEditor.contains(range.commonAncestorContainer)) savedEditorRange = range.cloneRange();
}
function restoreEditorSelection(){
  if(!savedEditorRange || !epubEditEditor) return false;
  try{
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(savedEditorRange.cloneRange());
    epubEditEditor.focus({preventScroll:true});
    return true;
  }catch(_err){ return false; }
}
function getActiveEditorRange(){
  let sel = window.getSelection();
  if(sel && sel.rangeCount){
    const range = sel.getRangeAt(0);
    if(epubEditEditor && epubEditEditor.contains(range.commonAncestorContainer)){
      savedEditorRange = range.cloneRange();
      return range;
    }
  }
  if(restoreEditorSelection()){
    sel = window.getSelection();
    if(sel && sel.rangeCount) return sel.getRangeAt(0);
  }
  return null;
}
function getSelectedHtml(){
  const range = getActiveEditorRange();
  if(!range || range.collapsed) return "";
  const div = document.createElement("div");
  div.appendChild(range.cloneContents());
  return div.innerHTML || escapeHTML(range.toString());
}
function replaceSelectionWithHtml(html){
  const range = getActiveEditorRange();
  if(!range || range.collapsed) return false;
  if(epubEditEditor && !epubEditEditor.contains(range.commonAncestorContainer)) return false;
  range.deleteContents();
  const frag = range.createContextualFragment(html);
  const last = frag.lastChild;
  range.insertNode(frag);
  const sel = window.getSelection();
  if(last){
    const next = document.createRange();
    next.setStartAfter(last);
    next.collapse(true);
    sel.removeAllRanges();
    sel.addRange(next);
    savedEditorRange = next.cloneRange();
  }
  epubEditEditor.focus({preventScroll:true});
  return true;
}
function clearQuoteLongPressTimer(){
  if(quoteLongPressTimer){ clearTimeout(quoteLongPressTimer); quoteLongPressTimer = null; }
  quoteLongPressMeta = null;
}
function closestEditorQuote(target){
  const quote = target && target.closest ? target.closest("blockquote") : null;
  return quote && epubEditEditor && epubEditEditor.contains(quote) ? quote : null;
}
function showQuoteContextMenu(quote, x, y){
  if(!quoteContextMenuEl || !quote) return;
  currentQuoteMenuTarget = quote;
  quoteContextMenuEl.hidden = false;
  quoteContextMenuEl.style.left = "0px";
  quoteContextMenuEl.style.top = "0px";
  const rect = quoteContextMenuEl.getBoundingClientRect();
  const pad = 10;
  const left = Math.max(pad, Math.min((x || pad), window.innerWidth - rect.width - pad));
  const top = Math.max(pad, Math.min((y || pad), window.innerHeight - rect.height - pad));
  quoteContextMenuEl.style.left = left + "px";
  quoteContextMenuEl.style.top = top + "px";
}
function hideQuoteContextMenu(){
  if(quoteContextMenuEl) quoteContextMenuEl.hidden = true;
  currentQuoteMenuTarget = null;
}
function handleQuoteContextMenu(e){
  const quote = closestEditorQuote(e.target);
  if(!quote) return;
  e.preventDefault();
  clearQuoteLongPressTimer();
  showQuoteContextMenu(quote, e.clientX, e.clientY);
}
function handleQuotePointerDown(e){
  if(activeMode !== "epubedit" || !epubEditEditor) return;
  const quote = closestEditorQuote(e.target);
  if(!quote) return;
  clearQuoteLongPressTimer();
  quoteLongPressMeta = {quote, x:e.clientX || 0, y:e.clientY || 0};
  quoteLongPressTimer = setTimeout(() => {
    const meta = quoteLongPressMeta;
    clearQuoteLongPressTimer();
    if(meta && meta.quote && epubEditEditor.contains(meta.quote)) showQuoteContextMenu(meta.quote, meta.x, meta.y);
  }, 650);
}
function handleQuotePointerMove(e){
  if(!quoteLongPressTimer || !quoteLongPressMeta) return;
  if(Math.abs((e.clientX || 0) - quoteLongPressMeta.x) > 9 || Math.abs((e.clientY || 0) - quoteLongPressMeta.y) > 9) clearQuoteLongPressTimer();
}
function unwrapQuoteBlock(quote){
  if(!quote || !quote.parentNode) return;
  const frag = document.createDocumentFragment();
  while(quote.firstChild) frag.appendChild(quote.firstChild);
  quote.parentNode.replaceChild(frag, quote);
  rememberEditorSelection();
  updateEpubPreview(); scheduleAutosave();
  showToast("인용구를 해제했습니다.");
}
function getQuoteColor(){
  return epubQuoteColorEl && /^#[0-9a-fA-F]{6}$/.test(epubQuoteColorEl.value) ? epubQuoteColorEl.value : "#4f8aa4";
}
function quoteStyleForType(type, color){
  if(type === "blog") return `border-top-color:${color};border-bottom-color:${color};`;
  if(type === "soft") return `border-color:${color};`;
  return `border-left-color:${color};`;
}
function makeQuoteHtml(type, content){
  const cls = type === "blog" ? "quoteBlog" : (type === "soft" ? "quoteSoft" : (type === "postype" ? "quotePostype" : "quoteLine"));
  const color = getQuoteColor();
  return `<blockquote class="${cls}" style="${quoteStyleForType(type, color)}">${content}</blockquote>`;
}
function getCustomQuoteTemplate(){
  const el = document.getElementById("epubQuoteCustomTemplate");
  return el ? el.value.trim() : "";
}
function applyQuoteStyle(type){
  if(!epubEditEditor) return;
  const selected = getSelectedHtml();
  if(!selected){ showToast("인용할 문장을 드래그하세요."); return; }
  let html = "";
  if(type === "custom"){
    const tpl = getCustomQuoteTemplate();
    if(!tpl){ showToast("직접 입력 형식을 입력하세요."); return; }
    html = tpl.includes("{{content}}") ? tpl.replace(/{{content}}/g, selected) : `${tpl}${selected}`;
  }else{
    html = makeQuoteHtml(type, selected);
  }
  const ok = replaceSelectionWithHtml(html);
  if(ok){ updateEpubPreview(); scheduleAutosave(); showToast("인용구를 적용했습니다."); }
  else showToast("선택 영역을 다시 드래그해 주세요.");
}
function selectionInsideEditor(){
  const sel = window.getSelection();
  return sel && sel.rangeCount && epubEditEditor && epubEditEditor.contains(sel.anchorNode);
}
function wrapRangeWithSpan(range, styleText){
  const html = getSelectedHtml();
  if(!html) return false;
  return replaceSelectionWithHtml(`<span style="${styleText}">${html}</span>`);
}
function applyEpubTextFormat(){
  if(!epubEditEditor) return;
  const size = Math.max(8, Math.min(72, parseInt(epubEditFontSizeEl ? epubEditFontSizeEl.value : "15",10) || 15));
  const color = epubEditTextColorEl ? epubEditTextColorEl.value : "#1f2d36";
  const range = getActiveEditorRange();
  if(range && !range.collapsed){
    const ok = wrapRangeWithSpan(range, `font-size:${size}px;color:${color};`);
    if(!ok){ showToast("선택 영역을 다시 드래그해 주세요."); return; }
  }else{
    epubEditEditor.style.setProperty("font-size", size + "px", "important");
    epubEditEditor.style.setProperty("color", color, "important");
    Array.from(epubEditEditor.children).forEach(el => {
      if(el.nodeType === 1){
        if(!el.style.fontSize) el.style.fontSize = "inherit";
        if(!el.style.color) el.style.color = "inherit";
      }
    });
  }
  rememberEditorSelection();
  updateEpubPreview(); scheduleAutosave(); showToast("서식을 적용했습니다.");
}

function adjustEpubFontSize(delta){
  if(!epubEditFontSizeEl) return;
  const cur = parseInt(epubEditFontSizeEl.value || '15', 10) || 15;
  epubEditFontSizeEl.value = String(Math.max(8, Math.min(72, cur + delta)));
  applyEpubTextFormat();
}
function clearEpubInlineFormat(){
  if(!epubEditEditor) return;
  const range = getActiveEditorRange();
  if(range && !range.collapsed){
    document.execCommand("removeFormat", false, null);
  }else {
    epubEditEditor.querySelectorAll("span,font").forEach(n => n.replaceWith(...n.childNodes));
    epubEditEditor.style.fontSize="";
    epubEditEditor.style.color="";
  }
  updateEpubPreview(); scheduleAutosave(); showToast("서식을 제거했습니다.");
}
async function loadEpubFontFile(){
  const file = epubFontInputEl && epubFontInputEl.files && epubFontInputEl.files[0];
  if(!file) return;
  const dataUrl = await new Promise((resolve, reject) => { const r=new FileReader(); r.onload=()=>resolve(r.result); r.onerror=()=>reject(r.error); r.readAsDataURL(file); });
  const ext = (file.name.split('.').pop() || 'woff').toLowerCase().replace(/[^a-z0-9]/g,'') || 'woff';
  cachedEpubFontAsset = {name:file.name || 'uploaded-font.'+ext, epubName:'uploaded-font.'+ext, type:file.type || 'font/'+ext, dataUrl};
  applyCachedEpubFont(); scheduleAutosave(); showToast("폰트를 적용했습니다.");
}
async function applyCachedEpubFont(){
  if(!cachedEpubFontAsset || !cachedEpubFontAsset.dataUrl) return;
  try{
    let styleEl = document.getElementById("uploadedEpubFontStyle");
    if(!styleEl){ styleEl = document.createElement("style"); styleEl.id = "uploadedEpubFontStyle"; document.head.appendChild(styleEl); }
    styleEl.textContent = `@font-face{font-family:"UploadedEpubFont";src:url("${cachedEpubFontAsset.dataUrl}");font-weight:normal;font-style:normal;}`;
    if("FontFace" in window){
      const font = new FontFace("UploadedEpubFont", `url(${cachedEpubFontAsset.dataUrl})`);
      await font.load(); document.fonts.add(font);
    }
    if(epubEditEditor) epubEditEditor.style.setProperty("font-family", 'UploadedEpubFont, serif', "important");
    updateEpubPreview();
  }catch(err){ console.warn(err); showToast("이 브라우저에서 폰트 미리보기를 적용하지 못했습니다."); }
}
function editorHtmlForExport(){
  if(activeMode !== "epubedit" || !epubEditEditor) return "";
  let html = sanitizeEditorHTML(epubEditEditor.innerHTML || "");
  const style = sanitizeInlineStyle(`font-size:${epubEditEditor.style.fontSize || ""};color:${epubEditEditor.style.color || ""};font-family:${epubEditEditor.style.fontFamily || ""}`);
  if(style) html = `<div class="epub-editor-body" style="${escapeAttr(style)}">${html}</div>`;
  return html;
}

function blockHtmlToText(html){
  const div=document.createElement('div'); div.innerHTML=html; return (div.innerText||div.textContent||'').trim();
}
function editorHtmlToChapterBlocks(html){
  const temp=document.createElement('div'); temp.innerHTML=html || '';
  const separator = (chapterSeparatorEl && chapterSeparatorEl.value.trim()) || "—————";
  const normalize = value => String(value || "").replace(/\s+/g, " ").trim();
  const blocks=[];
  Array.from(temp.childNodes).forEach(node => {
    const text = normalize(node.innerText || node.textContent || "");
    if(node.nodeType===Node.ELEMENT_NODE && node.tagName==='HR') blocks.push({sep:true});
    else if(separator && text === separator) blocks.push({sep:true});
    else if((node.textContent||'').trim() || node.nodeType===Node.ELEMENT_NODE) blocks.push({html: node.outerHTML || escapeHTML(node.textContent||'')});
  });
  return blocks;
}

function editorStructuredBlocks(){
  if(!epubEditEditor) return [];
  return Array.from(epubEditEditor.querySelectorAll('[data-owner][data-kind], .rofan-block')).map((el, idx) => ({
    blockId: el.getAttribute('data-block-id') || el.getAttribute('data-block') || ('editor-' + idx),
    owner: el.getAttribute('data-owner') || 'character',
    kind: el.getAttribute('data-kind') || 'normal',
    text: (el.innerText || el.textContent || '').trim()
  })).filter(it => it.text);
}
function editorStructuredMarkdown(){
  const items = editorStructuredBlocks();
  if(!items.length) return '';
  return structuredItemsToMarkdown(items);
}
function getExportChapters(markdownMode){
  if(activeMode !== "epubedit"){
    return splitTextIntoChapters(markdownMode ? stripHTMLTags(getPreparedOutputForExport()) : getPreparedOutputForExport());
  }
  const cfg = getEpubConfig();
  const html = editorHtmlForExport();
  const blocks = editorHtmlToChapterBlocks(html);
  const makeTitle = idx => getChapterTitle(idx, cfg);
  if(markdownMode){ return splitTextIntoChapters(blockHtmlToText(html)); }
  const makeChapter = (bucket, idxTitle) => ({title: idxTitle === null ? cfg.title : makeTitle(idxTitle), bodyHtml:bucket.join("\n"), body:blockHtmlToText(bucket.join("\n"))});
  if(cfg.chapterMode === "separator"){
    const chapters=[]; let bucket=[];
    blocks.forEach(b => { if(b.sep){ if(bucket.length){ chapters.push(makeChapter(bucket, chapters.length)); bucket=[]; } } else if(b.html) bucket.push(b.html); });
    if(bucket.length) chapters.push(makeChapter(bucket, chapters.length));
    return chapters.length ? chapters : [{title:cfg.title, bodyHtml:html, body:blockHtmlToText(html)}];
  }
  if(cfg.chapterMode === "chars" || cfg.chapterMode === "paragraphs"){
    const chapters=[]; let bucket=[]; let count=0;
    blocks.filter(b => b.html).forEach(b => {
      const t = blockHtmlToText(b.html);
      const unit = cfg.chapterMode === "paragraphs" ? 1 : t.length;
      if(bucket.length && count + unit > cfg.chapterSize){ chapters.push(makeChapter(bucket, chapters.length)); bucket=[]; count=0; }
      bucket.push(b.html); count += unit;
    });
    if(bucket.length) chapters.push(makeChapter(bucket, chapters.length));
    if(chapters.length) return chapters;
  }
  return html ? [{title:cfg.title, bodyHtml:html, body:blockHtmlToText(html)}] : [];
}

function chapterBodyToXhtml(ch){
  if(activeMode === "epubedit" && ch.bodyHtml) return sanitizeEditorHTML(ch.bodyHtml).replace(/<br>/g,"<br/>").replace(/<hr\s*\/?\s*>/gi,"");
  return textToXhtmlBody(ch.body || "");
}

window.addEventListener("resize", () => requestAnimationFrame(syncActiveResultHeight));
restoreSavedWork();
refreshColorWidgets();
syncResultPreview(output);
syncResultPreview(chatOutput);
requestAnimationFrame(syncActiveResultHeight);
