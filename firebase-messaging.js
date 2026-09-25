importScripts(
  "https://www.gstatic.com/firebasejs/12.6.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/12.6.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyBij6NW_NrXInsOPvNtUokteU5i7OxjwVU",
  authDomain: "earnlibr.firebaseapp.com",
  projectId: "earnlibr",
  storageBucket: "earnlibr.firebasestorage.app",
  messagingSenderId: "372090987790",
  appId: "1:372090987790:web:ad3a45523f89fa1192a35f"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "EarnLibr";

  self.registration.showNotification(title, {
    body: payload.notification?.body || "",
    icon: "/favicon.ico"
  });
});
