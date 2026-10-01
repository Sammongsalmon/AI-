/* editor_fontsize_v241.js — 입력·출력칸 글자 크기 조절

   기존 '편집칸 높이 조절'(− 80% +) 왼쪽에 글자 크기 조절을 하나 더 붙인다.
   높이는 칸이 몇 줄 보이느냐를 정하고, 글자 크기는 그 안의 읽기 편함을 정한다.
   둘은 다른 문제라 따로 둔다.

   칸마다 따로 기억한다(원본 로그 / 변환 결과 / 채팅 입력…).
   가운데 값을 누르면 기본값으로 돌아간다 — 높이 조절과 같은 규칙이다. */
(() => {
  "use strict";
  if (window.__EDITOR_FONTSIZE_V241) return;
  window.__EDITOR_FONTSIZE_V241 = true;

  const STORE = "ai-log-editor-font-v241";
  const MIN = 11, MAX = 26, DEFAULT = 14;

  const load = () => { try { return JSON.parse(localStorage.getItem(STORE) || "{}") || {}; } catch (_) { return {}; } };
  const save = v => { try { localStorage.setItem(STORE, JSON.stringify(v)); } catch (_) {} };

  /* 컨트롤이 붙은 라벨의 형제 중 글이 들어가는 칸을 찾는다.
     결과칸은 안에 두 개가 있다 — 눈에 보이는 .richResultBox 와,
     원문을 담아 두는 숨은 textarea.rawResultStorage.
     querySelector 는 문서 순서상 앞선 숨은 쪽을 먼저 잡아,
     크기를 바꿔도 화면에 아무 변화가 없었다.
     어느 쪽이 보이는지 따지지 말고 해당하는 칸 전부에 건다. */
  function targetsOf(control) {
    const box = control.closest(".editorLabel")?.parentElement;
    if (!box) return [];
    return [...box.querySelectorAll(".richResultBox, .epubRichEditor, .pastebox, textarea")];
  }

  function keyOf(control) {
    return control.querySelector("[data-editor-size-key]")?.dataset.editorSizeKey || "";
  }

  function apply(key, control) {
    const targets = targetsOf(control);
    if (!targets.length) return;
    const size = load()[key] || DEFAULT;
    for (const target of targets) target.style.setProperty("font-size", size + "px", "important");
    const label = control.parentElement?.querySelector('.editorFontValue[data-font-key="' + key + '"]');
    if (label) label.textContent = size + "px";
  }

  function install() {
    document.querySelectorAll(".editorSizeControl").forEach(control => {
      const key = keyOf(control);
      if (!key) return;
      if (control.previousElementSibling?.classList?.contains("editorFontControl")) {
        apply(key, control);   // 이미 붙어 있으면 값만 다시 맞춘다
        return;
      }
      const wrap = document.createElement("div");
      wrap.className = "editorFontControl";
      wrap.setAttribute("aria-label", "글자 크기 조절");
      wrap.innerHTML =
        '<button type="button" class="editorFontBtn" data-font-delta="-1" aria-label="글자 작게">가－</button>' +
        '<button type="button" class="editorFontValue" data-font-key="' + key + '" aria-label="기본 글자 크기로 되돌리기">' + DEFAULT + 'px</button>' +
        '<button type="button" class="editorFontBtn" data-font-delta="1" aria-label="글자 크게">가＋</button>';
      control.parentElement.insertBefore(wrap, control);

      wrap.addEventListener("click", event => {
        const button = event.target.closest("button");
        if (!button) return;
        event.preventDefault();
        const state = load();
        if (button.classList.contains("editorFontValue")) {
          delete state[key];
        } else {
          const next = (state[key] || DEFAULT) + Number(button.dataset.fontDelta || 0);
          state[key] = Math.min(MAX, Math.max(MIN, next));
        }
        save(state);
        apply(key, control);
      });

      apply(key, control);
    });
  }

  function run() {
    try { install(); } catch (error) { console.warn("글자 크기 조절 설치", error); }
  }

  /* 라벨은 탭을 옮기거나 화면이 다시 그려질 때 새로 생긴다.
     주기 타이머 대신 확실한 시점에만 다시 훑는다. */
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run, { once: true });
  else run();
  document.addEventListener("click", event => {
    if (event.target?.closest?.(".tab")) setTimeout(run, 60);
  }, true);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) run(); });
  [400, 1200, 2600].forEach(ms => setTimeout(run, ms));

  /* 앱이 '편집칸 높이 조절' 을 나중에 다시 만들면서 라벨 내용을 갈아 끼운다.
     그때 우리가 끼워 넣은 것이 통째로 사라져, 고정 시각에만 훑으면 놓친다.
     타이머를 늘리는 대신 높이 조절이 새로 나타나는 순간을 본다. */
  try{
    let pending = 0;
    new MutationObserver(records => {
      const touched = records.some(r =>
        [...r.addedNodes].some(n => n.nodeType === 1 &&
          (n.classList?.contains("editorSizeControl") || n.querySelector?.(".editorSizeControl"))));
      if(!touched) return;
      clearTimeout(pending);
      pending = setTimeout(run, 80);
    }).observe(document.documentElement, {childList:true, subtree:true});
  }catch(_){}
})();
