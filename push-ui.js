import { auth } from './firebase.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js';
import { enablePush, disablePush } from './push-client.js';

const heading = document.querySelector('h1');
if (heading) {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'margin:0 0 18px;display:flex;gap:10px;flex-wrap:wrap;align-items:center';
  
  const enable = document.createElement('button');
  enable.type = 'button';
  enable.textContent = 'Enable browser notifications';
  enable.style.cssText = 'background:#a3ff6e;color:#071028;border:0;padding:11px 16px;border-radius:9px;font-weight:700;cursor:pointer';
  
  const disable = document.createElement('button');
  disable.type = 'button';
  disable.textContent = 'Turn off on this browser';
  disable.style.cssText = 'background:#202f46;color:white;border:0;padding:11px 16px;border-radius:9px;cursor:pointer';
  
  const status = document.createElement('span');
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  
  wrapper.append(enable, disable, status);
  heading.insertAdjacentElement('afterend', wrapper);

  onAuthStateChanged(auth, user => { 
    enable.disabled = disable.disabled = !user?.emailVerified; 
  });

  enable.addEventListener('click', async () => {
    enable.disabled = true; 
    status.textContent = 'Enabling…';
    try { 
      await enablePush(); 
      status.textContent = 'Notifications enabled on this browser.'; 
    } catch (e) { 
      status.textContent = e.message || 'Unable to enable notifications.'; 
    } finally { 
      enable.disabled = !auth.currentUser?.emailVerified; 
    }
  });

  disable.addEventListener('click', async () => {
    disable.disabled = true; 
    status.textContent = 'Disabling…';
    try { 
      await disablePush(); 
      status.textContent = 'This browser has been unsubscribed.'; 
    } catch (e) { 
      status.textContent = e.message || 'Unable to unsubscribe.'; 
    } finally { 
      disable.disabled = !auth.currentUser?.emailVerified; 
    }
  });
}
