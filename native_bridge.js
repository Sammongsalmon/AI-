(function () {
  'use strict';
  if (window.__nativeDownloadBridgeInstalled) return;
  window.__nativeDownloadBridgeInstalled = true;

  const nativePrompt = (command) => window.prompt(command, '') || '';
  const utf8ToB64 = (text) => {
    const bytes = new TextEncoder().encode(String(text == null ? '' : text));
    let binary = '';
    for (let i = 0; i < bytes.length; i += 0x8000) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    }
    return btoa(binary);
  };
  const bytesToB64 = (bytes) => {
    let binary = '';
    for (let i = 0; i < bytes.length; i += 0x8000) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    }
    return btoa(binary);
  };
  const toast = (message) => {
    try { nativePrompt('__NATIVE_TOAST__\t' + utf8ToB64(message)); }
    catch (_) { /* no-op */ }
  };

  const heldBlobUrls = new Set();
  const originalRevoke = URL.revokeObjectURL.bind(URL);
  URL.revokeObjectURL = function (url) {
    if (heldBlobUrls.has(String(url))) {
      setTimeout(() => {
        heldBlobUrls.delete(String(url));
        try { originalRevoke(url); } catch (_) {}
      }, 120000);
      return;
    }
    return originalRevoke(url);
  };

  async function nativeSaveBlobDirect(blobValue, filename, hintedType) {
    try {
      const blob = blobValue instanceof Blob ? blobValue : new Blob([blobValue], {type:hintedType || 'application/octet-stream'});
      const safeName = String(filename || 'download').replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_').slice(0, 180) || 'download';
      const mime = hintedType || blob.type || 'application/octet-stream';
      const bytes = new Uint8Array(await blob.arrayBuffer());
      /* 아래 원래 전송은 __NATIVE_BEGIN__ 계열 prompt 인데 이 앱의 Java 는 그 토큰을
         가로채지 않는다(AILogNative 직접 호출과 shared_* 작업만 처리). 그래서
         a[download] 를 거치는 내보내기(txt 등)가 조용히 실패해 왔다.
         실제로 동작하는 정확 바이트 저장 경로가 있으면 그쪽으로 넘긴다. */
      if (typeof window.__nativeSaveBytesExact === 'function') {
        await window.__nativeSaveBytesExact(bytes, safeName, mime);
        return true;
      }
      const id = nativePrompt('__NATIVE_BEGIN__\t' + utf8ToB64(safeName) + '\t' + utf8ToB64(mime) + '\t' + String(bytes.length));
      if (!id) throw new Error('native save unavailable');
      const CHUNK = 4096;
      let written = 0;
      for (let offset = 0; offset < bytes.length; offset += CHUNK) {
        const chunk = bytes.subarray(offset, Math.min(bytes.length, offset + CHUNK));
        const ok = nativePrompt('__NATIVE_WRITE__\t' + id + '\t' + bytesToB64(chunk));
        if (ok !== '1') throw new Error('native write failed at ' + offset);
        written += chunk.length;
      }
      if (written !== bytes.length) throw new Error('native byte count mismatch');
      const ok = nativePrompt('__NATIVE_FINISH__\t' + id);
      if (ok !== '1') throw new Error('native finish failed');
      return true;
    } catch (error) {
      console.error(error);
      toast('파일 저장을 시작하지 못했습니다.');
      return false;
    }
  }

  async function nativeDownload(url, filename, hintedType) {
    const href = String(url || '');
    if (!/^(blob:|data:)/i.test(href)) return false;
    if (href.startsWith('blob:')) heldBlobUrls.add(href);
    try {
      const response = await fetch(href);
      if (!response.ok && !href.startsWith('data:') && response.status !== 0) {
        throw new Error('download fetch failed: ' + response.status);
      }
      return await nativeSaveBlobDirect(await response.blob(), filename, hintedType);
    } catch (error) {
      console.error(error);
      toast('파일 저장을 시작하지 못했습니다.');
      return false;
    }
  }

  window.__nativeSaveBlobDirect = nativeSaveBlobDirect;
  window.__nativeDownloadUrl = nativeDownload;

  const originalClick = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () {
    const href = this.href || this.getAttribute('href') || '';
    if (this.hasAttribute('download') && /^(blob:|data:)/i.test(href)) {
      nativeDownload(href, this.download || 'download', this.type || '');
      return;
    }
    return originalClick.apply(this, arguments);
  };

  document.addEventListener('click', function (event) {
    const anchor = event.target && event.target.closest ? event.target.closest('a[download]') : null;
    if (!anchor) return;
    const href = anchor.href || anchor.getAttribute('href') || '';
    if (!/^(blob:|data:)/i.test(href)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    nativeDownload(href, anchor.download || 'download', anchor.type || '');
  }, true);
})();
