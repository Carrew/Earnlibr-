# EarnLibr Admin Firestore and API audit — 2026-11-22

Source: direct GitHub file inspection, main branch. This is a preliminary source-level map, not an emulator-tested ruleset.

## Admin registration
- admins-signup.html: Firebase createUserWithEmailAndPassword + setDoc admins/{uid} was present. Page replaced with registration-closed notice.
- super-admin.html: Firebase account creation was present. Page replaced with registration-closed notice.
- Staged security/firestore.rules already denies client create/update/delete for admins/{uid}. Not deployed to Firebase.

## Page | Firestore access | Worker/external routes
| Page | Firestore access | Other calls |
|---|---|---|
| admin-dashboard.html | No direct SDK calls; localStorage role check | None observed |
| admins-users.html | admins, users: getDoc/getDocs/updateDoc | None observed |
| admin-deals-management.html | users, admins, deals; notifications/{uid}/items batch writes | POST /v1/deals/complete, /v1/deals/cancel with bearer ID token |
| admin-review.html | chats, deals, users, admins: getDoc/getDocs/updateDoc | None observed |
| admin-verify-offers.html | providers, admins, offers_pending, offers_all, providers/{uid}/offers, notifications; getDoc/getDocs/runTransaction/writeBatch/setDoc/deleteDoc | POST /v1/promoters/offer-approved; Cloudinary upload |
| admin-providers-bill.html | admins, bills, offers_all, providers, completed-deals, notifications; getDoc/runTransaction/writeBatch | GET /v1/admin/billing/unbilled |
| admin-providers-payments-verify.html | admins, bills, completed-deals, providers/{uid}/bills/{billId}, notifications; getDoc/onSnapshot/writeBatch | None observed |
| admin-approve-promoters-payout.html | admins, notifications; getDoc/writeBatch | GET /v1/admin/promoter-payouts/pending, POST /v1/admin/promoter-payouts/decide |
| admin-commission-settings.html | platform-settings, users, notifications; getDoc/getDocs/addDoc/setDoc | None observed |
| admin-noification.html | admins, admin_notifications; getDoc/onSnapshot/updateDoc | None observed |
| Platform-Revenue.html | admins, users: getDoc | None observed in quick scan |
| login.html | users, admins: getDoc/updateDoc (lastLoginAt) | None observed |

## Rules migration guidance
- Only trusted server-side provisioning may assign admin status; never user-editable role or localStorage.
- Firestore list rules must authorize getDocs/onSnapshot queries, not just get.
- Allow legitimate admin reads only after trusted verification; migrate finance, approvals, notifications and admin edits to backend.
- Admin SDK bypasses Firestore rules, so Workers must independently verify Firebase token and admin authorization.
- Admin document self-updates such as login timestamps need server-side handling or narrowly scoped rules; current staged rules would block them.
- No production deployment until emulator tests cover admin/non-admin/anonymous/cross-account and critical signup/provider/promoter flows.

## Current status
Public admin signup pages changed in GitHub. Live Firestore rules not changed; production risk persists while rules remain open.