// Shared types + arena layout for the 3D simulator.

export type SimMode = "manual" | "autopilot";

export type Telemetry = {
  speed: number; // cm/s (display)
  distance: number; // cm to nearest obstacle ahead (999 = clear)
  battery: number; // volts
  status: string;
};

// Mutable controller shared between the HUD (outside <Canvas>) and the physics
// loop (inside <Canvas>). Avoids React re-renders on every frame.
export type SimController = {
  input: { forward: number; steer: number }; // forward: -1..1, steer: -1..1
  mode: SimMode;
  freeCam: boolean;
  telemetry: Telemetry;
  reset: boolean;
};

export function createController(): SimController {
  return {
    input: { forward: 0, steer: 0 },
    mode: "manual",
    freeCam: false,
    telemetry: { speed: 0, distance: 999, battery: 7.8, status: "Bereit" },
    reset: false,
  };
}

// Arena half-extents (XZ plane). Car drives within [-X..X, -Z..Z].
export const ARENA = { halfX: 11, halfZ: 7, wall: 0.4 };

export type Obstacle = { x: number; z: number; r: number; h: number };

// Obstacle layout (ported/expanded from the original 2D simulator).
export const OBSTACLES: Obstacle[] = [
  { x: -6, z: -3, r: 0.85, h: 1.6 },
  { x: 6.5, z: 2.5, r: 0.85, h: 1.2 },
  { x: -5.5, z: 3.5, r: 0.7, h: 2.0 },
  { x: 5, z: -3.5, r: 0.7, h: 1.4 },
  { x: 0, z: 0.5, r: 0.6, h: 1.0 },
  { x: 2.5, z: 4, r: 0.6, h: 1.8 },
  { x: -2, z: -4.5, r: 0.6, h: 1.3 },
];
