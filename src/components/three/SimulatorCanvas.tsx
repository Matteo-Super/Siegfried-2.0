import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Scene } from "./Scene";
import { createController, type SimMode, type Telemetry } from "./simTypes";

const KEY_MAP: Record<string, "f+" | "f-" | "s+" | "s-"> = {
  KeyW: "f+", ArrowUp: "f+",
  KeyS: "f-", ArrowDown: "f-",
  KeyA: "s-", ArrowLeft: "s-",
  KeyD: "s+", ArrowRight: "s+",
};

export function SimulatorCanvas() {
  const controller = useRef(createController());
  const keys = useRef<Set<string>>(new Set());
  const [mode, setMode] = useState<SimMode>("manual");
  const [freeCam, setFreeCam] = useState(false);
  const [active, setActive] = useState(false);
  const [telem, setTelem] = useState<Telemetry>(controller.current.telemetry);

  const quality: "high" | "low" = useMemo(() => {
    if (typeof window === "undefined") return "high";
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.innerWidth < 768;
    return reduce || small ? "low" : "high";
  }, []);

  // Mirror UI toggles into the controller.
  useEffect(() => {
    controller.current.mode = mode;
    if (mode === "autopilot") {
      keys.current.clear();
      controller.current.input = { forward: 0, steer: 0 };
    }
  }, [mode]);
  useEffect(() => {
    controller.current.freeCam = freeCam;
  }, [freeCam]);

  // Poll telemetry for the HUD (~8fps, cheap).
  useEffect(() => {
    const id = setInterval(() => setTelem({ ...controller.current.telemetry }), 130);
    return () => clearInterval(id);
  }, []);

  function applyKeys() {
    if (controller.current.mode !== "manual") return;
    let f = 0;
    let s = 0;
    if (keys.current.has("f+")) f += 1;
    if (keys.current.has("f-")) f -= 1;
    if (keys.current.has("s+")) s += 1;
    if (keys.current.has("s-")) s -= 1;
    controller.current.input = { forward: f, steer: s };
  }

  // Keyboard control while the simulator is "active".
  useEffect(() => {
    if (!active) return;
    function onDown(e: KeyboardEvent) {
      const m = KEY_MAP[e.code];
      if (!m) return;
      e.preventDefault();
      keys.current.add(m);
      applyKeys();
    }
    function onUp(e: KeyboardEvent) {
      const m = KEY_MAP[e.code];
      if (!m) return;
      keys.current.delete(m);
      applyKeys();
    }
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [active]);

  // D-pad press/hold helpers.
  function hold(which: "f+" | "f-" | "s+" | "s-", on: boolean) {
    setActive(true);
    if (on) keys.current.add(which);
    else keys.current.delete(which);
    applyKeys();
  }

  const dpadBtn =
    "flex h-12 w-12 items-center justify-center rounded-xl border border-[color:var(--border)] text-2 transition-all active:scale-95 active:border-accent active:bg-accent/15 active:text-accent select-none touch-none";

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1.6fr]">
      {/* Control + telemetry panel */}
      <div className="glass flex flex-col gap-5 p-6">
        {/* Mode toggle */}
        <div className="flex gap-1 rounded-xl border border-[color:var(--border)] bg-accent/5 p-1">
          {(["manual", "autopilot"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
                mode === m ? "bg-accent-deep text-white shadow-glow" : "text-2"
              }`}
            >
              {m === "manual" ? "Manuell" : "Autopilot"}
            </button>
          ))}
        </div>

        {/* Telemetry */}
        <div className="grid grid-cols-2 gap-2.5">
          <Telem label="Speed" value={`${telem.speed} cm/s`} />
          <Telem label="Sensor" value={telem.distance >= 999 ? "frei" : `${telem.distance} cm`} warn={telem.distance < 40} />
          <Telem label="Akku" value={`${telem.battery.toFixed(1)} V`} />
          <Telem label="Status" value={telem.status} />
        </div>

        {/* D-pad */}
        <div className="mt-auto flex flex-col items-center gap-2">
          <button className={dpadBtn} onMouseDown={() => hold("f+", true)} onMouseUp={() => hold("f+", false)} onMouseLeave={() => hold("f+", false)} onTouchStart={(e) => { e.preventDefault(); hold("f+", true); }} onTouchEnd={(e) => { e.preventDefault(); hold("f+", false); }} aria-label="Vorwärts">
            <i className="fa-solid fa-chevron-up" />
          </button>
          <div className="flex gap-2">
            <button className={dpadBtn} onMouseDown={() => hold("s-", true)} onMouseUp={() => hold("s-", false)} onMouseLeave={() => hold("s-", false)} onTouchStart={(e) => { e.preventDefault(); hold("s-", true); }} onTouchEnd={(e) => { e.preventDefault(); hold("s-", false); }} aria-label="Links">
              <i className="fa-solid fa-chevron-left" />
            </button>
            <button
              className={`${dpadBtn} !text-signal-amber`}
              onClick={() => { keys.current.clear(); controller.current.input = { forward: 0, steer: 0 }; }}
              aria-label="Stop"
            >
              <i className="fa-solid fa-stop" />
            </button>
            <button className={dpadBtn} onMouseDown={() => hold("s+", true)} onMouseUp={() => hold("s+", false)} onMouseLeave={() => hold("s+", false)} onTouchStart={(e) => { e.preventDefault(); hold("s+", true); }} onTouchEnd={(e) => { e.preventDefault(); hold("s+", false); }} aria-label="Rechts">
              <i className="fa-solid fa-chevron-right" />
            </button>
          </div>
          <button className={dpadBtn} onMouseDown={() => hold("f-", true)} onMouseUp={() => hold("f-", false)} onMouseLeave={() => hold("f-", false)} onTouchStart={(e) => { e.preventDefault(); hold("f-", true); }} onTouchEnd={(e) => { e.preventDefault(); hold("f-", false); }} aria-label="Rückwärts">
            <i className="fa-solid fa-chevron-down" />
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFreeCam((v) => !v)}
            className="flex-1 rounded-lg border border-[color:var(--border)] py-2 text-xs font-semibold text-2 transition-colors hover:border-accent hover:text-accent"
          >
            <i className="fa-solid fa-video mr-1.5" />
            {freeCam ? "Verfolgung" : "Freie Kamera"}
          </button>
          <button
            onClick={() => { controller.current.reset = true; }}
            className="flex-1 rounded-lg border border-[color:var(--border)] py-2 text-xs font-semibold text-2 transition-colors hover:border-accent hover:text-accent"
          >
            <i className="fa-solid fa-rotate-left mr-1.5" /> Reset
          </button>
        </div>
      </div>

      {/* 3D viewport */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-[color:var(--border)] lg:aspect-auto lg:min-h-[460px]">
        <Canvas
          shadows={quality === "high"}
          dpr={quality === "high" ? [1, 2] : 1}
          camera={{ position: [0, 6, 9], fov: 50 }}
          onClick={() => setActive(true)}
        >
          <Suspense fallback={null}>
            <Scene controller={controller} quality={quality} />
          </Suspense>
        </Canvas>

        {!active && mode === "manual" && (
          <button
            onClick={() => setActive(true)}
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[color:var(--bg)]/70 backdrop-blur-sm transition-opacity"
          >
            <span className="text-lg font-bold">Klicke zum Steuern</span>
            <div className="flex gap-2">
              {["W", "A", "S", "D"].map((k) => (
                <kbd key={k} className="flex h-10 w-10 items-center justify-center rounded-lg border border-[color:var(--border)] bg-accent/10 font-bold text-accent">
                  {k}
                </kbd>
              ))}
            </div>
            <span className="text-xs text-3">oder nutze die Steuerung links</span>
          </button>
        )}
      </div>
    </div>
  );
}

function Telem({ label, value, warn = false }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="rounded-xl border border-[color:var(--border)] bg-accent/5 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-3">{label}</p>
      <p className={`mt-0.5 text-base font-bold ${warn ? "text-signal-amber" : "text-accent"}`}>{value}</p>
    </div>
  );
}
