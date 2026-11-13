import { auth } from './firebase.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js';
import { enablePush, disablePush } from './push-client.js';

const key = 'earnlibr-push-choice-v2';
const panel=document.createElement('aside');
panel.setAttribute('aria-label','Chat notification preferences');
panel.style.cssText='margin:12px 16px;padding:15px;border:1px solid #334155;border-radius:14px;background:linear-gradient(125deg,#12283a,#0b1728);color:#e2e8f0;font:14px system-ui,sans-serif;box-shadow:0 5px 18px #0002;';
const heading=document.createElement('strong');heading.textContent='Stay in the loop 🔔';heading.style.cssText='font-size:15px;';
const info=document.createElement('p');info.setAttribute('role','status');info.style.cssText='margin:7px 0 12px;color:#cbd5e1;line-height:1.5;';
const actions=document.createElement('div');actions.style.cssText='display:flex;flex-wrap:wrap;gap:9px;';
const allow=document.createElement('button');allow.type='button';allow.textContent='Enable alerts';allow.style.cssText='padding:10px 14px;border:0;border-radius:9px;background:#a3ff6e;color:#061421;font-weight:700;cursor:pointer;';
const later=document.createElement('button');later.type='button';later.textContent='Not now';later.style.cssText='padding:10px 14px;border:1px solid #64748b;border-radius:9px;background:transparent;color:#e2e8f0;cursor:pointer;';
actions.append(allow,later);panel.append(heading,info,actions);
(document.querySelector('header')||document.body.firstElementChild)?.insertAdjacentElement('afterend',panel);
let userReady=false,busy=false,dismissed=false;
function choice(){try{return localStorage.getItem(key)}catch{return null}}
function save(v){try{localStorage.setItem(key,v)}catch{}}
function render(){
 const supported='Notification' in window&&'serviceWorker' in navigator;
 const enabled=choice()==='enabled'&&supported&&Notification.permission==='granted';
 panel.hidden=dismissed||enabled||!supported;
 if(!panel.hidden){info.textContent=!userReady?'Sign in to activate chat alerts.':'Get a notification when someone messages you while you are away.';allow.disabled=!userReady||busy;later.disabled=busy;}
}
onAuthStateChanged(auth,u=>{userReady=!!u&&(u.emailVerified||u.isAnonymous);render()});
render();
allow.onclick=async()=>{busy=true;info.textContent='Enabling alerts…';render();try{await enablePush();save('enabled');dismissed=true;}catch(e){info.textContent='Could not enable alerts: '+(e?.message||'Please try again');busy=false;allow.disabled=false;return}busy=false;render()};
later.onclick=()=>{save('off');dismissed=true;render()};
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')render()});
