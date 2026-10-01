/* 발췌기에서 발생한 JS 오류를 화면에 그대로 보여 준다. PC 없이도 원인을 확인하기 위한 것. */
(()=>{"use strict";
const seen = new Set();
const BENIGN = [
  "ResizeObserver loop",
  "Script error.",
  "Non-Error promise rejection"
];
function show(kind, msg, where){
  const text = String(msg || "");
  if(BENIGN.some(b => text.indexOf(b) >= 0)) return;   // 브라우저가 내는 정상 알림은 무시
  const key = kind + "|" + msg + "|" + where;
  if(seen.has(key)) return;
  seen.add(key);
  let box = document.getElementById("__ailog_errbox");
  if(!box){
    box = document.createElement("div");
    box.id = "__ailog_errbox";
    box.style.cssText =
      "position:fixed;left:8px;right:8px;bottom:8px;z-index:2147483647;max-height:42vh;overflow:auto;" +
      "background:rgba(120,30,30,.94);color:#fff;font:12px/1.5 monospace;padding:10px 34px 10px 12px;" +
      "border-radius:10px;white-space:pre-wrap;word-break:break-all";
    const x = document.createElement("button");
    x.textContent = "✕";
    x.style.cssText = "position:absolute;right:6px;top:6px;width:24px;height:24px;border:0;border-radius:50%;background:rgba(255,255,255,.22);color:#fff";
    x.onclick = () => box.remove();
    box.appendChild(x);
    document.documentElement.appendChild(box);
  }
  const line = document.createElement("div");
  line.textContent = "[" + kind + "] " + msg + (where ? "\n   → " + where : "");
  line.style.marginTop = "6px";
  box.appendChild(line);
}
window.addEventListener("error", e => {
  show("오류", e.message || String(e.error || ""), (e.filename || "") + ":" + (e.lineno || 0));
}, true);
window.addEventListener("unhandledrejection", e => {
  const r = e.reason;
  show("Promise", (r && (r.message || r)) || "알 수 없음", (r && r.stack ? String(r.stack).split("\n")[1] || "" : "").trim());
});
// 로드가 끝난 뒤 핵심 함수가 실제로 노출됐는지 점검
setTimeout(() => {
  const need = ["loadClassicFileObject", "readClassicFileUsingOriginalPath", "buildClassicFilePreviewSource"];
  const missing = need.filter(n => typeof window[n] !== "function");
  if(missing.length) show("미노출", "window." + missing.join(", window.") + " 가 함수가 아님",
    "index.html 인라인 스크립트가 도중에 멈췄을 가능성");
}, 2500);
})();
