import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  type User,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

// Firebase web config. These keys are public client-side identifiers (safe to
// ship in the bundle). Values can be overridden via VITE_FIREBASE_* env vars.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "AIzaSyAGF0sly5aW3uMM4YW73pOIAtVnWrirOzE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "siegfried-app.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "siegfried-app",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "siegfried-app.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "703956661848",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ?? "1:703956661848:web:27f154710b40d5780e7c2d",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export function signOut() {
  return fbSignOut(auth);
}

export type UserProfile = {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  premium: boolean;
};

// Create the user's Firestore profile on first login (idempotent).
export async function ensureUserProfile(user: User): Promise<UserProfile> {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const profile = {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      premium: false,
      createdAt: serverTimestamp(),
    };
    await setDoc(ref, profile);
    return { ...profile, premium: false } as UserProfile;
  }
  const data = snap.data();
  return {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
    premium: Boolean(data.premium),
  };
}

// Lightweight premium unlock used after a successful Stripe redirect.
// NOTE: client-side write secured to the user's own doc. This is intentional
// for a €0.99 product without a backend. Harden later with Cloud Functions +
// Stripe webhook (requires the Blaze plan). See docs/STRIPE_SETUP.md.
export async function grantPremium(uid: string) {
  await setDoc(
    doc(db, "users", uid),
    { premium: true, premiumGrantedAt: serverTimestamp() },
    { merge: true }
  );
}
