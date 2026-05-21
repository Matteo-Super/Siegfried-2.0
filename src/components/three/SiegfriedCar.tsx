import { forwardRef } from "react";
import { Group } from "three";

type WheelProps = { x: number; z: number; steer?: number };

function Wheel({ x, z, steer = 0 }: WheelProps) {
  return (
    <group position={[x, 0.34, z]} rotation={[0, steer, 0]}>
      {/* tyre */}
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.34, 0.34, 0.26, 24]} />
        <meshStandardMaterial color="#fbbf24" roughness={0.55} metalness={0.1} />
      </mesh>
      {/* hub */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.16, 0.16, 0.28, 16]} />
        <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.6} />
      </mesh>
    </group>
  );
}

export type CarHandle = Group;

type Props = {
  steer?: number;
  /** LED glow color [r,g,b] 0..1 and intensity. */
  glow?: { color: string; intensity: number };
  scanAngle?: number;
};

// The Siegfried 2.0 rover, built from primitives: acrylic chassis, 4 yellow
// drive wheels, ultrasonic servo head, PCB, battery pack, and an emissive
// WS2812 RGB underglow strip.
export const SiegfriedCar = forwardRef<Group, Props>(function SiegfriedCar(
  { steer = 0, glow = { color: "#34d399", intensity: 2 }, scanAngle = 0 },
  ref
) {
  return (
    <group ref={ref}>
      {/* Chassis deck */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.7, 0.14, 2.5]} />
        <meshStandardMaterial color="#0b1220" roughness={0.35} metalness={0.5} />
      </mesh>
      {/* Lower deck */}
      <mesh position={[0, 0.28, 0]} castShadow>
        <boxGeometry args={[1.5, 0.1, 2.3]} />
        <meshStandardMaterial color="#111827" roughness={0.4} metalness={0.4} />
      </mesh>

      {/* Battery pack (purple) */}
      <mesh position={[0, 0.64, -0.2]} castShadow>
        <boxGeometry args={[1.0, 0.22, 1.0]} />
        <meshStandardMaterial color="#7c3aed" emissive="#4c1d95" emissiveIntensity={0.25} roughness={0.5} />
      </mesh>

      {/* PCB (green) */}
      <mesh position={[0, 0.62, 0.55]} castShadow>
        <boxGeometry args={[0.9, 0.06, 0.7]} />
        <meshStandardMaterial color="#065f46" roughness={0.6} />
      </mesh>
      <mesh position={[0.25, 0.67, 0.55]}>
        <boxGeometry args={[0.08, 0.05, 0.08]} />
        <meshStandardMaterial color="#34d399" emissive="#34d399" emissiveIntensity={1.5} />
      </mesh>

      {/* Ultrasonic servo head at the front (+Z) */}
      <group position={[0, 0.62, 1.15]} rotation={[0, scanAngle, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.5, 0.18, 0.16]} />
          <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.5} />
        </mesh>
        {/* two ultrasonic "eyes" */}
        <mesh position={[-0.13, 0, 0.09]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.05, 16]} />
          <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.2} />
        </mesh>
        <mesh position={[0.13, 0, 0.09]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.05, 16]} />
          <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.2} />
        </mesh>
      </group>

      {/* WS2812 RGB underglow strip — emissive, colour driven by sim state */}
      <mesh position={[0, 0.18, 0]}>
        <boxGeometry args={[1.55, 0.05, 2.35]} />
        <meshStandardMaterial
          color={glow.color}
          emissive={glow.color}
          emissiveIntensity={glow.intensity}
          toneMapped={false}
        />
      </mesh>
      <pointLight position={[0, 0.05, 0]} color={glow.color} intensity={glow.intensity * 1.5} distance={4} />

      {/* Wheels — front pair (+Z) steers */}
      <Wheel x={-0.85} z={0.85} steer={steer} />
      <Wheel x={0.85} z={0.85} steer={steer} />
      <Wheel x={-0.85} z={-0.85} />
      <Wheel x={0.85} z={-0.85} />
    </group>
  );
});
