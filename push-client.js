import { getMessaging, getToken, isSupported } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-messaging.js';
import { getIdToken } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js';
import { app, auth } from './firebase.js';
const API = 'https://earnlibr-core-api.www-sandicarrew.workers.dev';
const VAPID = 'BJj1ZxukRzkDRiHHzUK35KrhLn3tCGyr8gdgWAa6YTe34Yn7aQoi9T2o1ykcF-tzzgySVBQ52fhXqUOxpHrmVzw';
async function check() {
  if (!auth.currentUser || (!auth.currentUser.emailVerified && !auth.currentUser.isAnonymous)) throw new Error('Sign in to enable notifications.');
  if (!('Notification' in window) || !('serviceWorker' in navigator) || !(await isSupported())) throw new Error('Browser push is unsupported.');
}
async function registration() {
  return navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' });
}
async function request(method, token) {
  const idToken = await getIdToken(auth.currentUser);
  const response = await fetch(API + '/v1/push/devices', {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + idToken },
    body: JSON.stringify({ token })
  });
  if (!response.ok) throw new Error('Notification device request failed: HTTP ' + response.status);
}
export async function enablePush() {
  await check();
  if (Notification.permission !== 'granted' && await Notification.requestPermission() !== 'granted') throw new Error('Permission not granted.');
  const sw = await registration();
  const token = await getToken(getMessaging(app), { vapidKey: VAPID, serviceWorkerRegistration: sw });
  if (!token) throw new Error('No device token returned.');
  await request('POST', token);
}
export async function disablePush() {
  await check();
  if (Notification.permission !== 'granted') return;
  const sw = await registration();
  const token = await getToken(getMessaging(app), { vapidKey: VAPID, serviceWorkerRegistration: sw });
  if (token) await request('DELETE', token);
}
