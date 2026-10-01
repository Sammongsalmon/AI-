(()=>{"use strict";
const V=79,te=new TextEncoder(),td=new TextDecoder("utf-8"),yieldUi=()=>new Promise(r=>setTimeout(r,0));
if(window.RofanNativeBridge?.__promptStableV79)return;
const b64=input=>{const b=input instanceof Uint8Array?input:new Uint8Array(input||0);let s="";for(let i=0;i<b.length;i+=12288)s+=String.fromCharCode.apply(null,b.subarray(i,Math.min(i+12288,b.length)));return btoa(s)};
const un64=value=>{const x=atob(String(value||"")),b=new Uint8Array(x.length);for(let i=0;i<x.length;i++)b[i]=x.charCodeAt(i);return b};
const t64=value=>b64(te.encode(String(value??""))),ut=value=>td.decode(un64(value));
function nativeRaw(op,args=[]){const command=[op,...args.map(v=>String(v??""))].join("\t"),raw=(function(){const d=window.AILogNative;if(d&&typeof d.call==="function"){const r=d.call(command);if(r!=null&&String(r)!=="")return r}throw new Error("Android 저장 연결을 찾지 못했습니다("+op+"). 앱을 다시 시작해 주세요.")})();if(raw==null)throw new Error("Android 저장 연결이 응답하지 않았습니다.");const text=String(raw),p=text.indexOf("\t"),ok=(p<0?text:text.slice(0,p))==="1",payload=p<0?"":text.slice(p+1);let bytes;try{bytes=un64(payload)}catch(_){bytes=new Uint8Array()}if(!ok)throw new Error(td.decode(bytes)||`Android ${op} 작업 실패`);return bytes}
async function call(op,args=[]){return nativeRaw(op,args)}
async function text(op,args=[]){return td.decode(nativeRaw(op,args))}
const parseShared=(s,category)=>{const a=String(s||"").split("\t");if(!a[0])return null;try{return{id:a[0],category,name:ut(a[1]||""),size:Number(a[2])||0,modified:Number(a[3])||0,mime:ut(a[4]||"")||"application/octet-stream"}}catch(_){return null}};
const parseSharedList=(s,c)=>String(s||"").split("\n").filter(Boolean).map(x=>parseShared(x,c)).filter(Boolean);
const parseFont=s=>{const a=String(s||"").split("\t");if(!a[0])return null;try{return{name:ut(a[0]),size:Number(a[1])||0,modified:Number(a[2])||0}}catch(_){return null}};
async function transfer(beginOp,writeOp,finishOp,cancelOp,beginArgs,bytes,chunkSize,progress){let id="",finished=false;try{id=await text(beginOp,beginArgs);if(!id)throw new Error("저장 세션을 만들지 못했습니다.");let offset=0,index=0;while(offset<bytes.length){const end=Math.min(bytes.length,offset+chunkSize),chunk=bytes.subarray(offset,end);await text(writeOp,[id,b64(chunk)]);offset=end;progress?.(offset,bytes.length);if((++index&7)===0)await yieldUi()}const result=await text(finishOp,[id]);finished=true;return result}catch(error){if(id&&!finished)try{await text(cancelOp,[id])}catch(_){}throw error}}
async function adaptiveTransfer(kind,beginOp,writeOp,finishOp,cancelOp,beginArgs,bytes,progress){let last;for(const size of [24576,8192,3072]){try{return await transfer(beginOp,writeOp,finishOp,cancelOp,beginArgs,bytes,size,progress)}catch(error){last=error;console.warn(kind,"transfer retry",size,error)}}throw last||new Error(`${kind} 저장 실패`)}
async function saveShared(category,input,name,mime){const bytes=input instanceof Uint8Array?input:new Uint8Array(input||0);if(!bytes.length)throw new Error("저장할 파일이 비어 있습니다.");const raw=await adaptiveTransfer("shared","shared_begin","shared_write","shared_finish","shared_cancel",[category,t64(name),t64(mime||"application/octet-stream"),String(bytes.length)],bytes);const rec=parseShared(raw,category)||{id:"",category,name:String(name||""),size:bytes.length,modified:Date.now(),mime:mime||"application/octet-stream"};rec.size=bytes.length;return rec}
async function listShared(category){return parseSharedList(await text("shared_list",[category]),category)}
/* 앱을 지웠다 다시 깔면 Download 아래 예전 파일의 소유자 기록이 끊겨 목록에서 빠진다.
   그 파일을 읽으려면 사용자가 저장 폴더를 한 번 골라 주어야 한다(SAF).
   [v352] v347 에서 작업 이름이 storage_* → folder_* 로 바뀌었는데 이 파일을 고치지 않아,
   그 뒤로 이 두 함수가 늘 실패했다. 그래서 로그 보관함의 '예전 파일 불러오기' 안내가
   한 번도 뜨지 않았다. */
async function storageStatus(){try{return (await text("folder_status"))==="1"}catch(_){return false}}
async function requestStorage(){await text("folder_pick");return true}
/* [v355] 목록이 왜 비었는지 사람에게 말하려면 앱이 본 것을 그대로 받아야 한다.
   예전 파일이 안 보인다는 보고가 반복됐고, 코드만 읽어서는 원인을 좁힐 수 없었다. */
async function probeShared(category){
  const parts=String(await text("shared_probe",[category])||"").split("\t");
  const un=v=>{try{return v?ut(v):""}catch(_){return ""}};
  return {연결:parts[0]==="1", 폴더있음:parts[1]==="1",
          미디어스토어:Number(parts[2]||0), 폴더에서:Number(parts[3]||0),
          찾던폴더:un(parts[4]), 연결된폴더:un(parts[5]), 하위폴더:un(parts[6])};
}
async function readShared(category,id,offset,length){return length?call("shared_read",[category,id,String(Math.max(0,+offset||0)),String(Math.min(262144,+length||0))]):new Uint8Array()}
async function readWhole(file,reader,progress){const total=Math.max(0,+file?.size||0),parts=[];let offset=0;while(offset<total){const part=await reader(offset,Math.min(262144,total-offset));if(!part.length)break;parts.push(part);offset+=part.length;progress?.(Math.min(offset,total),total);if((parts.length&3)===0)await yieldUi()}const out=new Uint8Array(offset);let p=0;for(const part of parts){out.set(part,p);p+=part.length}return out}
async function renameShared(c,id,n){await text("shared_rename",[c,id,t64(n)]);return true}
async function deleteShared(c,id){await text("shared_delete",[c,id]);return true}
async function getConfig(k,d=""){const v=await text("config_get",[t64(k)]);return v===""?d:v}
async function setConfig(k,v){await text("config_set",[t64(k),t64(v)]);return true}
async function listFonts(){return String(await text("font_list")||"").split("\n").filter(Boolean).map(parseFont).filter(Boolean).sort((a,b)=>a.name.localeCompare(b.name,"ko"))}
function repairSfnt(input){let bytes=input instanceof Uint8Array?input:new Uint8Array(input||0);if(bytes.length<32)return bytes;const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),scaler=view.getUint32(0,false);if(![0x00010000,0x4f54544f,0x74727565,0x74797031].includes(scaler))return bytes;const count=view.getUint16(4,false);if(!count||12+count*16>bytes.length)return bytes;let vhea=null,head=null;for(let i=0;i<count;i++){const p=12+i*16,tag=String.fromCharCode(bytes[p],bytes[p+1],bytes[p+2],bytes[p+3]),off=view.getUint32(p+8,false),len=view.getUint32(p+12,false);if(off+len>bytes.length)continue;if(tag==="vhea")vhea={dir:p,off,len};else if(tag==="head")head={dir:p,off,len}}if(!(vhea&&vhea.len>=4&&view.getUint32(vhea.off,false)===0x00010001))return bytes;const copy=new Uint8Array(bytes),v=new DataView(copy.buffer);v.setUint32(vhea.off,0x00010000,false);const checksum=(off,len)=>{let sum=0;for(let i=0;i<Math.ceil(len/4);i++){const p=off+i*4;let word=0;for(let j=0;j<4;j++)word=(word<<8)|(p+j<copy.length?copy[p+j]:0);sum=(sum+word)>>>0}return sum};v.setUint32(vhea.dir+4,checksum(vhea.off,vhea.len),false);if(head&&head.len>=12){v.setUint32(head.off+8,0,false);v.setUint32(head.off+8,(0xB1B0AFBA-checksum(0,copy.length))>>>0,false)}return copy}
async function saveFont(name,input,progress){const bytes=repairSfnt(input instanceof Uint8Array?input:new Uint8Array(input||0));if(!bytes.length)throw new Error("글꼴 파일이 비어 있습니다.");const raw=await adaptiveTransfer("font","font_begin","font_write","font_finish","font_cancel",[t64(name),String(bytes.length)],bytes,progress);const rec=parseFont(raw)||{name:String(name||""),size:bytes.length,modified:Date.now()};rec.size=bytes.length;return rec}
async function readFont(name,offset,length){return length?call("font_read",[t64(name),String(Math.max(0,+offset||0)),String(Math.min(262144,+length||0))]):new Uint8Array()}
async function deleteFont(name){await text("font_delete",[t64(name)]);return true}
const api={__promptStableV79:true,__stableV78:true,__stableDirectV71:true,__stableDirectV70:true,version:V,bytesToB64:b64,b64ToBytes:un64,textArg:t64,decodeText:ut,repairFontBytes:repairSfnt,call,callText:text,saveShared,listShared,readShared,readSharedWhole:(f,p)=>readWhole(f,(o,l)=>readShared(f.category,f.id,o,l),p),renameShared,deleteShared,storageStatus,requestStorage,probeShared,getConfig,setConfig,listFonts,saveFont,readFont,readFontWhole:(f,p)=>readWhole(f,(o,l)=>readFont(f.name,o,l),p),deleteFont,diagnose:async()=>td.decode(nativeRaw("ping")),transport:()=>"prompt-stable"};
window.__RF_NATIVE_BRIDGE_VERSION=V;window.RofanNativeBridge=api;try{dispatchEvent(new CustomEvent("ai-log-native-bridge-ready",{detail:{version:V}}))}catch(_){ }
})();
