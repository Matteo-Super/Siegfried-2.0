/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
  readonly VITE_STRIPE_PRODUCT_LINK?: string;
  readonly VITE_STRIPE_TIP_CUSTOM_LINK?: string;
  readonly VITE_STRIPE_TIP_1?: string;
  readonly VITE_STRIPE_TIP_3?: string;
  readonly VITE_STRIPE_TIP_5?: string;
  readonly VITE_STRIPE_TIP_10?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
