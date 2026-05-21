// Stripe integration via Payment Links — fully serverless, no Cloud Functions,
// no Firebase Blaze upgrade required.
//
// Each link is a Stripe-hosted Checkout URL created in the Stripe Dashboard (or
// via the Stripe MCP). Configure them with VITE_STRIPE_* env vars; see
// docs/STRIPE_SETUP.md. Until configured, links fall back to "" and the UI
// shows a "coming soon" state instead of navigating.

import { TIP_PRESETS } from "../data/site";

// Fixed €0.99 product (premium unlock).
export const PRODUCT_LINK = import.meta.env.VITE_STRIPE_PRODUCT_LINK ?? "";

// Pay-what-you-want donation link (customer chooses amount in Stripe Checkout).
export const TIP_CUSTOM_LINK = import.meta.env.VITE_STRIPE_TIP_CUSTOM_LINK ?? "";

// Optional preset-amount tip links keyed by euro amount. If a preset has no
// dedicated link, we fall back to the custom (pay-what-you-want) link.
const PRESET_LINKS: Record<number, string> = {
  1: import.meta.env.VITE_STRIPE_TIP_1 ?? "",
  3: import.meta.env.VITE_STRIPE_TIP_3 ?? "",
  5: import.meta.env.VITE_STRIPE_TIP_5 ?? "",
  10: import.meta.env.VITE_STRIPE_TIP_10 ?? "",
};

export function tipLink(amount: number): string {
  return PRESET_LINKS[amount] || TIP_CUSTOM_LINK;
}

export const TIP_AMOUNTS = TIP_PRESETS;

// Append the Firebase UID as client_reference_id so the payment can be traced
// back to the account (used by an optional future webhook to grant premium
// server-side). success_url returns to the site with ?purchase=success.
export function withCheckoutParams(link: string, uid?: string | null): string {
  if (!link) return "";
  try {
    const url = new URL(link);
    if (uid) url.searchParams.set("client_reference_id", uid);
    return url.toString();
  } catch {
    return link;
  }
}

export function openCheckout(link: string, uid?: string | null) {
  const url = withCheckoutParams(link, uid);
  if (!url) return false;
  window.location.href = url;
  return true;
}
