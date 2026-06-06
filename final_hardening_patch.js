
/* --- stability patch 2026-06-06: rendered inputs, file buttons, tab-local chapters --- */
(function(){
  const markerToken = (typeof ROFAN_CHAPTER_BREAK_TOKEN !== 'undefined') ? ROFAN_CHAPTER_BREAK_TOKEN : '⟦ROFAN_CHAPTER_BREAK⟧';
  const markerStore = window.__rofanChapterMarkersByMode || (window.__rofanChapterMarkersByMode = {});
  const chapterSettingStore = window.__chapterSettingsByMode || (window.__chapterSettingsByMode = {});
  const modeKey = () => (typeof activeMode === 'string' && activeMode) ? activeMode : 'classic';
  const normalizeText = v => String(v || '').replace(/\r/g, '').trim();
  const getSep = () => (typeof chapterSeparatorEl !== 'undefined' && chapterSeparatorEl && chapterSeparatorEl.value.trim()) || '—————';
  const tokenRe = () => new RegExp(markerToken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');

  function activeRawOutputElement(){
    if(modeKey() === 'chat') return (typeof chatOutput !== 'undefined' ? chatOutput : null);
    if(modeKey() === 'classic') return (typeof output !== 'undefined' ? output : null);
    return null;
  }
  function getVisibleSourceText(){
    if(modeKey() === 'epubedit') return (typeof epubEditEditor !== 'undefined' && epubEditEditor) ? (epubEditEditor.innerText || epubEditEditor.textContent || '') : '';
    const out = activeRawOutputElement();
    if(out && out.value) return out.value;
    if(modeKey() === 'chat' && typeof chatPaste !== 'undefined' && chatPaste) return chatPaste.innerText || chatPaste.textContent || '';
    if(modeKey() === 'classic'){
      if(typeof input !== 'undefined' && input && input.value) return input.value;
      if(typeof inputPreview !== 'undefined' && inputPreview) return inputPreview.innerText || inputPreview.textContent || '';
    }
    return '';
  }
  function paragraphsOf(text){
    return String(text || '')
      .replace(tokenRe(), '\n\n' + markerToken + '\n\n')
      .replace(/\r/g, '')
      .split(/\n\s*\n+/)
      .map(p => p.trim())
      .filter(Boolean);
  }
  function isSeparatorParagraph(p){
    const raw = String(p || '');
    if(raw.includes(markerToken)) return true;
    const clean = raw.replace(/<[^>]*>/g, '').replace(/&nbsp;/gi, ' ').replace(/\s+/g, '').trim();
    const sep = getSep().replace(/\s+/g, '').trim();
    if(clean && sep && clean === sep) return true;
    return /^[\-—―─━_]{3,}$/.test(clean) && /^[\-—―─━_]{3,}$/.test(sep || '—————');
  }
  function htmlRenderLimited(text){
    if(typeof htmlFromResultText === 'function') return htmlFromResultText(text || '');
    if(typeof escapeHTML === 'function') return escapeHTML(text || '');
    const d=document.createElement('div'); d.textContent=text||''; return d.innerHTML;
  }

  // File buttons: 모바일/데스크톱에서 숨겨진 input 클릭이 누락되는 경우를 한 번 더 보강합니다.
  document.addEventListener('click', function(ev){
    const label = ev.target && ev.target.closest ? ev.target.closest('label.prettyFile, .fileControl') : null;
    if(!label || ev.target.matches('input[type="file"]')) return;
    const file = label.querySelector('input[type="file"]');
    if(file){ ev.preventDefault(); file.click(); }
  }, true);

  // 앱에서 만든 Markdown/HTML 주석은 입력창에서 숨기고, 색상/이름표는 렌더링해서 보여줍니다.
  window.htmlFromInputText = htmlFromInputText = function(text){
    const raw = String(text || '');
    try{
      if(/<!--\s*rofan:/i.test(raw) && typeof parseStructuredMarkdownToChunks === 'function' && typeof structuredItemsToHtml === 'function'){
        const chunks = parseStructuredMarkdownToChunks(raw);
        if(chunks && chunks.length){
          return structuredItemsToHtml(chunks.map(c => ({blockId:c.blockId, owner:c.owner, kind:c.kind, text:c.text}))).replace(tokenRe(), '<hr class="chapter-editor-separator" data-chapter-separator="true">');
        }
      }
    }catch(err){ console.warn('input structured render failed', err); }
    return htmlRenderLimited(String(raw).replace(/<!--\s*rofan:[\s\S]*?-->/gi, '').replace(/\n{3,}/g, '\n\n').trim());
  };

  window.syncClassicInputPreview = syncClassicInputPreview = function(){
    if(typeof input === 'undefined' || typeof inputPreview === 'undefined' || !input || !inputPreview) return;
    const old = inputPreview.scrollTop;
    const html = htmlFromInputText(input.value || '');
    if(inputPreview.innerHTML !== html) inputPreview.innerHTML = html;
    inputPreview.scrollTop = old;
  };

  // 결과창은 항상 코드 대신 렌더링된 화면으로 보여줍니다.
  window.syncResultPreview = syncResultPreview = function(el){
    if(typeof resultPreviewFor !== 'function') return;
    const preview = resultPreviewFor(el);
    if(!preview || !el) return;
    const old = preview.scrollTop;
    preview.innerHTML = htmlRenderLimited(el.value || '');
    preview.dataset.placeholder = el.getAttribute('placeholder') || '변환 결과';
    preview.scrollTop = old;
  };
  window.setResultOutput = setResultOutput = function(el, value){
    if(!el) return;
    el.value = value || '';
    syncResultPreview(el);
    requestAnimationFrame(() => { if(typeof syncActiveResultHeight === 'function') syncActiveResultHeight(); });
  };

  // 좌우 입력/결과 하단 정렬을 다시 계산합니다.
  window.syncActiveResultHeight = syncActiveResultHeight = function(){
    const key = modeKey();
    const panel = key === 'chat' ? (typeof chatPanel !== 'undefined' ? chatPanel : null) : key === 'classic' ? (typeof classicPanel !== 'undefined' ? classicPanel : null) : null;
    if(!panel || panel.classList.contains('hidden')) return;
    const left = panel.querySelector('.editorGrid > .editorBox:not(.resultBox)');
    const resultBox = panel.querySelector('.editorGrid > .editorBox.resultBox');
    const preview = resultBox ? resultBox.querySelector('.richResultBox') : null;
    const label = resultBox ? resultBox.querySelector('.editorLabel') : null;
    if(!left || !resultBox || !preview) return;
    if(window.matchMedia('(max-width: 860px)').matches){
      resultBox.style.height=''; resultBox.style.minHeight=''; resultBox.style.overflow='';
      preview.style.height='430px'; preview.style.maxHeight=''; preview.style.flex='';
      return;
    }
    const h = Math.max(420, Math.ceil(left.getBoundingClientRect().height));
    const lh = label ? Math.ceil(label.getBoundingClientRect().height) + 9 : 0;
    resultBox.style.height = h + 'px';
    resultBox.style.minHeight = h + 'px';
    resultBox.style.overflow = 'hidden';
    preview.style.height = Math.max(320, h - lh) + 'px';
    preview.style.maxHeight = Math.max(320, h - lh) + 'px';
    preview.style.flex = '0 0 auto';
  };

  // 변환이 실패하거나 빈 결과가 되는 경우를 방지하는 가드.
  const baseTransform = (typeof transformText === 'function') ? transformText : null;
  window.transformText = transformText = function(){
    try{
      if(modeKey() === 'classic' && typeof input !== 'undefined' && input && (!input.value || !input.value.trim()) && typeof inputPreview !== 'undefined' && inputPreview){
        input.value = inputPreview.innerText || inputPreview.textContent || '';
      }
      if(baseTransform) baseTransform();
      if(modeKey() === 'classic') syncClassicInputPreview();
      if(typeof syncResultPreview === 'function'){
        if(typeof output !== 'undefined') syncResultPreview(output);
        if(typeof chatOutput !== 'undefined') syncResultPreview(chatOutput);
      }
      syncActiveResultHeight();
    }catch(err){
      console.error('transformText failed', err);
      const target = activeRawOutputElement();
      if(target && !target.value){
        const src = getVisibleSourceText();
        if(src) setResultOutput(target, src);
      }
      if(typeof showToast === 'function') showToast('변환 중 오류가 있어 원문 기준으로 표시했습니다.');
    }
  };

  // 챕터는 문자열 장식선에 의존하지 않고 탭별 marker index로 관리합니다.
  function getMarkerSet(){
    const key = modeKey();
    if(!markerStore[key]) markerStore[key] = [];
    markerStore[key] = Array.from(new Set(markerStore[key].map(Number).filter(n => Number.isFinite(n) && n >= 0))).sort((a,b)=>a-b);
    return markerStore[key];
  }
  function textWithoutMarkerParas(text){ return paragraphsOf(text).filter(p => !isSeparatorParagraph(p)); }
  window.getChapterSearchMatches = getChapterSearchMatches = function(){
    const q = String((typeof chapterKeywordQuery !== 'undefined' && chapterKeywordQuery) || '').trim().toLowerCase();
    const order = String((typeof chapterOrderQuery !== 'undefined' && chapterOrderQuery) || '').trim();
    let matches = textWithoutMarkerParas(getVisibleSourceText()).map((text, index) => ({text, index, start:index, end:index+1}));
    if(q) matches = matches.filter(p => (typeof stripHTMLTags === 'function' ? stripHTMLTags(p.text) : p.text).toLowerCase().includes(q));
    if(order){ const n = Number(order); if(Number.isFinite(n) && n > 0) matches = matches.filter(p => p.index + 1 === n); }
    return matches;
  };
  window.updateChapterDividerPanel = updateChapterDividerPanel = function(){
    if(typeof chapterDividerPanelEl === 'undefined' || !chapterDividerPanelEl) return;
    const matches = getChapterSearchMatches();
    currentChapterMatches = matches;
    chapterMatchPage = Math.max(0, Math.min(Math.max(0, matches.length - 1), chapterMatchPage || 0));
    const current = matches[chapterMatchPage];
    const total = matches.length;
    let html = `<div class="miniToolHead"><div><strong>구분선 삽입</strong><span>검색한 지문 위/아래를 새 챕터 시작점으로 지정합니다.</span></div><span class="smallMuted">${total ? `${chapterMatchPage+1}/${total}` : '0개'}</span></div>`;
    if(!current){ html += `<div class="emptyState">키워드를 입력하면 해당 문단을 확인하고 구분선을 넣을 수 있습니다.</div>`; }
    else{
      html += `<div class="chapterMatchCard"><div class="dupeSummary withNav"><span><span class="pill">문단 ${current.index+1}</span><span class="pill">구분선 ${escapeHTML ? escapeHTML(getSep()) : getSep()}</span></span><span class="navButtons"><button type="button" class="navIconBtn" data-chapter-match-page="prev" ${chapterMatchPage<=0?'disabled':''}>‹</button><button type="button" class="navIconBtn" data-chapter-match-page="next" ${chapterMatchPage>=total-1?'disabled':''}>›</button></span></div><div class="previewText fullPreview">${typeof escapeHTML==='function'?escapeHTML(current.text):current.text}</div><div class="chapterInsertRow"><button type="button" class="btn primary" data-chapter-insert="1">현재 문단에 구분선 넣기</button></div></div>`;
    }
    chapterDividerPanelEl.innerHTML = html;
  };
  window.insertChapterDividerAtCurrentMatch = insertChapterDividerAtCurrentMatch = function(){
    const matches = getChapterSearchMatches();
    if(!matches.length){ if(typeof showToast === 'function') showToast('구분선을 넣을 문단을 찾지 못했습니다.'); return; }
    const current = matches[Math.max(0, Math.min(matches.length - 1, chapterMatchPage || 0))];
    const position = (typeof chapterPositionEl !== 'undefined' && chapterPositionEl) ? chapterPositionEl.value : 'before';
    if(typeof chapterSplitModeEl !== 'undefined' && chapterSplitModeEl) chapterSplitModeEl.value = 'separator';
    const idx = position === 'after' ? current.index + 1 : current.index;
    const markers = getMarkerSet();
    if(!markers.includes(idx)) markers.push(idx);
    markerStore[modeKey()] = markers.sort((a,b)=>a-b);
    if(modeKey() !== 'epubedit'){
      const el = activeRawOutputElement();
      const paras = textWithoutMarkerParas(getVisibleSourceText());
      const visual = paras.slice();
      Array.from(markerStore[modeKey()]).sort((a,b)=>b-a).forEach(i => visual.splice(Math.max(0, Math.min(i, visual.length)), 0, markerToken));
      if(el) setResultOutput(el, visual.join('\n\n'));
    }else if(typeof insertChapterDividerIntoEditor === 'function'){
      insertChapterDividerIntoEditor(current, position, getSep());
    }
    if(typeof saveActiveChapterSettings === 'function') saveActiveChapterSettings();
    if(typeof refreshChapterViews === 'function') refreshChapterViews(); else { if(typeof updateEpubPreview === 'function') updateEpubPreview(); updateChapterDividerPanel(); }
    setTimeout(() => { if(typeof updateEpubPreview === 'function') updateEpubPreview(); updateChapterDividerPanel(); }, 50);
    if(typeof scheduleAutosave === 'function') scheduleAutosave();
    if(typeof showToast === 'function') showToast(position === 'after' ? '문단 아래를 새 챕터로 지정했습니다.' : '문단 위를 새 챕터로 지정했습니다.');
  };

  function splitByMarkers(paras, cfg){
    const markers = cfg.chapterMode === 'separator' ? getMarkerSet().filter(i => i > 0 && i < paras.length) : [];
    const starts = [0, ...markers].filter((v,i,a)=>a.indexOf(v)===i).sort((a,b)=>a-b);
    if(!starts.length) starts.push(0);
    const chapters=[];
    starts.forEach((s, idx) => {
      const e = idx + 1 < starts.length ? starts[idx+1] : paras.length;
      const body = paras.slice(s,e).join('\n\n').trim();
      if(body) chapters.push({title: getChapterTitle(idx, cfg), body});
    });
    return chapters;
  }
  window.splitTextIntoChapters = splitTextIntoChapters = function(text){
    const cfg = getEpubConfig();
    let paras = paragraphsOf(text).filter(p => !isSeparatorParagraph(p));
    if(!paras.length) return [];
    if(cfg.chapterMode === 'separator') return splitByMarkers(paras, cfg);
    const chapters=[];
    if(cfg.chapterMode === 'paragraphs'){
      for(let i=0;i<paras.length;i+=cfg.chapterSize){ chapters.push({title:getChapterTitle(chapters.length,cfg), body:paras.slice(i,i+cfg.chapterSize).join('\n\n')}); }
    }else if(cfg.chapterMode === 'chars'){
      let bucket=[], count=0;
      paras.forEach(p => { if(bucket.length && count + p.length > cfg.chapterSize){ chapters.push({title:getChapterTitle(chapters.length,cfg), body:bucket.join('\n\n')}); bucket=[]; count=0; } bucket.push(p); count += p.length; });
      if(bucket.length) chapters.push({title:getChapterTitle(chapters.length,cfg), body:bucket.join('\n\n')});
    }else chapters.push({title:cfg.firstChapterTitle || cfg.title, body:paras.join('\n\n')});
    return chapters;
  };
  window.getExportChapters = getExportChapters = function(markdownMode){
    if(modeKey() === 'epubedit'){
      const html = (typeof editorHtmlForExport === 'function') ? editorHtmlForExport() : ((typeof epubEditEditor !== 'undefined' && epubEditEditor) ? epubEditEditor.innerHTML : '');
      if(markdownMode) return splitTextIntoChapters((typeof blockHtmlToText === 'function') ? blockHtmlToText(html) : html);
      const cfg = getEpubConfig();
      const blocks = (typeof editorHtmlToChapterBlocks === 'function') ? editorHtmlToChapterBlocks(html) : [];
      if(cfg.chapterMode === 'separator' && blocks.length){
        const chapters=[]; let bucket=[];
        blocks.forEach(b => { if(b.sep){ if(bucket.length){ const h=bucket.join('\n'); chapters.push({title:getChapterTitle(chapters.length,cfg), bodyHtml:h, body:(typeof blockHtmlToText==='function'?blockHtmlToText(h):h)}); bucket=[]; } } else if(b.html) bucket.push(b.html); });
        if(bucket.length){ const h=bucket.join('\n'); chapters.push({title:getChapterTitle(chapters.length,cfg), bodyHtml:h, body:(typeof blockHtmlToText==='function'?blockHtmlToText(h):h)}); }
        if(chapters.length) return chapters;
      }
      return splitTextIntoChapters((typeof blockHtmlToText === 'function') ? blockHtmlToText(html) : html);
    }
    const raw = (typeof getPreparedOutputForExport === 'function') ? getPreparedOutputForExport() : getVisibleSourceText();
    return splitTextIntoChapters(markdownMode && typeof stripHTMLTags === 'function' ? stripHTMLTags(raw) : raw);
  };

  window.updateEpubPreview = updateEpubPreview = function(){
    const chapters = getExportChapters();
    const cfg = getEpubConfig();
    if(typeof chapterPreviewEl !== 'undefined' && chapterPreviewEl) chapterPreviewEl.innerHTML = renderChapterTocHtml(chapters, false);
    if(typeof chapterTocInlineEl !== 'undefined' && chapterTocInlineEl) chapterTocInlineEl.innerHTML = renderChapterTocHtml(chapters, true);
    if(typeof epubPreviewEl !== 'undefined' && epubPreviewEl){
      const ch = chapters[0];
      let body = '';
      if(ch && ch.bodyHtml && typeof chapterBodyToXhtml === 'function') body = chapterBodyToXhtml(ch);
      else if(ch && typeof splitTextIntoParagraphs === 'function') body = splitTextIntoParagraphs(ch.body || '').slice(0,12).map(paragraphToXhtml).join('\n');
      epubPreviewEl.innerHTML = `<div class="previewMeta"><b>${escapeHTML(cfg.title)}</b>${cfg.author ? `<span>${escapeHTML(cfg.author)}</span>` : ''}<span>${chapters.length || 0}개 챕터</span></div><div class="bookPreview">${body || '<p class="mutedText">미리보기 없음</p>'}</div>`;
    }
  };

  // 탭 전환 시 각 탭의 챕터 설정과 marker를 유지합니다.
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const next = tab.dataset.tab || 'classic';
      if(typeof saveActiveChapterSettings === 'function') saveActiveChapterSettings();
      setTimeout(() => {
        if(!chapterSettingStore[next] && typeof captureChapterSettings === 'function') chapterSettingStore[next] = Object.assign({}, captureChapterSettings());
        if(typeof applyChapterSettingsPack === 'function') applyChapterSettingsPack(chapterSettingStore[next]);
        if(typeof updateEpubPreview === 'function') updateEpubPreview();
        updateChapterDividerPanel();
        syncActiveResultHeight();
      }, 0);
    }, true);
  });

  // 기존 직접 바인딩이 원본 transform을 가리키는 경우를 보강합니다.
  ['input','change'].forEach(evName => {
    document.addEventListener(evName, ev => {
      const t = ev.target;
      if(!t) return;
      if(t.matches && t.matches('#inputTextPreview,#chatPaste,#inputText,.optionRow input,.optionRow select,.control input,.control select')){
        setTimeout(() => { try{ if(typeof transformText === 'function') transformText(); }catch(e){ console.error(e); } }, 0);
      }
    }, true);
  });

  // 초기 화면 동기화
  setTimeout(() => {
    try{
      syncClassicInputPreview();
      if(typeof transformText === 'function') transformText();
      if(typeof updateEpubPreview === 'function') updateEpubPreview();
      updateChapterDividerPanel();
      syncActiveResultHeight();
    }catch(err){ console.error('final hardening init failed', err); }
  }, 0);
})();
