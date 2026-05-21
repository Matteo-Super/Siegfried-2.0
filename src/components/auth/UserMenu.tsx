import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { GlowButton } from "../ui/GlowButton";

// Renders the "Sign in with Google" button when signed out, or an avatar +
// dropdown (with premium badge + sign out) when signed in.
export function UserMenu() {
  const { user, premium, signIn, signOut, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (loading) {
    return <div className="h-9 w-9 animate-pulse rounded-full bg-white/10" />;
  }

  if (!user) {
    return (
      <GlowButton variant="google" onClick={signIn} className="!px-4 !py-2 !text-sm">
        <i className="fa-brands fa-google" />
        <span className="hidden sm:inline">Sign in</span>
      </GlowButton>
    );
  }

  const initial = (user.displayName || user.email || "?").charAt(0).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-[color:var(--border)] p-1 pr-3 transition-colors hover:border-[color:var(--accent)]"
      >
        {user.photoURL ? (
          <img src={user.photoURL} alt="" className="h-7 w-7 rounded-full" referrerPolicy="no-referrer" />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-deep text-xs font-bold text-white">
            {initial}
          </span>
        )}
        <span className="hidden text-xs font-semibold md:inline">
          {user.displayName?.split(" ")[0] || "Account"}
        </span>
        {premium && <i className="fa-solid fa-crown text-[10px] text-signal-amber" />}
      </button>

      {open && (
        <div className="glass absolute right-0 mt-2 w-56 origin-top-right p-2 text-sm">
          <div className="px-3 py-2">
            <p className="truncate font-semibold">{user.displayName}</p>
            <p className="truncate text-xs text-2">{user.email}</p>
          </div>
          <div className="my-1 h-px bg-[color:var(--border)]" />
          <div className="px-3 py-1.5 text-xs">
            Status:{" "}
            {premium ? (
              <span className="font-bold text-signal-amber">
                <i className="fa-solid fa-crown" /> Premium
              </span>
            ) : (
              <span className="text-2">Free</span>
            )}
          </div>
          <button
            onClick={() => {
              setOpen(false);
              void signOut();
            }}
            className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/5"
          >
            <i className="fa-solid fa-right-from-bracket text-xs" /> Abmelden
          </button>
        </div>
      )}
    </div>
  );
}
