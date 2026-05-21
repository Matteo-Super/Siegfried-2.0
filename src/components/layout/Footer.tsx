import { GITHUB_URL, NAV_LINKS, SLOGANS } from "../../data/site";

const SOCIALS = [
  { icon: "fa-brands fa-github", href: GITHUB_URL, label: "GitHub" },
  { icon: "fa-brands fa-youtube", href: "https://youtube.com", label: "YouTube" },
  { icon: "fa-brands fa-instagram", href: "https://instagram.com", label: "Instagram" },
  { icon: "fa-brands fa-discord", href: "https://discord.com", label: "Discord" },
];

export function Footer() {
  return (
    <footer className="relative mt-20 border-t border-[color:var(--border)]">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight">
              <span className="h-2.5 w-2.5 rounded-full bg-accent shadow-glow" />
              Siegfried <span className="text-gradient">2.0</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-2">{SLOGANS.openSource}</p>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] px-3 py-1.5 text-xs text-2">
              <i className="fa-solid fa-code-branch text-signal-green" />
              MIT-lizenziert · 100% Open Source
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-3">Navigation</h4>
            <ul className="space-y-2 text-sm">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-2 transition-colors hover:text-[color:var(--text-1)]">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Open Source */}
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-3">Open Source</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="text-2 hover:text-[color:var(--text-1)]">
                  Repository
                </a>
              </li>
              <li>
                <a href={`${GITHUB_URL}/blob/master/README.md`} target="_blank" rel="noreferrer" className="text-2 hover:text-[color:var(--text-1)]">
                  Dokumentation
                </a>
              </li>
              <li>
                <a href={`${GITHUB_URL}/blob/master/docs/CONTRIBUTING.md`} target="_blank" rel="noreferrer" className="text-2 hover:text-[color:var(--text-1)]">
                  Contribution Guide
                </a>
              </li>
              <li>
                <a href={`${GITHUB_URL}/issues`} target="_blank" rel="noreferrer" className="text-2 hover:text-[color:var(--text-1)]">
                  Issues
                </a>
              </li>
            </ul>
          </div>

          {/* Contact + social */}
          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-3">Kontakt</h4>
            <a
              href="mailto:hello@siegfried.dev"
              className="text-sm text-2 transition-colors hover:text-[color:var(--text-1)]"
            >
              hello@siegfried.dev
            </a>
            <div className="mt-4 flex gap-2">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--border)] text-2 transition-all hover:-translate-y-0.5 hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
                >
                  <i className={s.icon} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-[color:var(--border)] pt-6 text-xs text-3 sm:flex-row">
          <span>© {new Date().getFullYear()} Siegfried 2.0 — Open-Source Robotik-Plattform</span>
          <span className="inline-flex items-center gap-1.5">
            Powered by
            <i className="fa-solid fa-fire text-signal-amber" />
            <span className="font-semibold text-2">Firebase</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
