// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBij6NW_NrXInsOPvNtUokteU5i7OxjwVU",
  authDomain: "earnlibr.firebaseapp.com",
  projectId: "earnlibr",
  storageBucket: "earnlibr.firebasestorage.app",
  messagingSenderId: "372090987790",
  appId: "1:372090987790:web:ad3a45523f89fa1192a35f",
  measurementId: "G-C49WNPPF29"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Exports for use in your scripts
export const auth = getAuth(app);   // Firebase Authentication
export const db = getFirestore(app); // Firestore database
