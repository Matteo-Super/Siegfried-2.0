import { useState } from "react";
import { Reveal } from "../ui/Reveal";
import { GlassCard } from "../ui/GlassCard";
import { GlowButton } from "../ui/GlowButton";
import { SectionHeader } from "../ui/SectionHeader";
import { PremiumGate } from "../auth/PremiumGate";
import { ARDUINO_FIRMWARE } from "../../data/firmware";
import { GITHUB_URL, SLOGANS } from "../../data/site";

export function OpenSource() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(ARDUINO_FIRMWARE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  function downloadFirmware() {
    const blob = new Blob([ARDUINO_FIRMWARE], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "siegfried_firmware.ino";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section id="opensource" className="mx-auto max-w-6xl px-5 py-24">
      <SectionHeader
        eyebrow="Open Source. Everything."
        title={<>{SLOGANS.openSource}</>}
        sub="Die vollständige Steuerungs-Firmware — kopieren, hochladen, losfahren. Keine Blackbox."
      />

      <Reveal>
        <GlassCard className="mt-12 overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-[color:var(--border)] bg-accent/5 px-5 py-3">
            <span className="flex items-center gap-2 text-sm font-bold">
              <i className="fa-solid fa-code text-accent" /> siegfried_firmware.ino
            </span>
            <button
              onClick={copy}
              className="flex items-center gap-2 rounded-lg border border-[color:var(--border)] px-3 py-1.5 text-xs font-bold text-2 transition-all hover:border-accent hover:text-[color:var(--text-1)]"
            >
              <i className={copied ? "fa-solid fa-check text-signal-green" : "fa-regular fa-copy"} />
              {copied ? "Kopiert!" : "Code kopieren"}
            </button>
          </div>
          <pre className="max-h-[460px] overflow-auto bg-black/30 p-5 text-[13px] leading-relaxed">
            <code className="font-mono text-[color:var(--text-1)]">{ARDUINO_FIRMWARE}</code>
          </pre>
        </GlassCard>
      </Reveal>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Reveal>
          <GlassCard tilt className="flex h-full flex-col justify-between gap-5 p-8">
            <div>
              <i className="fa-brands fa-github text-3xl text-accent" />
              <h3 className="mt-4 text-xl font-bold">Auf GitHub forken</h3>
              <p className="mt-2 text-sm text-2">
                Firmware, Schaltpläne und CAD-Dateien. Sterne das Repo, öffne Issues,
                reiche Pull Requests ein.
              </p>
            </div>
            <GlowButton href={GITHUB_URL} variant="ghost">
              <i className="fa-brands fa-github" /> Repository öffnen
            </GlowButton>
          </GlassCard>
        </Reveal>

        <Reveal delay={0.1}>
          <PremiumGate title="Premium-Downloads">
            <div className="flex h-full flex-col justify-between gap-5">
              <div>
                <i className="fa-solid fa-box-open text-3xl text-signal-amber" />
                <h3 className="mt-4 text-xl font-bold">Ressourcen-Paket</h3>
                <p className="mt-2 text-sm text-2">
                  Firmware-Datei, erweiterte Simulator-Szenarien und Build-Anleitung
                  als Download — für Premium-Unterstützer.
                </p>
              </div>
              <GlowButton onClick={downloadFirmware}>
                <i className="fa-solid fa-download" /> Firmware herunterladen
              </GlowButton>
            </div>
          </PremiumGate>
        </Reveal>
      </div>
    </section>
  );
}
