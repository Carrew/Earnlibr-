# EarnLibr Firestore browser access inventory (2026-11-21)

Status: preliminary source-code inventory. Not a complete proof of all routes. Based on 26 inspected files on GitHub main. Firestore rules in security/firestore.rules are STAGED ONLY; do not deploy without migration and emulator tests.

| File | Direct Firestore paths | Operations seen |
|---|---|---|
| signup.html | referralCodes, users | getDoc, writeBatch |
| admins-signup.html | admins | setDoc (CRITICAL: public admin creation flow) |
| login.html | users, admins | getDoc, updateDoc |
| users-account-center.html | users, admins | updateDoc |
| admins-users.html | admins, users | getDoc, getDocs, updateDoc |
| admin-commission-settings.html | platform-settings, users, notifications/{uid}/items | getDoc, getDocs, addDoc, setDoc |
| admin-deals-management.html | users, admins, deals, notifications/{uid}/items | getDoc, getDocs, writeBatch |
| admin-providers-bill.html | admins, bills, offers_all, providers/*, completed-deals, notifications/* | getDoc, runTransaction, writeBatch |
| admin-providers-payments-verify.html | admins, bills, completed-deals, providers/{providerId}/bills/{billId}, notifications/{uid}/items | getDoc, onSnapshot, writeBatch |
| admin-verify-offers.html | admins, providers, offers_pending, offers_all, providers/{providerId}/offers/{offerId}, notifications/* | getDoc, getDocs, runTransaction, writeBatch, setDoc, deleteDoc |
| admin-approve-promoters-payout.html | admins, notifications/{uid}/items | getDoc, writeBatch |
| admin-noification.html | admins, admin_notifications | getDoc, onSnapshot, updateDoc |
| admin-review.html | chats, deals, users, admins | getDoc, getDocs, updateDoc |
| Platform-Revenue.html | admins, users | getDoc |
| providers-create-offer.html | offers_pending, admin_notifications | addDoc |
| providers-my-offer.html | offers_pending, providers/{uid}/offers | getDocs |
| providers-deals-management.html | deals, users, admins, notifications/{uid}/items | getDoc, getDocs, writeBatch |
| providers-bills.html | none detected in simple direct-call scan | none detected |
| provider-chat.html | deals, chats, notifications/{uid}/items | getDoc, getDocs, onSnapshot, updateDoc, writeBatch |
| client-chat.html | chats | getDoc, getDocs, onSnapshot, updateDoc, writeBatch |
| promoters-wallet.html | users | getDoc |
| promoters-get-offers.html | promoter_offers/{uid}/offers, offers_all, users, admins | getDoc, getDocs, setDoc |
| promoters-promotions.html | promoter_offers/{uid}/offers | getDocs |
| promoters-notifications.html | users, notifications/{uid}/items | getDoc, onSnapshot, updateDoc |
| provider-notification.html | users, notifications/{uid}/items | getDoc, onSnapshot, updateDoc |
| track.html | offers_all, promoter_offers, deals, users, chats, admin_notifications, notifications | getDoc, getDocs, updateDoc, setDoc, writeBatch |

## Required before deployment

1. Enumerate entire repository tree and all Worker endpoints, including imported modules and dynamically generated paths. This inventory may omit files not returned by code search.
2. Capture exact collection/document field schemas and auth state for each call, and map each operation to verified Firebase UID/claims and ownership checks.
3. Remove browser self-provisioning of admins; migrate admin creation to trusted backend. Audit existing admin documents and provision trusted admin custom claims securely.
4. Migrate sensitive financial, deal, offer approval, referral, and notification writes to authenticated Cloudflare endpoints.
5. Define narrow Firestore rules for legitimate direct reads/writes, with query constraints where necessary. Do not use user-controlled role fields as proof of admin status.
6. Test anonymous, promoter, provider, admin and cross-account scenarios in Firestore emulator, including query behavior and batch/transaction atomicity.
7. Deploy via staged rollout with monitored errors and rollback. The existing production database is currently exposed if open read/write rules remain deployed.

## Caution

A Firebase client config is not a secret. Firebase Admin SDK/server SDK bypasses Firestore Security Rules and needs independent authorization checks. GitHub rules files do not deploy themselves.
