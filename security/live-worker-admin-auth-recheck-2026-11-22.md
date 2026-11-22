# EarnLibr live Worker administrator authorization recheck — 2026-11-22

Source: read-only Cloudflare API GET of deployed script `earnlibr-core-api` on 2026-11-22. This document records observed implementation, not an exploit test.

## Confirmed still present
- `billingRead` for `/v1/admin/billing/unbilled` retrieves `admins/{uid}` and `users/{uid}` and derives administrative role from Firestore data.
- `payApi` for `/v1/admin/promoter-payouts/*` retrieves the same Firestore documents and derives role from those fields.
- `platformRevenueApi` for `/v1/admin/platform-revenue` retrieves both documents and checks their roles.
- `promoterOffer` for `/v1/promoters/offer-approved` checks an `admins/{uid}` document and its role.
- Firebase token verification establishes UID, but those role checks are not Firebase custom-claim authorization.

## Impact and boundaries
If a non-admin can create or edit a trusted role document, these endpoints can treat them as an admin. This is conditional; this audit did not verify deployed Firebase rules or attempt privilege escalation. Cloudflare's service-account Firestore access bypasses client Firestore security rules.

## Safe remediation sequence
1. Verify current production Firestore rules and lock down client writes to `admins/{uid}` and privileged `users/{uid}.role` without breaking signup.
2. Establish a trusted list of existing admin UIDs using an out-of-band owner review. Provision `admin: true` Firebase custom claims with privileged Firebase Admin SDK only. Never let a browser set its own claim.
3. In Worker authentication, validate the Firebase JWT signature, issuer, audience, expiration and revoked/disabled-user policy as appropriate; preserve the verified token claims. Add a shared `requireAdmin` that checks `claims.admin === true`. Reject missing claims (403); do not fall back to Firestore roles.
4. Apply that check to `billingRead`, `payApi`, `platformRevenueApi`, `promoterOffer`, and audit all remaining admin routes, including deal review and notification actions.
5. Run negative tests (regular user, anonymous customer, spoofed localStorage, role document spoofing, missing admin claim) and positive tests (trusted admin) in staging.
6. Deploy Worker with rollback and monitored 401/403 rates, then publish tested Firestore rules. Existing admin users must refresh Firebase ID tokens after claim provisioning.

## Deployment status
No Worker changes or production Firebase rules were deployed by this audit. Do not replace the live Worker with a guessed rewrite or activate the staged Firestore rules without migration tests.
