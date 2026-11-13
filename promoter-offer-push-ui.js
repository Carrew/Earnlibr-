import { auth } from './firebase.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js';
import { enablePush, disablePush } from './push-client.js';

const host = document.getElementById('promoter-push-settings');
if (host) {
  host.innerHTML = '<h3 style="margin:0 0 8px">🔔 New offer alerts</h3><p style="margin:0 0 12px;color:#cbd5e1">Get browser alerts when new offers become available. You can turn them off here anytime.</p><button type="button" id="promoter-push-toggle" style="padding:11px 15px;border:0;border-radius:9px;background:#a3ff6e;color:#071028;font-weight:700;cursor:pointer">Enable alerts</button><p id="promoter-push-status" role="status" aria-live="polite" style="font-size:13px;margin:10px 0 0;color:#cbd5e1"></p>';
  const btn = host.querySelector('#promoter-push-toggle');
  const status = host.querySelector('#promoter-push-status');
  let uid = null;
  const key = id => 'earnlibr:promoter-offer-push:' + id;
  const supported = () => 'Notification' in window && 'serviceWorker' in navigator;
  function refresh() {
    const enabled = !!uid && localStorage.getItem(key(uid)) === 'on' && supported() && Notification.permission === 'granted';
    btn.textContent = enabled ? 'Turn off alerts on this browser' : 'Enable alerts';
    btn.style.background = enabled ? '#24344d' : '#a3ff6e';
    btn.style.color = enabled ? '#fff' : '#071028';
    btn.disabled = !uid || !supported();
    if (!supported()) status.textContent = 'Browser notifications are unavailable here. Open EarnLibr in a supported browser.';
    else if (Notification.permission === 'denied') status.textContent = 'Notifications are blocked in browser settings.';
    else if (enabled) status.textContent = 'Alerts enabled on this browser.';
    else status.textContent = 'Alerts are off on this browser.';
  }
  onAuthStateChanged(auth, user => { uid = user?.emailVerified ? user.uid : null; refresh(); });
  btn.addEventListener('click', async () => {
    if (!uid) return;
    const currentUid = uid;
    const enabled = localStorage.getItem(key(currentUid)) === 'on' && Notification.permission === 'granted';
    btn.disabled = true;
    status.textContent = enabled ? 'Turning off…' : 'Enabling…';
    try {
      if (enabled) {
        await disablePush();
        localStorage.setItem(key(currentUid), 'off');
      } else {
        await enablePush();
        localStorage.setItem(key(currentUid), 'on');
      }
    } catch (error) {
      status.textContent = error?.message || 'Unable to update alerts.';
    } finally {
      refresh();
    }
  });
}
