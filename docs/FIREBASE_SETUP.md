# Firebase Setup

The app is wired to the Firebase project **`siegfried-app`** and ships with its
public web config baked in (`src/lib/firebase.ts`). Auth + Firestore run on the
**free Spark plan** — no billing/Blaze upgrade required.

Two one-time **Firebase Console** steps are needed to make sign-in + premium work.
(They can't be done from the CLI without `gcloud`.)

---

## 1. Enable Google Sign-In

1. Open the [Authentication → Sign-in method](https://console.firebase.google.com/project/siegfried-app/authentication/providers) page.
2. Click **Google** → toggle **Enable** → pick a support email → **Save**.
3. Under **Authentication → Settings → Authorized domains**, confirm these are
   listed (added automatically for Hosting):
   - `siegfried-app.web.app`
   - `siegfried-app.firebaseapp.com`
   - `localhost` (for local dev)
   - any custom domain you add.

## 2. Create the Firestore database

1. Open [Firestore Database](https://console.firebase.google.com/project/siegfried-app/firestore).
2. Click **Create database** → **Production mode** → location **`eur3`** (Europe).
3. Once created, deploy the security rules from this repo:

   ```bash
   firebase deploy --only firestore:rules
   ```

   The rules (`firestore.rules`) let each signed-in user read/write **only their
   own** `users/{uid}` document.

---

## How auth + premium work

- On login, `ensureUserProfile()` upserts `users/{uid}` with `{ premium: false }`.
- `AuthContext` live-subscribes to that doc; the UI reacts to `premium`.
- After a successful Stripe redirect (`?purchase=success`), `grantPremium()` sets
  `premium: true` on the user's own doc (client-side write, allowed by the rules).

> **Note on hardening:** the client-side unlock is intentional for a €0.99
> product without a backend. For fraud-proof entitlement, set `premium` from a
> Cloud Function triggered by a Stripe webhook and lock the field in
> `firestore.rules`. That requires the **Blaze** plan. See `docs/STRIPE_SETUP.md`.

## Verifying

```bash
npm run dev
# Click "Sign in" → Google popup → choose account.
# Check Firestore console: a users/{uid} doc should appear.
```
