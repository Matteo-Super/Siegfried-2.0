import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import {
  auth,
  db,
  signInWithGoogle as fbSignIn,
  signOut as fbSignOut,
  ensureUserProfile,
  grantPremium,
} from "../lib/firebase";

type AuthState = {
  user: User | null;
  loading: boolean;
  premium: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  unlockPremium: () => Promise<void>;
  error: string | null;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [premium, setPremium] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);
      if (u) {
        try {
          await ensureUserProfile(u);
        } catch (e) {
          console.error("ensureUserProfile failed", e);
        }
      } else {
        setPremium(false);
      }
    });
    return unsub;
  }, []);

  // Live-subscribe to the user's premium flag.
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(
      doc(db, "users", user.uid),
      (snap) => setPremium(Boolean(snap.data()?.premium)),
      (e) => console.error("profile snapshot error", e)
    );
    return unsub;
  }, [user]);

  const signIn = useCallback(async () => {
    setError(null);
    try {
      await fbSignIn();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Sign-in failed";
      // Ignore benign popup-closed errors.
      if (!/popup-closed|cancelled-popup/i.test(msg)) setError(msg);
    }
  }, []);

  const signOut = useCallback(async () => {
    await fbSignOut();
  }, []);

  const unlockPremium = useCallback(async () => {
    if (user) await grantPremium(user.uid);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{ user, loading, premium, signIn, signOut, unlockPremium, error }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
