import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "../ui/Reveal";
import { SmartImage } from "../ui/SmartImage";
import { SectionHeader } from "../ui/SectionHeader";
import { photo, CURATED, SLOGANS, type Photo } from "../../data/site";

export function MediaShowcase() {
  const [lightbox, setLightbox] = useState<Photo | null>(null);
  const feature = photo(CURATED.showcase[1]);
  const gallery = CURATED.gallery.map((i) => photo(i)).filter(Boolean) as Photo[];

  return (
    <section id="showcase" className="mx-auto max-w-6xl px-5 py-24">
      <SectionHeader
        eyebrow="Galerie"
        title={<>Siegfried 2.0 in <span className="text-gradient">Bewegung</span></>}
        sub="Originalaufnahmen der Hardware — Sensorik, Antrieb und die adressierbare RGB-Beleuchtung."
      />

      {/* Cinematic full-bleed feature panel */}
      <Reveal>
        <div className="relative mt-14 overflow-hidden rounded-3xl border border-[color:var(--border)]">
          <SmartImage
            photo={feature}
            size="full"
            alt="Siegfried 2.0 Cinematic"
            kenburns
            className="aspect-[21/9] w-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 p-8 sm:p-12">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="max-w-lg text-2xl font-extrabold text-white sm:text-4xl"
            >
              {SLOGANS.future}
            </motion.h3>
            <p className="mt-2 max-w-md text-sm text-white/70">
              Autonomes Fahren, Linien-Tracking und intelligente Ausweichlogik — komplett offen.
            </p>
          </div>
        </div>
      </Reveal>

      {/* Masonry-ish gallery grid */}
      <div className="mt-6 grid auto-rows-[180px] grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {gallery.map((p, i) => {
          // Vary cell spans for a dynamic mosaic.
          const big = i % 6 === 0;
          return (
            <Reveal key={p.id} delay={(i % 4) * 0.05} className={big ? "col-span-2 row-span-2" : ""}>
              <button
                onClick={() => setLightbox(p)}
                className="group relative h-full w-full overflow-hidden rounded-2xl border border-[color:var(--border)]"
              >
                <SmartImage
                  photo={p}
                  size={big ? "full" : "card"}
                  alt={`Siegfried 2.0 Aufnahme ${i + 1}`}
                  className="h-full w-full transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <span className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
                  <i className="fa-solid fa-expand text-xs" />
                </span>
              </button>
            </Reveal>
          );
        })}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative max-h-[85vh] max-w-5xl overflow-hidden rounded-2xl"
            >
              <SmartImage photo={lightbox} size="full" alt="Siegfried 2.0" priority className="max-h-[85vh] w-auto" />
            </motion.div>
            <button
              onClick={() => setLightbox(null)}
              aria-label="Schließen"
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20"
            >
              <i className="fa-solid fa-xmark" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
