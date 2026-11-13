import { auth } from './firebase.js';
import { getIdToken, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js';
const API='https://earnlibr-core-api.www-sandicarrew.workers.dev';
function report(path,reason){
 console.error('EarnLibr notification:',path,reason);
 window.dispatchEvent(new CustomEvent('earnlibr:push-error',{detail:{path,reason}}));
}
async function signedInUser(){
 if(auth.currentUser)return auth.currentUser;
 return new Promise(resolve=>{
  let settled=false,stop=()=>{};
  const timeout=setTimeout(()=>{if(!settled){settled=true;stop();resolve(null)}},5000);
  stop=onAuthStateChanged(auth,u=>{if(!settled){settled=true;clearTimeout(timeout);stop();resolve(u)}},()=>{if(!settled){settled=true;clearTimeout(timeout);resolve(null)}});
 });
}
async function send(path,dealId,messageId){
 const user=await signedInUser();
 if(!user){report(path,'Firebase sign-in is unavailable on this device');return false}
 const response=await fetch(API+path,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+await getIdToken(user)},body:JSON.stringify({dealId,...(messageId?{messageId}:{})})});
 if(!response.ok){let reason='HTTP '+response.status;try{const data=await response.json();reason=data.error||reason}catch{}if(response.status===403 && reason==='Forbidden')reason='This chat was opened in a different browser session. Notifications require the original verified chat session.';report(path,reason);return false}
 return true;
}
export async function queueChatPush(dealId,messageId){try{return await send('/v1/chat/enqueue',dealId,messageId)}catch(e){report('/v1/chat/enqueue',e?.message||'Network failure');return false}}
export async function markChatRead(dealId){if(document.visibilityState!=='visible')return false;try{return await send('/v1/chat/read',dealId)}catch(e){console.warn('Chat read update failed',e);return false}}
