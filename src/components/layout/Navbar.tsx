import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NAV_LINKS, GITHUB_URL } from "../../data/site";
import { useTheme } from "../../hooks/useTheme";
import { UserMenu } from "../auth/UserMenu";

export function Navbar() {
  const { theme, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scrollspy: highlight the nav link of the section currently in view.
  useEffect(() => {
    const ids = NAV_LINKS.map((l) => l.href.slice(1));
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "var(--nav-bg)" : "transparent",
        backdropFilter: scrolled ? "blur(16px) saturate(150%)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(16px) saturate(150%)" : "none",
        borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <a href="#top" className="group flex items-center gap-2.5 font-extrabold tracking-tight">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-accent" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent shadow-glow" />
          </span>
          <span>Siegfried <span className="text-gradient">2.0</span></span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((l) => {
            const isActive = active === l.href.slice(1);
            return (
              <a
                key={l.href}
                href={l.href}
                className={`relative text-sm font-medium transition-colors ${
                  isActive ? "text-[color:var(--text-1)]" : "text-2 hover:text-[color:var(--text-1)]"
                }`}
              >
                {l.label}
                {isActive && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute -bottom-1.5 left-0 right-0 mx-auto h-1 w-1 rounded-full bg-accent shadow-glow"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
            );
          })}
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="hidden h-9 w-9 items-center justify-center rounded-full border border-[color:var(--border)] text-2 transition-colors hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] sm:flex"
          >
            <i className="fa-brands fa-github" />
          </a>
          <button
            onClick={toggle}
            aria-label="Theme umschalten"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--border)] text-2 transition-colors hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
          >
            <i className={theme === "light" ? "fa-solid fa-sun" : "fa-solid fa-moon"} />
          </button>
          <UserMenu />
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menü"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--border)] text-2 md:hidden"
          >
            <i className={menuOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars"} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-[color:var(--border)] md:hidden"
            style={{ background: "var(--nav-bg)", backdropFilter: "blur(16px)" }}
          >
            <div className="flex flex-col gap-1 px-5 py-4">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-2 transition-colors hover:bg-white/5 hover:text-[color:var(--text-1)]"
                >
                  {l.label}
                </a>
              ))}
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-2 hover:bg-white/5"
              >
                <i className="fa-brands fa-github mr-2" /> GitHub
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
