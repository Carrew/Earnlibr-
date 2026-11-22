# EarnLibr deployed Cloudflare Worker admin authorization audit — 2026-11-22

Source: Cloudflare connected account, downloaded deployed earnlibr-core-api Worker script (read-only). No Worker changes deployed.

## Confirmed
- Firebase ID tokens are verified cryptographically in user() with project audience, issuer, expiry, signature and email verification checks. The helper returns the UID, not verified admin privileges.
- billingRead /v1/admin/billing/unbilled checks admins/{uid} or users/{uid} role; existence of an admins document is sufficient in one branch.
- payApi /v1/admin/promoter-payouts/pending and /decide checks admins/{uid} or users/{uid} role; existence of an admins document is sufficient in one branch.
- platformRevenueApi /v1/admin/platform-revenue checks admins/{uid} or users/{uid} role; existence of an admins document is sufficient in one branch.
- promoterOffer /v1/promoters/offer-approved requires an admins/{uid} document with role admin/super_admin.
- dealComplete and dealCancel delegate to dealInput; authorization logic in dealInput/dealAuth requires separate field-level review before changes.
- Worker uses service-account Firestore REST access; this bypasses Firestore client security rules.

## Severity and preconditions
- Critical conditional trust boundary: if users can write users/{uid}.role or create admins/{uid}, they can potentially satisfy backend admin checks. Reported live open rules make this urgent.
- No actual exploit attempt or unauthenticated mutation was performed during this review.

## Remediation sequence
1. Preserve legitimate administrator identities and record a trusted server-side allowlist or provision custom claims using a privileged one-time process.
2. Block all client writes to admins documents and client role elevation in users documents in production rules.
3. Change all Worker admin checks to a single trusted authorization function; do not accept user-controlled role fields or document existence as sufficient.
4. Add negative tests for normal users, cross-account users, spoofed localStorage, and missing/revoked admin claims.
5. Migrate browser-side admin writes (offer approvals, billing, commission settings, notification fan-out, reviews) to authenticated backend endpoints before enforcing restrictive Firestore rules.
6. Verify existing signup/login, provider and promoter flows in emulator/staging; deploy with rollback and monitor errors.

## Status
GitHub admin signup pages disabled in previous commits; live Firestore rules remain open according to user. No production Worker or Firebase rule changes in this audit.