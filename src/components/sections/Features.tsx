import { Reveal } from "../ui/Reveal";
import { GlassCard } from "../ui/GlassCard";
import { SectionHeader } from "../ui/SectionHeader";
import { FEATURES } from "../../data/site";

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-5 py-24">
      <SectionHeader
        eyebrow="Hardware"
        title={<>Was Siegfried <span className="text-gradient">besonders</span> macht</>}
        sub="Sensorik, Antrieb und Intelligenz — präzise abgestimmt in einem offenen Bausatz."
      />

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <Reveal key={f.title} delay={(i % 3) * 0.08}>
            <GlassCard tilt className="h-full p-7">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/15 bg-accent/10 text-lg text-accent">
                <i className={f.icon} />
              </div>
              <h3 className="mt-5 text-lg font-bold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-2">{f.desc}</p>
            </GlassCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
