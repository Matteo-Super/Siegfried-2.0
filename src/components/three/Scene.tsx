import { useRef, type MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Group, Vector3, MathUtils } from "three";
import { SiegfriedCar } from "./SiegfriedCar";
import { Arena } from "./Arena";
import { ARENA, OBSTACLES, type SimController } from "./simTypes";

// Internal continuous physics state (kept out of React).
type CarState = {
  x: number;
  z: number;
  heading: number;
  speed: number;
  scan: number;
  // autopilot
  autoState: "drive" | "avoid";
  avoidDir: number;
  avoidT: number;
};

const MAX_FWD = 7;
const MAX_REV = 4;
const ACCEL = 3;
const CAR_R = 0.95;
const SENSOR_THRESHOLD = 3.2; // units

// Analytic forward sensor distance: nearest obstacle/wall along heading.
function sensorDistance(s: CarState, scan: number): number {
  const a = s.heading + scan;
  const dx = Math.sin(a);
  const dz = Math.cos(a);
  const ox = s.x + dx * 1.2;
  const oz = s.z + dz * 1.2;
  let best = 999;

  // Walls (axis-aligned bounds).
  if (dx > 0.001) best = Math.min(best, (ARENA.halfX - ox) / dx);
  else if (dx < -0.001) best = Math.min(best, (-ARENA.halfX - ox) / dx);
  if (dz > 0.001) best = Math.min(best, (ARENA.halfZ - oz) / dz);
  else if (dz < -0.001) best = Math.min(best, (-ARENA.halfZ - oz) / dz);

  // Obstacles (ray vs circle).
  for (const o of OBSTACLES) {
    const vx = o.x - ox;
    const vz = o.z - oz;
    const proj = vx * dx + vz * dz;
    if (proj <= 0) continue;
    const perp = Math.abs(vx * -dz + vz * dx);
    if (perp < o.r + 0.3) {
      const d = Math.sqrt(Math.max(proj * proj + perp * perp, 0)) - o.r;
      if (d > 0 && d < best) best = d;
    }
  }
  return best;
}

function collides(x: number, z: number): boolean {
  if (Math.abs(x) > ARENA.halfX - CAR_R || Math.abs(z) > ARENA.halfZ - CAR_R) return true;
  for (const o of OBSTACLES) {
    const dx = x - o.x;
    const dz = z - o.z;
    if (dx * dx + dz * dz < (o.r + CAR_R) * (o.r + CAR_R)) return true;
  }
  return false;
}

type Props = {
  controller: MutableRefObject<SimController>;
  quality: "high" | "low";
};

export function Scene({ controller, quality }: Props) {
  const carRef = useRef<Group>(null);
  const state = useRef<CarState>({
    x: 0,
    z: -2,
    heading: 0,
    speed: 0,
    scan: 0,
    autoState: "drive",
    avoidDir: 1,
    avoidT: 0,
  });
  const glow = useRef({ color: "#34d399", intensity: 2 });
  const steerRef = useRef(0);
  const camTarget = useRef(new Vector3());
  const { camera } = useThree();
  const telemTimer = useRef(0);
  const battery = useRef(7.8);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const s = state.current;
    const ctl = controller.current;

    if (ctl.reset) {
      s.x = 0; s.z = -2; s.heading = 0; s.speed = 0;
      s.autoState = "drive"; battery.current = 7.8;
      ctl.reset = false;
    }

    // ── Determine input (manual vs autopilot) ──
    let forward = ctl.input.forward;
    let steer = ctl.input.steer;
    s.scan = Math.sin(performance.now() * 0.004) * 0.5;
    const sensed = sensorDistance(s, s.scan);

    if (ctl.mode === "autopilot" && battery.current > 0) {
      if (s.autoState === "avoid") {
        forward = -0.3;
        steer = s.avoidDir;
        s.avoidT -= dt;
        if (s.avoidT <= 0) s.autoState = "drive";
      } else {
        forward = 0.7;
        steer = 0;
        if (sensorDistance(s, 0) < SENSOR_THRESHOLD) {
          s.autoState = "avoid";
          // Probe left/right to choose the freer side.
          const left = sensorDistance(s, 0.6);
          const right = sensorDistance(s, -0.6);
          s.avoidDir = left > right ? 1 : -1;
          s.avoidT = 0.7 + Math.random() * 0.5;
        }
      }
    }

    if (battery.current <= 0) forward = 0;

    // ── Physics ──
    const target = forward > 0 ? forward * MAX_FWD : forward * MAX_REV;
    s.speed += (target - s.speed) * ACCEL * dt;
    s.speed *= 1 - 0.5 * dt; // rolling friction

    if (Math.abs(s.speed) > 0.25) {
      const dir = Math.sign(s.speed);
      const speedFactor = Math.min(1, Math.abs(s.speed) / 2.5);
      s.heading += steer * 1.9 * dt * dir * speedFactor;
    }

    const fx = Math.sin(s.heading);
    const fz = Math.cos(s.heading);
    const nx = s.x + fx * s.speed * dt;
    const nz = s.z + fz * s.speed * dt;

    let collided = false;
    if (!collides(nx, nz)) {
      s.x = nx;
      s.z = nz;
    } else {
      collided = true;
      s.speed = -s.speed * 0.3;
    }

    // Battery drain.
    if (Math.abs(s.speed) > 0.4 && battery.current > 0) {
      battery.current = Math.max(0, battery.current - dt * 0.02);
    }

    // ── Visual updates ──
    steerRef.current = MathUtils.lerp(steerRef.current, steer * 0.5, 0.2);
    if (carRef.current) {
      carRef.current.position.set(s.x, 0, s.z);
      carRef.current.rotation.y = s.heading;
    }

    // LED glow logic.
    const drifting = Math.abs(steer) > 0.3 && Math.abs(s.speed) > 4;
    if (collided || battery.current <= 0) {
      glow.current.color = "#ef4444";
      glow.current.intensity = 3;
    } else if (sensed < SENSOR_THRESHOLD) {
      glow.current.color = "#fbbf24";
      glow.current.intensity = 2.6;
    } else if (drifting) {
      glow.current.color = "#a78bfa";
      glow.current.intensity = 2.8;
    } else {
      glow.current.color = "#34d399";
      glow.current.intensity = 2;
    }

    // ── Chase camera (when not in free-orbit mode) ──
    if (!ctl.freeCam) {
      const camX = s.x - fx * 7 - 0;
      const camZ = s.z - fz * 7;
      camera.position.lerp(new Vector3(camX, 5.5, camZ), 0.06);
      camTarget.current.lerp(new Vector3(s.x, 0.6, s.z), 0.1);
      camera.lookAt(camTarget.current);
    }

    // ── Telemetry (throttled) ──
    telemTimer.current += dt;
    if (telemTimer.current > 0.12) {
      telemTimer.current = 0;
      ctl.telemetry = {
        speed: Math.round(Math.abs(s.speed) * 28),
        distance: sensed > 30 ? 999 : Math.round(sensed * 12),
        battery: Math.round(battery.current * 10) / 10,
        status:
          battery.current <= 0
            ? "Akku leer"
            : ctl.mode === "autopilot"
              ? s.autoState === "avoid"
                ? "Ausweichen"
                : "Autopilot"
              : Math.abs(s.speed) > 0.4
                ? "Fährt"
                : "Bereit",
      };
    }
  });

  return (
    <>
      <color attach="background" args={["#06080f"]} />
      <fog attach="fog" args={["#06080f", 18, 40]} />

      <ambientLight intensity={0.4} />
      <directionalLight
        position={[6, 12, 4]}
        intensity={1.4}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
      />
      <spotLight position={[-8, 10, -6]} angle={0.5} penumbra={1} intensity={0.6} color="#818cf8" />
      <Environment preset="night" />

      <SiegfriedCar ref={carRef} steer={steerRef.current} glow={glow.current} scanAngle={state.current.scan} />
      <Arena reflections={quality === "high"} />

      {controller.current.freeCam && (
        <OrbitControls
          enablePan={false}
          minDistance={5}
          maxDistance={22}
          maxPolarAngle={Math.PI / 2.2}
          enableDamping
          dampingFactor={0.08}
        />
      )}

      {quality === "high" && (
        <EffectComposer>
          <Bloom intensity={0.7} luminanceThreshold={0.6} luminanceSmoothing={0.3} mipmapBlur />
          <Vignette eskil={false} offset={0.2} darkness={0.7} />
        </EffectComposer>
      )}
    </>
  );
}
