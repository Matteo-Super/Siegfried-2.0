import type { ReactNode } from "react";
import { useAuth } from "../../context/AuthContext";
import { GlowButton } from "../ui/GlowButton";

type Props = {
  children: ReactNode;
  /** Short label describing what's locked. */
  title?: string;
};

// Reveals children only when the signed-in user has premium. Otherwise shows a
// locked overlay with the appropriate CTA (sign in / unlock).
export function PremiumGate({ children, title = "Premium-Inhalt" }: Props) {
  const { user, premium, signIn } = useAuth();

  if (premium) return <>{children}</>;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[color:var(--border)] p-8 text-center">
      <div aria-hidden className="pointer-events-none select-none opacity-30 blur-sm">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[color:var(--bg)]/40 backdrop-blur-sm">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-signal-amber/30 bg-signal-amber/10 text-signal-amber">
          <i className="fa-solid fa-lock" />
        </span>
        <p className="font-bold">{title}</p>
        <p className="max-w-xs text-sm text-2">
          Schalte mit Premium (0,99 €) erweiterte Inhalte und Downloads frei.
        </p>
        {user ? (
          <GlowButton href="#pricing">
            <i className="fa-solid fa-bolt" /> Jetzt freischalten
          </GlowButton>
        ) : (
          <GlowButton variant="google" onClick={signIn}>
            <i className="fa-brands fa-google" /> Anmelden zum Freischalten
          </GlowButton>
        )}
      </div>
    </div>
  );
}
