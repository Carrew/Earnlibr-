import { auth } from './firebase.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js';
import { enablePush } from './push-client.js';

const heading = document.querySelector('h1');
if (heading && 'Notification' in window && 'serviceWorker' in navigator) {
  const bubble = document.createElement('button');
  bubble.type = 'button';
  bubble.setAttribute('aria-label', 'Enable notifications');
  bubble.textContent = '🔔 Enable notifications';
  bubble.style.cssText = 'position:fixed;bottom:22px;right:18px;z-index:9998;border:1px solid #a3ff6e;border-radius:999px;background:#101c2d;color:#fff;padding:12px 17px;box-shadow:0 8px 28px #0008;font:600 14px system-ui;cursor:pointer;max-width:calc(100vw - 36px)';
  bubble.hidden = true;
  document.body.appendChild(bubble);
  const key = () => 'earnlibr-push-enabled:' + (auth.currentUser?.uid || '');
  function refresh() {
    const user = auth.currentUser;
    const enabled = user && localStorage.getItem(key()) === '1' && Notification.permission === 'granted';
    bubble.hidden = !user?.emailVerified || enabled || sessionStorage.getItem('earnlibr-push-dismissed') === '1' || Notification.permission === 'denied';
  }
  onAuthStateChanged(auth, refresh);
  document.addEventListener('visibilitychange', refresh);
  bubble.addEventListener('click', async () => {
    bubble.disabled = true;
    bubble.textContent = 'Enabling notifications…';
    try {
      await enablePush();
      localStorage.setItem(key(), '1');
      sessionStorage.setItem('earnlibr-push-dismissed', '1');
      bubble.hidden = true;
    } catch (error) {
      bubble.textContent = error?.message || 'Unable to enable notifications';
      bubble.disabled = false;
      setTimeout(() => {
        bubble.textContent = '🔔 Enable notifications';
        refresh();
      }, 3500);
    }
  });
  refresh();
}
