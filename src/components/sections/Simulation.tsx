import { lazy, Suspense } from "react";
import { Reveal } from "../ui/Reveal";
import { SectionHeader } from "../ui/SectionHeader";
import { ErrorBoundary } from "../ui/ErrorBoundary";
import { SLOGANS } from "../../data/site";

// Defer the Three.js bundle until the section is rendered.
const SimulatorCanvas = lazy(() =>
  import("../three/SimulatorCanvas").then((m) => ({ default: m.SimulatorCanvas }))
);

export function Simulation() {
  return (
    <section id="simulator" className="mx-auto max-w-6xl px-5 py-24">
      <SectionHeader
        eyebrow="3D-Simulator"
        title={<>{SLOGANS.sim}</>}
        sub="Steuere Siegfried in Echtzeit durch eine 3D-Arena — manuell mit W A S D oder im Autopilot mit Hinderniserkennung."
      />

      <Reveal>
        <div className="mt-12">
          <ErrorBoundary compact>
            <Suspense
              fallback={
                <div className="flex h-[460px] items-center justify-center rounded-2xl border border-[color:var(--border)] text-2">
                  <i className="fa-solid fa-circle-notch animate-spin mr-2 text-accent" />
                  Simulator wird geladen …
                </div>
              }
            >
              <SimulatorCanvas />
            </Suspense>
          </ErrorBoundary>
        </div>
      </Reveal>
    </section>
  );
}
