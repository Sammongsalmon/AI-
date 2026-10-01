(()=>{try{if(typeof downloadBlob==="undefined")window.downloadBlob=function(){console.warn("downloadBlob 미정의 호출")};}catch(_){}})();
(function(){
  'use strict';
  if(window.__exportIntegrityV20Installed) return;
  window.__exportIntegrityV20Installed = true;

  const encoder = new TextEncoder();
  const UTF8_BOM_BYTES = new Uint8Array([0xEF, 0xBB, 0xBF]);
  const UTF8_BOM_CHAR = '\uFEFF';

  function strictDecode(bytes){
    return new TextDecoder('utf-8', {fatal:true}).decode(bytes);
  }
  function concatBytes(a, b){
    const out = new Uint8Array(a.length + b.length);
    out.set(a, 0); out.set(b, a.length);
    return out;
  }
  function hasUnpairedSurrogate(text){
    const s = String(text == null ? '' : text);
    for(let i=0;i<s.length;i++){
      const code = s.charCodeAt(i);
      if(code >= 0xD800 && code <= 0xDBFF){
        const next = s.charCodeAt(i + 1);
        if(!(next >= 0xDC00 && next <= 0xDFFF)) return true;
        i += 1;
      }else if(code >= 0xDC00 && code <= 0xDFFF){
        return true;
      }
    }
    return false;
  }
  function encodeUtf8Exact(text, withBom){
    const source = String(text == null ? '' : text).replace(/^\uFEFF/, '');
    if(hasUnpairedSurrogate(source)){
      throw new Error('원문에 단독 UTF-16 서로게이트가 있어 무손실 UTF-8 저장을 할 수 없습니다.');
    }
    const body = encoder.encode(source);
    const decoded = strictDecode(body);
    if(decoded !== source) throw new Error('UTF-8 변환 전후 문자열이 일치하지 않습니다.');
    const bytes = withBom ? concatBytes(UTF8_BOM_BYTES, body) : body;
    const verifyBody = withBom ? bytes.subarray(3) : bytes;
    if(strictDecode(verifyBody) !== source) throw new Error('저장 바이트 재검증에 실패했습니다.');
    return {source, bytes};
  }
  function bytesEqual(a, b){
    if(a.length !== b.length) return false;
    for(let i=0;i<a.length;i++) if(a[i] !== b[i]) return false;
    return true;
  }
  function bytesToBase64(bytes){
    let binary = '';
    for(let i=0;i<bytes.length;i+=0x4000){
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x4000));
    }
    return btoa(binary);
  }
  function base64ToBytes(value){
    const binary = atob(String(value || ''));
    const out = new Uint8Array(binary.length);
    for(let i=0;i<binary.length;i++) out[i] = binary.charCodeAt(i) & 255;
    return out;
  }
  function utf8ToB64(text){ return bytesToBase64(encoder.encode(String(text == null ? '' : text))); }
  function nativePrompt(command){ return window.prompt(command, '') || ''; }
  function safeNativeName(filename){
    return String(filename || 'download').replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_').slice(0, 180) || 'download';
  }
  function notify(message){
    try{ if(typeof showToast === 'function') showToast(message); }
    catch(_){ /* no-op */ }
  }

  async function nativeSaveBytesExact(bytesValue, filename, mime){
    const bytes = bytesValue instanceof Uint8Array ? bytesValue : new Uint8Array(bytesValue || 0);
    const safeName = safeNativeName(filename);
    const mediaType = String(mime || 'application/octet-stream');
    const id = nativePrompt('__NATIVE_BEGIN__\t' + utf8ToB64(safeName) + '\t' + utf8ToB64(mediaType) + '\t' + String(bytes.length));
    if(!id) throw new Error('파일 저장 위치가 선택되지 않았습니다.');

    // 768 bytes is divisible by 3, so every non-final Base64 chunk has no padding.
    // It also stays comfortably below WebView prompt payload limits.
    const CHUNK = 768;
    let written = 0;
    for(let offset=0; offset<bytes.length; offset+=CHUNK){
      const chunk = bytes.subarray(offset, Math.min(bytes.length, offset + CHUNK));
      const b64 = bytesToBase64(chunk);
      const localRoundTrip = base64ToBytes(b64);
      if(!bytesEqual(chunk, localRoundTrip)) throw new Error('Base64 전송 전 검증에 실패했습니다.');
      const ok = nativePrompt('__NATIVE_WRITE__\t' + id + '\t' + b64);
      if(ok !== '1') throw new Error('파일 바이트 저장에 실패했습니다: ' + offset);
      written += chunk.length;
    }
    if(written !== bytes.length) throw new Error('파일 전송 바이트 수가 일치하지 않습니다.');
    const done = nativePrompt('__NATIVE_FINISH__\t' + id);
    if(done !== '1') throw new Error('파일 저장 완료 검증에 실패했습니다.');
    return true;
  }

  async function nativeSaveBlobExact(blobValue, filename, hintedType){
    const blob = blobValue instanceof Blob ? blobValue : new Blob([blobValue], {type:hintedType || 'application/octet-stream'});
    const bytes = new Uint8Array(await blob.arrayBuffer());
    return nativeSaveBytesExact(bytes, filename, hintedType || blob.type || 'application/octet-stream');
  }

  // Replace every export's final save path. This also keeps EPUB on the same exact-byte path.
  /* 내보내기의 최종 관문. txt·html 은 downloadBlob 을 거치지 않고 이 함수를 직접 부르므로
     성공 알림을 여기에도 둔다. downloadBlob 경로는 안쪽 지역 함수를 쓰니 알림이 겹치지 않는다. */
  window.__nativeSaveBytesExact = async function(bytes, filename, mime){
    const result = await nativeSaveBytesExact(bytes, filename, mime);
    try{ notify(String(filename || '파일') + ' 을(를) 내보냈습니다.'); }catch(_){}
    return result;
  };
  window.__nativeSaveBlobDirect = nativeSaveBlobExact;
  window.downloadBlob = downloadBlob = function(blob, filename){
    const task = nativeSaveBlobExact(blob, filename, (blob && blob.type) || 'application/octet-stream');
    /* 성공 알림은 최종 관문(__nativeSaveBytesExact)에서 한 번만 — 여기서도 알리면 EPUB 등 blob 경로가 두 번 울린다 */
    task.catch(error => {
      console.error('Direct file save failed', error);
      notify('파일 저장 실패: ' + String(error && error.message ? error.message : error));
    });
    return task;
  };

  function fileName(ext, fallback){
    return typeof safeDownloadFileName === 'function'
      ? safeDownloadFileName(ext, fallback)
      : `${String(fallback || 'download').replace(/[\\/:*?"<>|]/g, '_')}${ext}`;
  }
  async function saveUtf8Text(text, mime, ext, fallback, withBom){
    const encoded = encodeUtf8Exact(text, !!withBom);
    await nativeSaveBytesExact(encoded.bytes, fileName(ext, fallback), mime);
    notify(`${ext.replace('.', '').toUpperCase()} 파일을 저장했습니다.`);
  }
  function ensureUtf8HtmlDocument(html){
    let source = String(html == null ? '' : html).replace(/^\uFEFF/, '');
    if(!/^\s*<!doctype\s+html/i.test(source)) source = '<!DOCTYPE html>\n' + source;
    source = source.replace(/<meta\b[^>]*charset\s*=\s*["']?[^\s"'>]+["']?[^>]*>/ig, '');
    source = source.replace(/<meta\b[^>]*http-equiv\s*=\s*["']?content-type["']?[^>]*>/ig, '');
    if(/<head\b[^>]*>/i.test(source)){
      source = source.replace(/<head\b([^>]*)>/i, '<head$1><meta charset="utf-8">');
    }else if(/<html\b[^>]*>/i.test(source)){
      source = source.replace(/<html\b([^>]*)>/i, '<html$1><head><meta charset="utf-8"></head>');
    }else{
      source = '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>' + source + '</body></html>';
    }
    return source;
  }
  function makeWordCompatibleHtmlV20(){
    let html = typeof buildStandaloneHTML === 'function'
      ? buildStandaloneHTML()
      : '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body></body></html>';
    html = ensureUtf8HtmlDocument(html).replace(/^\s*<!doctype\s+html>\s*/i, '');
    html = html.replace(/<html\b([^>]*)>/i, '<html$1 xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">');
    html = html.replace(/<head\b([^>]*)>/i, '<head$1><meta charset="utf-8"><meta http-equiv="Content-Type" content="text/html; charset=utf-8"><meta name="ProgId" content="Word.Document"><meta name="Generator" content="AI Log EPUB"><!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom><w:DoNotOptimizeForBrowser/></w:WordDocument></xml><![endif]-->');
    return '<!DOCTYPE html>\n' + html;
  }

  window.downloadTxt = downloadTxt = async function(){
    try{
      const fallback = activeMode === 'chat' ? 'cleaned_rofan_chat' : (activeMode === 'epubedit' ? 'edited_epub_text' : 'cleaned_log');
      const text = typeof getPlainActiveOutputValue === 'function' ? getPlainActiveOutputValue() : '';
      await saveUtf8Text(text, 'text/plain;charset=utf-8', '.txt', fallback, true);
    }catch(error){
      console.error('TXT export failed', error); notify('TXT 저장 실패: ' + error.message);
    }
  };

  window.downloadHtml = downloadHtml = async function(){
    try{
      const cfg = typeof getEpubConfig === 'function' ? getEpubConfig() : {title:'정리한 로그'};
      const html = ensureUtf8HtmlDocument(typeof buildStandaloneHTML === 'function' ? buildStandaloneHTML() : '');
      // Parse once in the same WebView before saving; malformed document construction is caught here.
      const parsed = new DOMParser().parseFromString(html, 'text/html');
      if(!parsed || !parsed.documentElement || !parsed.querySelector('meta[charset]')) throw new Error('HTML 문서 검증에 실패했습니다.');
      await saveUtf8Text(html, 'text/html;charset=utf-8', '.html', cfg.title, true);
    }catch(error){
      console.error('HTML export failed', error); notify('HTML 저장 실패: ' + error.message);
    }
  };

  window.downloadMarkdown = downloadMarkdown = async function(){
    try{
      const cfg = typeof getEpubConfig === 'function' ? getEpubConfig() : {title:'정리한 로그', subtitle:'', author:'', description:''};
      const chapters = typeof getExportChapters === 'function' ? getExportChapters(true) : [];
      let md = `# ${cfg.title || '정리한 로그'}\n\n`;
      if(cfg.subtitle) md += `_${cfg.subtitle}_\n\n`;
      if(cfg.author) md += `작가: ${cfg.author}\n\n`;
      if(cfg.description) md += `${cfg.description}\n\n`;
      if(activeMode !== 'epubedit' && typeof lastStructuredItems !== 'undefined' && lastStructuredItems && lastStructuredItems.length && typeof structuredItemsToMarkdown === 'function'){
        md += structuredItemsToMarkdown(lastStructuredItems) + '\n';
      }else if(activeMode === 'epubedit' && typeof editorStructuredMarkdown === 'function' && editorStructuredMarkdown()){
        md += editorStructuredMarkdown() + '\n';
      }else if(activeMode === 'epubedit'){
        const text = typeof editorPlainText === 'function' ? editorPlainText(epubEditEditor) : ((epubEditEditor && (epubEditEditor.innerText || epubEditEditor.textContent)) || '');
        md += String(text || '') + '\n';
      }else{
        chapters.forEach(ch => { md += `## ${ch.title || ''}\n\n${ch.body || ''}\n\n`; });
      }
      await saveUtf8Text(md, 'text/markdown;charset=utf-8', '.md', cfg.title, true);
    }catch(error){
      console.error('Markdown export failed', error); notify('Markdown 저장 실패: ' + error.message);
    }
  };

  window.downloadDoc = downloadDoc = async function(){
    try{
      const cfg = typeof getEpubConfig === 'function' ? getEpubConfig() : {title:'정리한 로그'};
      const html = makeWordCompatibleHtmlV20();
      const parsed = new DOMParser().parseFromString(html, 'text/html');
      if(!parsed || !parsed.documentElement) throw new Error('DOC용 HTML 문서 검증에 실패했습니다.');
      await saveUtf8Text(html, 'application/msword;charset=utf-8', '.doc', cfg.title, true);
    }catch(error){
      console.error('DOC export failed', error); notify('DOC 저장 실패: ' + error.message);
    }
  };
})();
