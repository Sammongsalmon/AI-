/* v80 — 구형 prompt 브리지를 AILogNative 로 통역한다.
   log_library_v6 / log_library_tabs_v38 / export_integrity_v20 / native_bridge 가
   아직 window.prompt("__LOG_LIST__" ...) 형태를 쓰고 있어서, 이를 가로채지 않으면
   안드로이드 기본 입력 대화상자가 그대로 뜬다. */
(()=>{"use strict";
if(window.__AI_LOG_LEGACY_SHIM_V80) return;
window.__AI_LOG_LEGACY_SHIM_V80 = true;

const realPrompt = window.prompt ? window.prompt.bind(window) : (()=>null);
const te = new TextEncoder(), td = new TextDecoder("utf-8");
const t64 = s => { const b = te.encode(String(s==null?"":s)); let x=""; for(let i=0;i<b.length;i+=0x8000) x += String.fromCharCode.apply(null, b.subarray(i, i+0x8000)); return btoa(x); };
const un64 = v => { const x = atob(String(v||"")); const b = new Uint8Array(x.length); for(let i=0;i<x.length;i++) b[i] = x.charCodeAt(i); return b; };
const ut = v => { try { return td.decode(un64(v)); } catch(_){ return ""; } };

function native(cmd){
  if(!(window.AILogNative && typeof window.AILogNative.call === "function")) return null;
  const raw = window.AILogNative.call(cmd);
  if(raw == null) return null;
  const s = String(raw), p = s.indexOf("\t");
  const ok = (p < 0 ? s : s.slice(0, p)) === "1";
  const payload = p < 0 ? "" : s.slice(p + 1);
  if(!ok) throw new Error(ut(payload) || "native failed");
  return ut(payload);
}

/* shared_read 응답은 파일 바이트다. 위의 native() 는 payload 를 UTF-8 로 디코드하므로
   바이너리가 깨진다. 구형 __LOG_READ__ 는 base64 를 그대로 기대하니 원문을 넘긴다. */
function nativeB64(cmd){
  if(!(window.AILogNative && typeof window.AILogNative.call === "function")) return "";
  const raw = window.AILogNative.call(cmd);
  if(raw == null) return "";
  const s = String(raw), p = s.indexOf("\t");
  const ok = (p < 0 ? s : s.slice(0, p)) === "1";
  const payload = p < 0 ? "" : s.slice(p + 1);
  if(!ok) throw new Error(ut(payload) || "native failed");
  return payload;
}

/* 구형 __LOG_* 는 파일을 '이름'으로 지목하고, 새 shared_* 는 'id' 로 지목한다.
   shared_list 로 이름→id 색인을 만들어 중개한다.
   목록을 바꾸는 작업(begin/finish/cancel/rename/delete) 뒤에는 색인을 버린다. */
let importIndex = null;
function refreshImportIndex(){
  const raw = native("shared_list\timport") || "";
  importIndex = raw.split("\n").filter(Boolean).map(line => {
    const c = line.split("\t");
    return { id: c[0] || "", name: ut(c[1]), size: Number(c[2]) || 0, modified: Number(c[3]) || 0 };
  });
  return importIndex;
}
function importList(){ return importIndex || refreshImportIndex(); }
function findImport(name){
  const wanted = String(name || "");
  let hit = importList().find(f => f.name === wanted);
  if(!hit) hit = refreshImportIndex().find(f => f.name === wanted);   // 색인이 낡았을 수 있다
  return hit || null;
}

window.prompt = function(message, def){
  const s = String(message == null ? "" : message);
  if(!/^__[A-Z0-9_]+__/.test(s)) return realPrompt(message, def);
  const a = s.split("\t"), cmd = a[0];
  try{
    switch(cmd){
      case "__NATIVE_TOAST__":
        native("toast\t" + (a[1] || ""));
        return "1";
      case "__NATIVE_BEGIN__":
        return native(["shared_begin", "export", a[1] || "", a[2] || "", a[3] || "0"].join("\t"));
      case "__NATIVE_WRITE__":
        native(["shared_write", a[1] || "", a[2] || ""].join("\t"));
        return "1";
      case "__NATIVE_FINISH__":
        native(["shared_finish", a[1] || ""].join("\t"));
        return "1";
      case "__LOG_PATH__":
        return t64("Download/로그 발췌기/불러오기");
      case "__LOG_LIST__":
        // 신규: id \t b64name \t size \t modified \t b64mime  ->  구형: b64name \t size \t modified
        return refreshImportIndex().map(f => [t64(f.name), String(f.size), String(f.modified)].join("\t")).join("\n");

      case "__LOG_BEGIN__": {
        // 구형: b64name \t 길이   ->  shared_begin \t import \t b64name \t b64mime
        const id = native(["shared_begin", "import", a[1] || "", t64("text/plain;charset=utf-8")].join("\t"));
        importIndex = null;
        return id || "";
      }
      case "__LOG_WRITE__":
        native(["shared_write", a[1] || "", a[2] || ""].join("\t"));
        return "1";
      case "__LOG_FINISH__":
        native(["shared_finish", a[1] || ""].join("\t"));
        importIndex = null;
        return "1";
      case "__LOG_CANCEL__":
        native(["shared_cancel", a[1] || ""].join("\t"));
        importIndex = null;
        return "1";

      case "__LOG_READ__": {
        // 구형: b64name \t offset \t length  ->  응답 "총길이 \t b64바이트"
        const file = findImport(ut(a[1]));
        if(!file) return "";
        const payload = nativeB64(["shared_read", "import", file.id,
                                   String(Number(a[2]) || 0), String(Number(a[3]) || 0)].join("\t"));
        return String(file.size) + "\t" + payload;
      }
      case "__LOG_RENAME__": {
        const file = findImport(ut(a[1]));
        if(!file) return "0";
        const next = ut(a[2]);
        if(!next) return "0";
        if(importList().some(f => f.name === next && f.id !== file.id)) return "E_EXISTS";
        native(["shared_rename", "import", file.id, a[2] || ""].join("\t"));
        importIndex = null;
        return "1";
      }
      case "__LOG_DELETE__": {
        const file = findImport(ut(a[1]));
        if(!file) return "0";
        native(["shared_delete", "import", file.id].join("\t"));
        importIndex = null;
        return "1";
      }

      default:
        return "";   // 알 수 없는 명령이라도 대화상자는 절대 띄우지 않는다
    }
  }catch(err){
    console.warn("legacy bridge", cmd, err);
    return "";
  }
};
})();
