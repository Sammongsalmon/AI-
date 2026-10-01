(()=>{try{if(typeof copyResult==="undefined")window.copyResult=function(){console.warn("copyResult 미정의 호출")};}catch(_){}})();
(function(){
  'use strict';
  if(window.__exportParityV21Installed) return;
  window.__exportParityV21Installed = true;

  const encoder = new TextEncoder();
  const decoder = new TextDecoder('utf-8', {fatal:true});

  function hasUnpairedSurrogate(value){
    const text = String(value == null ? '' : value);
    for(let i=0;i<text.length;i++){
      const code = text.charCodeAt(i);
      if(code >= 0xD800 && code <= 0xDBFF){
        const next = text.charCodeAt(i + 1);
        if(!(next >= 0xDC00 && next <= 0xDFFF)) return true;
        i += 1;
      }else if(code >= 0xDC00 && code <= 0xDFFF){
        return true;
      }
    }
    return false;
  }
  function encodeExactUtf8(value){
    const text = String(value == null ? '' : value);
    if(hasUnpairedSurrogate(text)) throw new Error('원문에 손상된 UTF-16 문자가 있어 내보내기를 중단했습니다.');
    const bytes = encoder.encode(text);
    if(decoder.decode(bytes) !== text) throw new Error('UTF-8 무손실 검증에 실패했습니다.');
    return bytes;
  }
  function exportFileName(ext, fallback){
    return typeof safeDownloadFileName === 'function'
      ? safeDownloadFileName(ext, fallback)
      : `${String(fallback || 'download').replace(/[\\/:*?"<>|]/g, '_')}${ext}`;
  }
  async function saveExactText(value, mime, ext, fallback){
    const text = String(value == null ? '' : value);
    const bytes = encodeExactUtf8(text);
    const filename = exportFileName(ext, fallback);
    if(typeof window.__nativeSaveBytesExact === 'function'){
      await window.__nativeSaveBytesExact(bytes, filename, mime);
      return true;
    }
    if(typeof downloadBlob === 'function'){
      await downloadBlob(new Blob([bytes], {type:mime}), filename);
      return true;
    }
    throw new Error('파일 저장 기능을 사용할 수 없습니다.');
  }
  function reportError(label, error){
    console.error(label + ' export failed', error);
    if(typeof showToast === 'function') showToast(label + ' 저장 실패: ' + String(error && error.message ? error.message : error));
  }

  /* GitHub 원본의 텍스트 복사 로직을 그대로 유지한다. */
  window.copyResult = copyResult = function(){
    const value = getPlainActiveOutputValue();
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(value)
        .then(() => showToast('복사되었습니다.'))
        .catch(() => fallbackCopy(value));
      return;
    }
    fallbackCopy(value);
  };

  /* GitHub 원본과 같은 내용 문자열을 만들고, 마지막 저장만 무손실 UTF-8 바이트로 수행한다. */
  window.downloadTxt = downloadTxt = async function(){
    try{
      const text = getPlainActiveOutputValue();
      const fallback = activeMode === 'chat' ? 'cleaned_rofan_chat' : (activeMode === 'epubedit' ? 'edited_epub_text' : 'cleaned_log');
      await saveExactText(text, 'text/plain;charset=utf-8', '.txt', fallback);
    }catch(error){ reportError('TXT', error); }
  };

  window.downloadHtml = downloadHtml = async function(){
    try{
      const cfg = getEpubConfig();
      const html = buildStandaloneHTML();
      await saveExactText(html, 'text/html;charset=utf-8', '.html', cfg.title);
    }catch(error){ reportError('HTML', error); }
  };

  window.downloadMarkdown = downloadMarkdown = async function(){
    try{
      const cfg = getEpubConfig();
      const chapters = getExportChapters(true);
      let md = `# ${cfg.title}\n\n`;
      if(cfg.subtitle) md += `_${cfg.subtitle}_\n\n`;
      if(cfg.author) md += `작가: ${cfg.author}\n\n`;
      if(cfg.description) md += `${cfg.description}\n\n`;
      if(activeMode !== 'epubedit' && lastStructuredItems && lastStructuredItems.length){
        md += structuredItemsToMarkdown(lastStructuredItems) + '\n';
      }else if(activeMode === 'epubedit' && editorStructuredMarkdown()){
        md += editorStructuredMarkdown() + '\n';
      }else if(activeMode === 'epubedit'){
        md += editorHtmlForExport() + '\n';
      }else{
        chapters.forEach(ch => { md += `## ${ch.title}\n\n${ch.body}\n\n`; });
      }
      await saveExactText(md, 'text/markdown;charset=utf-8', '.md', cfg.title);
    }catch(error){ reportError('Markdown', error); }
  };

  window.downloadDoc = downloadDoc = async function(){
    try{
      const cfg = getEpubConfig();
      const html = buildStandaloneHTML();
      await saveExactText(html, 'application/msword;charset=utf-8', '.doc', cfg.title);
    }catch(error){ reportError('DOC', error); }
  };

  window.__runLosslessExportSelfTestV21 = function(){
    const sample = '한글 가나다 · 漢字 · 日本語 · 😀 · 𠮷 · e\u0301 · {{문장}} · <>&"\'\n둘째 줄';
    const bytes = encodeExactUtf8(sample);
    const decoded = decoder.decode(bytes);
    const items = [
      {blockId:'u-1', owner:'user', kind:'normal', text:sample},
      {blockId:'c-1', owner:'character', kind:'normal', text:'캐릭터 대사'},
      {blockId:'s-1', owner:'character', kind:'scene', text:'*지문*'}
    ];
    const html = typeof structuredItemsToHtml === 'function' ? structuredItemsToHtml(items) : '';
    const md = typeof structuredItemsToMarkdown === 'function' ? structuredItemsToMarkdown(items) : '';
    return {
      utf8RoundTrip: decoded === sample,
      noReplacementCharacter: decoded.indexOf('\uFFFD') < 0,
      htmlUser: /data-owner="user"/.test(html),
      htmlCharacter: /data-owner="character"/.test(html),
      htmlScene: /data-kind="scene"/.test(html),
      markdownUser: /owner=user/.test(md),
      markdownCharacter: /owner=character/.test(md),
      markdownScene: /kind=scene/.test(md)
    };
  };
})();
