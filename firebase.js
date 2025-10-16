// firebase.js
// Import Firebase SDKs (latest modular version)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";
// import { getStorage } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-storage.js"; // uncomment later if you enable storage

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBdsdG0YpBJ86DkGpV_R5fLcwXcwFDD0dc",
  authDomain: "test-23463.firebaseapp.com",
  databaseURL: "https://test-23463-default-rtdb.firebaseio.com",
  projectId: "test-23463",
  storageBucket: "test-23463.firebasestorage.app",
  messagingSenderId: "380789489263",
  appId: "1:380789489263:web:32b34f9351e3ec74b5179a",
  measurementId: "G-PFP2XDNJWM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services for use in other files
export const auth = getAuth(app);
export const db = getDatabase(app);
// export const storage = getStorage(app); // uncomment later
