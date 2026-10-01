(() => {
  "use strict";
  if (window.__AI_LOG_REVIEW_POLISH_V150) return;
  window.__AI_LOG_REVIEW_POLISH_V150 = true;

  const configs = [
    ["duplicateReviewPanel", "중복 응답 검토"],
    ["oocReviewPanel", "OOC 검토"],
    ["containsReviewPanel", "특정 글자 포함 문단"]
  ];

  function decorate(panel) {
    panel.querySelectorAll('.dupeCompareGrid .reviewBlock').forEach((block, index) => {
      if (!block.dataset.owner) block.dataset.owner = index === 0 ? "user" : "character";
      if (!block.dataset.kind) block.dataset.kind = index === 0 ? "scene" : "normal";
    });
    panel.querySelectorAll('.containsRow').forEach(row => {
      const block = row.querySelector(':scope > .reviewBlock');
      if (block) {
        if (!block.dataset.owner && row.dataset.owner) block.dataset.owner = row.dataset.owner;
        if (!block.dataset.kind && row.dataset.kind) block.dataset.kind = row.dataset.kind;
      }
    });
  }

  function wrapPanel(id, label) {
    const panel = document.getElementById(id);
    if (!panel || panel.closest('.reviewPanelFold')) return;
    const details = document.createElement('details');
    details.className = 'reviewPanelFold';
    details.open = true;
    details.dataset.reviewPanel = id;
    const summary = document.createElement('summary');
    summary.textContent = label;
    panel.parentNode.insertBefore(details, panel);
    details.append(summary, panel);
    panel.classList.add('reviewPanelInner');

    const sync = () => {
      details.hidden = panel.classList.contains('hidden');
      if (!details.hidden) decorate(panel);
    };
    let __syncPending=false;
    const __syncOnce=()=>{ if(__syncPending) return; __syncPending=true;
      requestAnimationFrame(()=>{ __syncPending=false; sync(); }); };
    new MutationObserver(__syncOnce).observe(panel, { attributes:true, attributeFilter:['class'], childList:true, subtree:true });
    sync();
  }

  function install() { configs.forEach(args => wrapPanel(...args)); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once:true });
  else install();
})();
