import { auth } from './firebase.js';
import { getIdToken } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js';
const API='https://earnlibr-core-api.www-sandicarrew.workers.dev';
async function send(path,dealId,messageId){
 const user=auth.currentUser;
 if(!user)return false;
 const response=await fetch(API+path,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+await getIdToken(user)},body:JSON.stringify({dealId,...(messageId?{messageId}:{})})});
 if(!response.ok){console.warn('Chat push request not accepted',path,response.status);return false}
 return true;
}
export async function queueChatPush(dealId,messageId){try{return await send('/v1/chat/enqueue',dealId,messageId)}catch(e){console.warn('Chat push enqueue failed',e);return false}}
export async function markChatRead(dealId){if(document.visibilityState!=='visible')return false;try{return await send('/v1/chat/read',dealId)}catch(e){console.warn('Chat read update failed',e);return false}}
