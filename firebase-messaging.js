import { getMessaging, getToken, onMessage } 
from "https://www.gstatic.com/firebasejs/12.6.0/firebase-messaging.js";

export function initMessaging(app, saveTokenCallback) {
  const messaging = getMessaging(app);

  async function enablePush(uid) {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") return;

    const token = await getToken(messaging, {
      vapidKey: "BJj1ZxukRzkDRiHHzUK35KrhLn3tCGyr8gdgWAa6YTe34Yn7aQoi9T2o1ykcF-tzzgySVBQ52fhXqUOxpHrmVzw"
    });

    console.log("FCM Token:", token);

    if (saveTokenCallback) {
      saveTokenCallback(uid, token);
    }
  }

  onMessage(messaging, (payload) => {
    new Notification(payload.notification.title, {
      body: payload.notification.body
    });
  });

  return { enablePush };
}
