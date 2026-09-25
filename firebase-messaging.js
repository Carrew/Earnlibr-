import {
  getMessaging,
  getToken,
  onMessage
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-messaging.js";

export function initMessaging(app, saveTokenCallback) {
  const messaging = getMessaging(app);

  async function enablePush(uid) {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("Notification permission not granted.");
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );

      const token = await getToken(messaging, {
        vapidKey:
          "BJj1ZxukRzkDRiHHzUK35KrhLn3tCGyr8gdgWAa6YTe34Yn7aQoi9T2o1ykcF-tzzgySVBQ52fhXqUOxpHrmVzw",
        serviceWorkerRegistration: registration
      });

      console.log("FCM Token:", token);

      if (saveTokenCallback && uid && token) {
        await saveTokenCallback(uid, token);
      }

      return token;
    } catch (error) {
      console.error("Push notification setup failed:", error);
      return null;
    }
  }

  onMessage(messaging, (payload) => {
    console.log("Foreground notification:", payload);

    if (payload.notification) {
      new Notification(payload.notification.title, {
        body: payload.notification.body || ""
      });
    }
  });

  return { enablePush };
}
