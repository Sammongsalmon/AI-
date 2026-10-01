/* extractor_font_v190.js — 발췌기에 '등록한 글꼴' 적용

   설정 → WebView 글꼴 에서 "발췌기에도 같은 글꼴 적용" 을 켜면,
   로판AI 화면에 쓰는 그 글꼴 파일을 발췌기 화면에도 심는다.

   왜 이 길이 필요한가.
     기기 설정 글꼴은 CSS 로 닿지 않는다. WebView 렌더러가 자기 글꼴 목록으로
     이름을 풀기 때문에 One UI 의 글꼴 교체가 반영되지 않는다.
     SystemFontProvider(Java) 가 글꼴 파일을 찾아 심는 길을 먼저 시도하지만,
     삼성 글꼴이 APK 안에만 있으면 파일 경로가 안 잡혀 실패할 수 있다.
     그때 확실한 길이 이것이다 — 사용자가 넣은 파일을 그대로 쓴다.

   우선순위: 등록 글꼴(이 파일) > 기기 글꼴(SystemFontProvider) > sans-serif
   등록 글꼴을 켜 두면 --app-ui-font 를 덮으므로 가장 강하다.

   글꼴을 못 읽으면 아무것도 바꾸지 않는다. 조용히 넘기지 않고 console 에 남긴다. */
(() => {
  "use strict";
  if (window.__EXTRACTOR_FONT_V190) return;
  window.__EXTRACTOR_FONT_V190 = true;

  const FAMILY = "AILogExtractorFont";
  const STYLE_ID = "ailog-extractor-font";
  let appliedKey = "";
  let fontFace = null;

  /* rf_native_bridge_v38.js 가 window.RofanNativeBridge 로 노출한다.
     붙기 전에 부를 수 있으므로 준비 이벤트도 함께 듣는다. */
  function bridge() {
    const b = window.RofanNativeBridge;
    return b && typeof b.getConfig === "function" ? b : null;
  }

  function clear() {
    try { if (fontFace) document.fonts.delete(fontFace); } catch (_) {}
    fontFace = null;
    document.getElementById(STYLE_ID)?.remove();
    appliedKey = "";
  }

  async function apply() {
    const b = bridge();
    if (!b) return;

    const on = String(await b.getConfig("font_apply_extractor", "0")) === "1";
    const mode = String(await b.getConfig("font_mode", "page"));
    const name = String(await b.getConfig("font_name", "") || "");
    const serial = String(await b.getConfig("font_apply_serial", "0"));

    if (!on || mode !== "custom" || !name) { clear(); return; }

    const files = await b.listFonts();
    const file = (files || []).find(f => f.name === name);
    if (!file) throw new Error("등록한 글꼴을 찾지 못했습니다: " + name);

    // 같은 글꼴·같은 저장 시점이면 다시 읽지 않는다
    const key = name + ":" + file.size + ":" + serial;
    if (key === appliedKey && fontFace) return;

    let bytes = await b.readFontWhole(file);
    if (b.repairFontBytes) bytes = b.repairFontBytes(bytes);
    const buffer = (bytes.byteOffset === 0 && bytes.byteLength === bytes.buffer.byteLength)
      ? bytes.buffer
      : bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);

    clear();
    /* weight 를 "100 900" 으로 선언하면 브라우저는 이 파일이 모든 굵기를 갖고 있다고
       믿고 합성 볼드를 만들지 않는다. 등록 글꼴은 대개 한 굵기짜리 정적 폰트라
       600·700 자리가 전부 보통 굵기로 렌더되어 층위가 통째로 사라졌다.
       normal 로 선언해야 굵은 자리에 합성 볼드가 들어간다. */
    fontFace = new FontFace(FAMILY, buffer, { weight: "normal", display: "swap" });
    await fontFace.load();
    document.fonts.add(fontFace);

    const style = document.createElement("style");
    style.id = STYLE_ID;
    /* --app-ui-font 를 덮는다. index.html 의 SYSTEM_FONT_PATCH_V6 와
       Java 가 심는 기기 글꼴보다 뒤에 서야 하므로 !important 를 붙인다. */
    style.textContent = ':root{--app-ui-font:"' + FAMILY + '",sans-serif!important}'
      + 'html,body,body *{font-synthesis:weight style!important;'
      + '-webkit-font-smoothing:antialiased}';
    (document.head || document.documentElement).appendChild(style);
    appliedKey = key;
  }

  function run() {
    apply().catch(error => console.warn("발췌기 글꼴 적용", error));
  }

  /* 설정은 로판AI 화면에서 바뀐다. 발췌기로 돌아올 때 다시 읽으면 된다.
     주기 타이머는 두지 않는다. */
  /* 글꼴 파일 읽기는 브리지를 여러 번 오가는 동기 호출이라, 수십 MB 글꼴이면
     그동안 화면이 멈춘다. 첫 화면이 다 그려진 뒤 한가할 때로 미룬다.
     발췌 후 발췌기로 넘어와 대화창이 뜨는 것을 막지 않기 위해서다. */
  const runWhenIdle = () => {
    if (typeof requestIdleCallback === "function") requestIdleCallback(() => run(), { timeout: 2500 });
    else setTimeout(run, 1200);
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runWhenIdle, { once: true });
  } else {
    runWhenIdle();
  }
  addEventListener("ai-log-native-bridge-ready", runWhenIdle);
  addEventListener("focus", runWhenIdle);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) runWhenIdle(); });
})();
