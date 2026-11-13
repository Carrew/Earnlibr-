import {auth,db} from './firebase.js';
import {onAuthStateChanged,sendSignInLinkToEmail,isSignInWithEmailLink,signInWithEmailLink,EmailAuthProvider,linkWithCredential} from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js';
import {doc,getDoc} from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js';
const deal=new URLSearchParams(location.search).get('deal');
const panel=document.getElementById('identityPanel'),status=document.getElementById('identityStatus'),email=document.getElementById('identityEmail');
const send=document.getElementById('identitySend'),verify=document.getElementById('identityFinish');
if(deal&&panel){
 const key='earnlibr-identity-email-'+deal;
 const say=t=>{status.textContent=t};
 const current=()=>new Promise(resolve=>{let stop=()=>{};stop=onAuthStateChanged(auth,u=>{stop();resolve(u)},()=>resolve(null))});
 const state=async()=>{const user=await current();const snap=await getDoc(doc(db,'chats',deal));return {user,uid:snap.data()?.participants?.clientAuthUid||snap.data()?.clientAuthUid}};
 const finish=async()=>{
  const address=(email.value||sessionStorage.getItem(key)||'').trim();
  if(!address){say('Enter the email that received your verification link.');return}
  if(!isSignInWithEmailLink(auth,location.href)){say('Open the sign-in link from your email first.');return}
  try{
   const {user,uid}=await state();
   if(user?.uid===uid&&user.isAnonymous)await linkWithCredential(user,EmailAuthProvider.credentialWithLink(address,location.href));
   else await signInWithEmailLink(auth,address,location.href);
   const after=await state();
   if(after.user?.uid!==after.uid){say('This email is not linked to this conversation. Access not granted.');return}
   sessionStorage.removeItem(key);
   history.replaceState(null,'',location.pathname+'?deal='+encodeURIComponent(deal));
   say('Email verified. You can now use this account in another browser.');
   panel.hidden=true;
  }catch(e){say('Verification failed: '+(e.code||e.message))}
 };
 send.onclick=async()=>{
  const address=email.value.trim();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)){say('Enter a valid email address.');return}
  send.disabled=true;
  try{
   const {user,uid}=await state();
   if(user?.uid===uid&&!user.isAnonymous){say('This chat already has a verified account.');return}
   await sendSignInLinkToEmail(auth,address,{url:location.origin+location.pathname+'?deal='+encodeURIComponent(deal),handleCodeInApp:true});
   sessionStorage.setItem(key,address);
   say('Sign-in link sent. If this is a new browser, use the email already linked to this chat. Open its link and verify.');
  }catch(e){say('Could not send verification link: '+(e.code||e.message))}
  finally{send.disabled=false}
 };
 verify.onclick=finish;
 try{
  const {user,uid}=await state();
  panel.hidden=!!(user?.uid===uid&&!user.isAnonymous);
  if(!panel.hidden)say(user?.uid===uid?'Link your email to open this chat securely across browsers.':'Use the email previously linked to this chat. If it has never been linked, first link it from the original browser.');
 }catch(e){say('Identity check failed: '+(e.code||e.message))}
 if(isSignInWithEmailLink(auth,location.href)){
  panel.hidden=false;
  const saved=sessionStorage.getItem(key);
  if(saved){email.value=saved;await finish()}
  else say('Enter the email that received this link, then select Verify link.');
 }
}
