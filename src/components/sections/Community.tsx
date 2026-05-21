import { Reveal } from "../ui/Reveal";
import { GlowButton } from "../ui/GlowButton";
import { GITHUB_URL, SLOGANS } from "../../data/site";

const STATS = [
  { value: "100%", label: "Open Source" },
  { value: "3", label: "Fahrmodi" },
  { value: "10", label: "RGB-LEDs" },
  { value: "0,99 €", label: "Premium" },
];

export function Community() {
  return (
    <section id="community" className="mx-auto max-w-6xl px-5 py-24">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-[color:var(--border)] px-6 py-16 text-center sm:px-12">
          <div
            className="pointer-events-none absolute inset-0 -z-[1]"
            style={{ background: "var(--bg-grid-fade, radial-gradient(circle at 50% 0%, rgba(129,140,248,0.12), transparent 60%))" }}
          />
          <p className="section-eyebrow">Community</p>
          <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-black tracking-tight sm:text-5xl">
            {SLOGANS.future}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-2">
            Werde Teil einer offenen Community aus Maker:innen, Schüler:innen und Ingenieur:innen,
            die autonome Robotik zugänglich machen.
          </p>

          <div className="mx-auto mt-10 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="glass rounded-2xl py-5">
                <p className="text-2xl font-black text-gradient">{s.value}</p>
                <p className="mt-1 text-xs text-2">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <GlowButton href={GITHUB_URL}>
              <i className="fa-brands fa-github" /> Auf GitHub mitmachen
            </GlowButton>
            <GlowButton href="#pricing" variant="ghost">
              <i className="fa-solid fa-heart" /> Projekt unterstützen
            </GlowButton>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
