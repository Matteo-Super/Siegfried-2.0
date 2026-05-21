import { useState } from "react";
import { Reveal } from "../ui/Reveal";
import { GlassCard } from "../ui/GlassCard";
import { GlowButton } from "../ui/GlowButton";
import { SectionHeader } from "../ui/SectionHeader";
import { useAuth } from "../../context/AuthContext";
import { KIT_INCLUDES, TIP_PRESETS } from "../../data/site";
import { PRODUCT_LINK, tipLink, openCheckout, TIP_CUSTOM_LINK } from "../../lib/stripe";

export function Pricing() {
  const { user, premium, signIn } = useAuth();
  const [notice, setNotice] = useState<string | null>(null);

  function buyPremium() {
    if (!user) {
      setNotice("Bitte zuerst mit Google anmelden, um Premium mit deinem Konto zu verknüpfen.");
      void signIn();
      return;
    }
    if (!openCheckout(PRODUCT_LINK, user.uid)) {
      setNotice("Zahlungslink noch nicht konfiguriert. Siehe docs/STRIPE_SETUP.md.");
    }
  }

  function tip(amount: number) {
    const link = tipLink(amount);
    if (!openCheckout(link, user?.uid)) {
      setNotice("Trinkgeld-Link noch nicht konfiguriert. Siehe docs/STRIPE_SETUP.md.");
    }
  }

  return (
    <section id="pricing" className="mx-auto max-w-6xl px-5 py-24">
      <SectionHeader
        eyebrow="Preise"
        title={<>Unterstütze <span className="text-gradient">Open Source</span></>}
        sub="Ein faires Modell: Premium-Features für 0,99 € — und Trinkgeld, wenn dir das Projekt gefällt."
      />

      <div className="mt-14 grid items-start gap-6 lg:grid-cols-[1.25fr_1fr]">
        {/* Premium product */}
        <Reveal>
          <GlassCard tilt className="relative p-8 sm:p-10">
            <span className="absolute right-6 top-6 rounded-full bg-accent/15 px-3 py-1 text-xs font-bold text-accent">
              Beliebt
            </span>
            <p className="section-eyebrow">Premium</p>
            <h3 className="mt-2 text-2xl font-extrabold">Siegfried 2.0 Premium</h3>
            <p className="mt-2 text-sm text-2">
              Schalte erweiterte Simulator-Szenarien und die Download-Ressourcen frei.
            </p>

            <div className="my-6 flex items-end gap-2">
              <span className="text-5xl font-black tracking-tight">0,99 €</span>
              <span className="mb-1.5 text-sm text-3">einmalig</span>
            </div>

            <ul className="grid gap-2.5 sm:grid-cols-2">
              {KIT_INCLUDES.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-2">
                  <i className="fa-solid fa-check mt-1 text-xs text-signal-green" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-8">
              {premium ? (
                <div className="flex items-center gap-3 rounded-xl border border-signal-green/30 bg-signal-green/10 px-4 py-3 text-sm font-semibold text-signal-green">
                  <i className="fa-solid fa-crown" /> Premium aktiv — danke für deine Unterstützung!
                </div>
              ) : (
                <GlowButton full onClick={buyPremium}>
                  <i className="fa-solid fa-lock-open" /> Mit Karte bezahlen · 0,99 €
                </GlowButton>
              )}
              <p className="mt-3 flex items-center justify-center gap-2 text-xs text-3">
                <i className="fa-brands fa-stripe" /> Sichere Zahlung über Stripe ·{" "}
                <i className="fa-solid fa-shield-halved" /> SSL-verschlüsselt
              </p>
            </div>
          </GlassCard>
        </Reveal>

        {/* Tips / donations */}
        <Reveal delay={0.1}>
          <GlassCard className="p-8 sm:p-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-signal-amber/20 bg-signal-amber/10 text-lg text-signal-amber">
              <i className="fa-solid fa-mug-hot" />
            </div>
            <h3 className="mt-5 text-xl font-bold">Trinkgeld geben</h3>
            <p className="mt-2 text-sm text-2">
              Kein Abo, kein Zwang. Wähle einen Betrag, um die Weiterentwicklung zu unterstützen.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {TIP_PRESETS.map((amt) => (
                <button
                  key={amt}
                  onClick={() => tip(amt)}
                  className="group rounded-xl border border-[color:var(--border)] py-4 text-center transition-all hover:-translate-y-0.5 hover:border-accent hover:bg-accent/5"
                >
                  <span className="block text-2xl font-black transition-colors group-hover:text-accent">
                    {amt} €
                  </span>
                </button>
              ))}
            </div>

            {TIP_CUSTOM_LINK && (
              <GlowButton full variant="ghost" className="mt-3" href={TIP_CUSTOM_LINK}>
                <i className="fa-solid fa-sliders" /> Eigener Betrag
              </GlowButton>
            )}
            <p className="mt-4 text-center text-xs text-3">
              <i className="fa-solid fa-heart text-accent" /> Jeder Beitrag hält das Projekt offen.
            </p>
          </GlassCard>
        </Reveal>
      </div>

      {notice && (
        <p className="mx-auto mt-6 max-w-xl rounded-xl border border-[color:var(--border)] bg-accent/5 px-4 py-3 text-center text-sm text-2">
          <i className="fa-solid fa-circle-info mr-2 text-accent" />
          {notice}
        </p>
      )}
    </section>
  );
}
