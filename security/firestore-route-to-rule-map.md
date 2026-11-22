# EarnLibr Firestore route-to-rule map (source inspection 2026-11-22)

This is a direct mapping of current browser SDK operations to the staged `security/firestore-role-scoped-draft.rules`. GitHub commits are not Firebase deployment. No emulator tests have been run.

| Frontend | Firestore path | Actual operation | Draft coverage / blocker |
| --- | --- | --- | --- |
| signup.html | users/{uid}, referralCodes/{code} | atomic batch create; referral lookup | constrained owner create; test batch getAfter and auth email |
| login.html | users/{uid} or admins/{uid} | getDoc, update lastLoginAt | owner read and timestamp-only update |
| users-account-center.html | users/{uid} or admins/{uid} | getDocFromServer, update name/phone/country/updatedAt | owner profile update, validated fields |
| providers-create-offer.html | offers_pending/{id} | addDoc | provider-scoped create; admin_notifications create remains blocked |
| providers-my-offer.html | offers_pending, providers/{uid}/offers | providerId-filtered queries | owner reads |
| promoters-get-offers.html | offers_all | status=active query | signed-in active reads; verified policy still inconsistent |
| promoters-get-offers.html | promoter_offers/{uid}/offers/{offerId} | setDoc merge | constrained create; update blocked; verified=true requirement may reject old offers |
| promoters-promotions.html | promoter_offers/{uid}/offers | getDocs | owner list |
| promoters-notifications.html, provider-notification.html | notifications/{uid}/items | onSnapshot and update read:true | owner list and read flag |
| admin-noification.html | admin_notifications | onSnapshot and update read:true | trusted admin claim required |
| provider-chat.html | chats | providerId query, typing update, lastMessage batch update | reads and typing; lastMessage update blocked |
| client-chat.html | chats/{dealId} | getDoc, typing update, lastMessage batch update | clientAuthUid participant check; lastMessage blocked |
| provider-chat.html, client-chat.html | chats/{dealId}/messages | query, seen update, text edit, soft-delete, editable lock, batch create | read, seen, edit, soft-delete, lock; new message create blocked |
| track.html | offers_all/{offerId}, users/{providerId}, users/{promoterId} | getDoc | offer read only if signed-in active; cross-user profile reads blocked |
| track.html | offers_all, promoter_offers | view/click counter updates | blocked; server-validated metrics needed |
| track.html | deals, chats, messages, admin_notifications, notifications | batched deal/chat/notification creation | blocked; backend transaction endpoint needed |
| admin pages | admins, users, deals, bills, offers_pending, offers_all, completed-deals, platform-settings, notifications | queries, approval and financial writes | claim-gated reads in draft; privileged writes blocked until backend migration |

## Remaining high-impact compatibility blockers
1. `track.html` reads other users' private `users/{uid}` documents. Do not make private user profiles publicly readable; expose a minimal public provider/promoter profile or backend projection.
2. `track.html` batches deal/chat/notification and metric writes. Migrate to a server endpoint that validates the offer, customer identity, provider, promoter, commission and replay/idempotency.
3. Chat message creation and `chats.lastMessage` update need a coherent atomic authorization design. Current draft intentionally blocks both.
4. `providers-create-offer.html` also creates `admin_notifications`; this currently fails with the draft. Move notification fan-out to trusted backend or server trigger.
5. `promoters-get-offers.html` writes merge snapshots; draft only permits initial create and requires `verified == true`. Normalize legacy offer records.
6. Admin custom claims must be provisioned securely before the draft admin() checks will work.
7. All direct admin billing, approval, payout and commission writes must be migrated or explicitly mapped.
8. Validate the complete rules syntax and positive/negative scenarios in the Firebase Emulator. Confirm the deployed Firebase rules separately.

## Query rule caveat
Firestore security rules are not filters: queries must imply the rule predicates. Client code that filters only after downloading documents is not safe.
