(()=>{try{if(typeof downloadHtml==="undefined")window.downloadHtml=function(){console.warn("downloadHtml 미정의 호출")};}catch(_){}})();
(function(){
  'use strict';
  if(window.__finalTwoFixesV22Installed) return;
  window.__finalTwoFixesV22Installed = true;

  const utf8Encoder = new TextEncoder();
  const utf8Decoder = new TextDecoder('utf-8', {fatal:true});

  function exactUtf8Bytes(value){
    const text = String(value == null ? '' : value);
    const bytes = utf8Encoder.encode(text);
    if(utf8Decoder.decode(bytes) !== text) throw new Error('HTML UTF-8 무손실 검증에 실패했습니다.');
    return bytes;
  }

  function exportName(ext, fallback){
    return typeof safeDownloadFileName === 'function'
      ? safeDownloadFileName(ext, fallback)
      : `${String(fallback || 'download').replace(/[\\/:*?"<>|]/g, '_')}${ext}`;
  }

  function exportError(label, error){
    console.error(label + ' export failed', error);
    const message = label + ' 저장 실패: ' + String(error && error.message ? error.message : error);
    if(typeof showToast === 'function') showToast(message);
  }

  // Android 파일 연결이 브라우저로 정상 인식되도록 MIME 매개변수를 제거한
  // 표준 text/html 형식으로만 저장한다. HTML 내용과 스타일은 그대로 둔다.
  window.downloadHtml = downloadHtml = async function(){
    try{
      const cfg = getEpubConfig();
      const html = buildStandaloneHTML();
      const bytes = exactUtf8Bytes(html);
      const filename = exportName('.html', cfg.title);
      if(typeof window.__nativeSaveBytesExact === 'function'){
        await window.__nativeSaveBytesExact(bytes, filename, 'text/html');
      }else if(typeof downloadBlob === 'function'){
        await downloadBlob(new Blob([bytes], {type:'text/html'}), filename);
      }else{
        throw new Error('파일 저장 기능을 사용할 수 없습니다.');
      }
    }catch(error){
      exportError('HTML', error);
    }
  };

  function cleanSegment(value){
    return String(value == null ? '' : value).replace(/\u00a0/g, ' ').trim();
  }

  function copyChunkWith(chunk, text, kind, sequence){
    return Object.assign({}, chunk, {
      id: String(chunk && chunk.id ? chunk.id : 'chunk') + '-v22-' + sequence,
      text: cleanSegment(text),
      kind: kind
    });
  }

  // 한 응답 안에서 별표 묶음(* 또는 **)을 열기/닫기 토큰으로 본다.
  // 마지막 토큰이 닫히지 않으면 그 지점부터 해당 응답 끝까지 지문으로 유지한다.
  function splitResponseByAsterisks(sourceChunks){
    const result = [];
    let narrationOpen = false;
    let sequence = 0;

    (sourceChunks || []).forEach(chunk => {
      if(!chunk) return;
      const text = String(chunk.text == null ? '' : chunk.text);

      // 이미 HTML/구조 정보로 지문 판정된 조각은 그대로 보존한다.
      if(chunk.kind === 'scene'){
        if(cleanSegment(text)) result.push(copyChunkWith(chunk, text, 'scene', sequence++));
        return;
      }

      const marker = /\*+/g;
      let cursor = 0;
      let match;
      while((match = marker.exec(text))){
        const before = text.slice(cursor, match.index);
        const cleaned = cleanSegment(before);
        if(cleaned){
          result.push(copyChunkWith(chunk, before, narrationOpen ? 'scene' : 'normal', sequence++));
        }
        narrationOpen = !narrationOpen;
        cursor = marker.lastIndex;
      }

      const tail = text.slice(cursor);
      const cleanedTail = cleanSegment(tail);
      if(cleanedTail){
        result.push(copyChunkWith(chunk, tail, narrationOpen ? 'scene' : 'normal', sequence++));
      }
    });

    return result;
  }

  function applyUnclosedAsteriskRule(parsed){
    if(!parsed || !Array.isArray(parsed.chunks) || !Array.isArray(parsed.blocks)) return parsed;
    const hasLiteralAsterisk = parsed.blocks.some(block => {
      const start = Math.max(0, Number(block.startChunk) || 0);
      const end = Math.max(start, Number(block.endChunk) || start);
      return parsed.chunks.slice(start, end).some(chunk => chunk && chunk.kind !== 'scene' && /\*/.test(String(chunk.text || '')));
    });
    if(!hasLiteralAsterisk) return parsed;

    const oldChunks = parsed.chunks;
    const sortedBlocks = parsed.blocks.slice().sort((a,b) => (Number(a.startChunk)||0) - (Number(b.startChunk)||0));
    const newChunks = [];
    const newBlocks = [];
    let cursor = 0;

    sortedBlocks.forEach(block => {
      const start = Math.max(cursor, Math.max(0, Number(block.startChunk) || 0));
      const end = Math.max(start, Number(block.endChunk) || start);

      while(cursor < start && cursor < oldChunks.length){
        newChunks.push(oldChunks[cursor++]);
      }

      const processed = splitResponseByAsterisks(oldChunks.slice(start, end));
      const newStart = newChunks.length;
      processed.forEach(chunk => newChunks.push(chunk));
      const newEnd = newChunks.length;
      const text = processed.map(chunk => chunk.text).filter(Boolean).join('\n\n').trim();
      if(text){
        newBlocks.push(Object.assign({}, block, {
          startChunk: newStart,
          endChunk: newEnd,
          text: text
        }));
      }
      cursor = Math.max(cursor, end);
    });

    while(cursor < oldChunks.length) newChunks.push(oldChunks[cursor++]);
    return Object.assign({}, parsed, {chunks:newChunks, blocks:newBlocks});
  }

  const originalParseRofanChatChunks = typeof parseRofanChatChunks === 'function' ? parseRofanChatChunks : null;
  if(originalParseRofanChatChunks){
    const patchedParseRofanChatChunks = function(root){
      return applyUnclosedAsteriskRule(originalParseRofanChatChunks(root));
    };
    window.parseRofanChatChunks = patchedParseRofanChatChunks;
    try{ parseRofanChatChunks = patchedParseRofanChatChunks; }catch(_){ /* global binding fallback */ }
  }

  window.__v22SplitResponseByAsterisks = splitResponseByAsterisks;
  window.__v22ApplyUnclosedAsteriskRule = applyUnclosedAsteriskRule;
  window.__runFinalTwoFixesSelfTestV22 = function(){
    const base = (text, id) => ({id:id, kind:'normal', text:text, owner:'character', color:'', fromTable:false, fromDetails:false, blockId:'response-1'});
    const a = splitResponseByAsterisks([base('대사 *닫힌 지문* 다시 대사', 'a')]);
    const b = splitResponseByAsterisks([base('대사 *열린 지문', 'b'), base('다음 문단도 지문', 'c')]);
    const c = splitResponseByAsterisks([base('대사 **굵은 별표 지문** 끝', 'd')]);
    return {
      htmlMime: 'text/html',
      closedPair: a.map(x => x.kind + ':' + x.text).join('|'),
      unclosedTail: b.map(x => x.kind + ':' + x.text).join('|'),
      doubleAsterisk: c.map(x => x.kind + ':' + x.text).join('|'),
      passed: a.length === 3 && a[1].kind === 'scene' &&
        b.length === 3 && b[1].kind === 'scene' && b[2].kind === 'scene' &&
        c.length === 3 && c[1].kind === 'scene'
    };
  };
})();

/* v23: TXT export compatibility only. No other behavior is changed. */
(function(){
  'use strict';
  if(window.__txtPlainOpenFixV23Installed) return;
  window.__txtPlainOpenFixV23Installed = true;

  const encoder = new TextEncoder();
  const decoder = new TextDecoder('utf-8', {fatal:true});

  function txtFileName(){
    const fallback = activeMode === 'chat'
      ? 'cleaned_rofan_chat'
      : (activeMode === 'epubedit' ? 'edited_epub_text' : 'cleaned_log');
    return typeof safeDownloadFileName === 'function'
      ? safeDownloadFileName('.txt', fallback)
      : `${String(fallback || 'cleaned_log').replace(/[\\/:*?"<>|]/g, '_')}.txt`;
  }

  window.downloadTxt = downloadTxt = async function(){
    try{
      const text = String(typeof getPlainActiveOutputValue === 'function' ? getPlainActiveOutputValue() : '');
      // UTF-8 BOM lets Android and legacy text viewers identify Korean text reliably.
      const bytes = encoder.encode('\uFEFF' + text);
      if(decoder.decode(bytes).replace(/^\uFEFF/, '') !== text){
        throw new Error('TXT UTF-8 무손실 검증에 실패했습니다.');
      }
      const filename = txtFileName();
      // Use the bare standard MIME so Android can associate the file with text viewers.
      if(typeof window.__nativeSaveBytesExact === 'function'){
        await window.__nativeSaveBytesExact(bytes, filename, 'text/plain');
      }else if(typeof downloadBlob === 'function'){
        await downloadBlob(new Blob([bytes], {type:'text/plain'}), filename);
      }else{
        throw new Error('파일 저장 기능을 사용할 수 없습니다.');
      }
      if(typeof showToast === 'function') showToast('TXT 파일을 저장했습니다.');
    }catch(error){
      console.error('TXT export failed', error);
      if(typeof showToast === 'function') showToast('TXT 저장 실패: ' + String(error && error.message ? error.message : error));
    }
  };
})();
