// logout.js
import { auth } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

export async function logoutUser() {
  try {
    // Clear local session
    localStorage.removeItem("earnlibrUser");

    // Sign out from Firebase (optional but safe)
    await signOut(auth);

    // Redirect to login
    window.location.href = "login.html";
  } catch (error) {
    console.error("Logout error:", error);
    // Still redirect even if Firebase fails to respond
    window.location.href = "login.html";
  }
}
