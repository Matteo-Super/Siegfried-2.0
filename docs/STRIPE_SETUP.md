# Stripe Setup

Payments use **Stripe Payment Links** — Stripe-hosted checkout URLs. This is
fully **serverless**: no Cloud Functions, no Firebase Blaze upgrade, no secret
keys in the app. The frontend just opens the links.

## What's already created

On the connected Stripe account, the €0.99 product + price already exist:

| Resource | ID |
|----------|-----|
| Product  | `prod_UYfOEw5RXDf6Xd` — "Siegfried 2.0 Premium" |
| Price     | `price_1TZY46HTCZyjNfhI1tqg5dpt` — €0.99 one-time |

> ⚠️ These are in **live mode**. Before any Payment Link can be created, the
> Stripe account needs a **business name** + completed onboarding (Stripe
> requires this for live Payment Links).

## 1. Complete account onboarding

In the [Stripe Dashboard](https://dashboard.stripe.com/settings/account), set a
**business/public name** and finish the activation steps so live charges are
enabled.

## 2. Create the Payment Links

In **Dashboard → Payment Links → New**:

### a) Premium (€0.99)
- Product: select the existing **Siegfried 2.0 Premium** (`price_1TZY46HTCZyjNfhI1tqg5dpt`).
- After payment → **Redirect to your website** →
  `https://siegfried-app.web.app/?purchase=success`
- Copy the link URL.

### b) Tip / donation (pay-what-you-want)
- New link → **+ Add a custom amount** product (currency EUR, customer chooses amount).
- (Optional) Create fixed-amount links for €1 / €3 / €5 / €10.
- Same success redirect as above is fine.
- Copy the link URL(s).

## 3. Wire the links into the app

Copy `.env.example` → `.env` and paste your link URLs:

```ini
VITE_STRIPE_PRODUCT_LINK=https://buy.stripe.com/xxxxxxxx       # the €0.99 link
VITE_STRIPE_TIP_CUSTOM_LINK=https://buy.stripe.com/yyyyyyyy    # pay-what-you-want
# Optional fixed-amount tips (fall back to custom link if blank):
VITE_STRIPE_TIP_1=
VITE_STRIPE_TIP_3=
VITE_STRIPE_TIP_5=
VITE_STRIPE_TIP_10=
```

Rebuild/redeploy. Until configured, the pricing buttons show a friendly
"link not configured yet" notice instead of navigating.

## How the flow works

1. User clicks **Mit Karte bezahlen · 0,99 €** (must be signed in).
2. The app appends `client_reference_id=<firebaseUid>` and opens the Stripe link.
3. Stripe handles the card payment, then redirects to `…/?purchase=success`.
4. `App.tsx` detects the param and calls `grantPremium(uid)` → `users/{uid}.premium = true`.
5. Premium content (advanced simulator scenarios, downloads) unlocks instantly.

## Hardening (optional, requires Blaze)

The client-side unlock is fine for a €0.99 product but is spoofable. To make it
fraud-proof: deploy a Cloud Function webhook for `checkout.session.completed`,
verify the event, and set `premium` server-side (using `client_reference_id` to
find the user). Then lock the `premium` field in `firestore.rules`. Cloud
Functions require the **Blaze** (pay-as-you-go) plan.
