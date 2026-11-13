import { auth } from './firebase.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js';
import { enablePush, disablePush } from './push-client.js';

const panel = document.createElement('section');
panel.setAttribute('aria-label', 'Chat notifications');
panel.style.cssText = 'padding:12px 16px;background:#101d30;color:#e2e8f0;border-bottom:1px solid #29364b;font:13px Arial,sans-serif;';
const title = document.createElement('strong');
title.textContent = 'Chat notifications';
const info = document.createElement('p');
info.setAttribute('role','status');
info.style.cssText = 'margin:7px 0;line-height:1.5;';
const button = document.createElement('button');
button.type='button';
button.textContent='Allow notifications';
button.style.cssText='padding:9px 14px;border:0;border-radius:8px;background:#a3ff6e;color:#041018;font-weight:700;cursor:pointer;margin:0 8px 0 0;width:auto;';
const off = document.createElement('button');
off.type='button';
off.textContent='Turn off';
off.style.cssText='padding:9px 14px;border:1px solid #64748b;border-radius:8px;background:#17243a;color:white;cursor:pointer;width:auto;margin:0;';
panel.append(title,info,button,off);
(document.querySelector('header') || document.body.firstElementChild)?.insertAdjacentElement('afterend',panel);
let eligible=false;
function refresh(){
  const supported='Notification' in window && 'serviceWorker' in navigator;
  button.disabled=!eligible||!supported;
  off.disabled=!eligible||!supported;
  info.textContent=!supported?'This browser does not support push notifications.':!eligible?'Sign in with a verified EarnLibr account to enable browser notifications.':'Allow notifications to receive updates when the chat is closed.';
}
onAuthStateChanged(auth,user=>{eligible=!!user?.emailVerified;refresh();});
refresh();
button.addEventListener('click',async()=>{
  button.disabled=true;
  info.textContent='Enabling notifications…';
  try {await enablePush();info.textContent='Notifications enabled on this browser. Automatic unread-chat alerts are not active yet.';}
  catch(e){info.textContent='Could not enable notifications: '+(e?.message||'Unknown error');}
  finally{button.disabled=!eligible;}
});
off.addEventListener('click',async()=>{
  off.disabled=true;
  try {await disablePush();info.textContent='Notifications turned off for this browser.';}
  catch(e){info.textContent='Could not turn off notifications: '+(e?.message||'Unknown error');}
  finally{off.disabled=!eligible;}
});
