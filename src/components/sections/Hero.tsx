import { motion } from "framer-motion";
import { GlowButton } from "../ui/GlowButton";
import { SmartImage } from "../ui/SmartImage";
import { photo, CURATED, SLOGANS } from "../../data/site";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};

export function Hero() {
  const heroPhoto = photo(CURATED.hero);

  return (
    <section id="top" className="relative min-h-screen overflow-hidden pt-28">
      {/* Cinematic background photo */}
      <div className="absolute inset-0 -z-[1]">
        {heroPhoto && (
          <SmartImage
            photo={heroPhoto}
            size="full"
            alt="Siegfried 2.0 mit RGB-Beleuchtung"
            kenburns
            priority
            className="h-full w-full"
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, var(--bg) 0%, color-mix(in srgb, var(--bg) 78%, transparent) 45%, transparent 100%), linear-gradient(to top, var(--bg) 4%, transparent 50%)",
          }}
        />
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-20 pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:pt-20">
        <motion.div variants={stagger} initial="hidden" animate="visible">
          <motion.p variants={item} className="section-eyebrow">
            Open Source · Autonome Robotik
          </motion.p>
          <motion.h1
            variants={item}
            className="mt-4 text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
          >
            <span className="text-gradient">Faster.</span> Better.
            <br />
            Siegfried <span className="text-gradient">2.0</span>.
          </motion.h1>
          <motion.p variants={item} className="mt-6 max-w-md text-lg leading-relaxed text-2">
            {SLOGANS.sim} Eine modulare Arduino-Plattform, die Sensorik, Antrieb und
            intelligente Ausweichlogik in einem eleganten Bausatz vereint.
          </motion.p>
          <motion.div variants={item} className="mt-9 flex flex-wrap gap-3">
            <GlowButton href="#pricing">
              <i className="fa-solid fa-bolt" /> Premium freischalten · 0,99 €
            </GlowButton>
            <GlowButton href="#simulator" variant="ghost">
              <i className="fa-solid fa-cube" /> 3D-Simulator starten
            </GlowButton>
          </motion.div>

          <motion.div variants={item} className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-2">
            <span className="inline-flex items-center gap-2">
              <i className="fa-solid fa-microchip text-accent" /> Arduino-kompatibel
            </span>
            <span className="inline-flex items-center gap-2">
              <i className="fa-solid fa-rainbow text-accent" /> WS2812 RGB
            </span>
            <span className="inline-flex items-center gap-2">
              <i className="fa-solid fa-code-branch text-accent" /> MIT-lizenziert
            </span>
          </motion.div>
        </motion.div>

        {/* Floating glass product frame */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative hidden lg:block"
        >
          <div className="glass overflow-hidden rounded-3xl p-2">
            <SmartImage
              photo={photo(CURATED.showcase[0])}
              size="full"
              alt="Siegfried 2.0 Detailansicht"
              className="aspect-[4/3] w-full rounded-2xl"
            />
          </div>
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="glass absolute -bottom-6 -left-6 flex items-center gap-3 rounded-2xl px-4 py-3"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-signal-green/15 text-signal-green">
              <i className="fa-solid fa-satellite-dish" />
            </span>
            <div className="text-left">
              <p className="text-xs text-3">Sensor</p>
              <p className="text-sm font-bold">Echtzeit-Scan</p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-3">
        <motion.i
          className="fa-solid fa-chevron-down"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        />
      </div>
    </section>
  );
}
