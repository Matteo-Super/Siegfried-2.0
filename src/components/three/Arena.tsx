import { MeshReflectorMaterial, Grid } from "@react-three/drei";
import { ARENA, OBSTACLES } from "./simTypes";

// Reflective floor + grid + boundary walls + obstacle pillars.
export function Arena({ reflections = true }: { reflections?: boolean }) {
  const { halfX, halfZ, wall } = ARENA;
  const w = halfX * 2 + wall;
  const d = halfZ * 2 + wall;

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[w + 2, d + 2]} />
        {reflections ? (
          <MeshReflectorMaterial
            mirror={0}
            blur={[300, 100]}
            resolution={1024}
            mixBlur={1}
            mixStrength={40}
            roughness={0.85}
            depthScale={1.2}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#0a0e1a"
            metalness={0.6}
          />
        ) : (
          <meshStandardMaterial color="#0a0e1a" roughness={0.9} metalness={0.2} />
        )}
      </mesh>

      <Grid
        position={[0, 0.01, 0]}
        args={[w, d]}
        cellSize={1}
        cellThickness={0.6}
        cellColor="#1e293b"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#6366f1"
        fadeDistance={32}
        fadeStrength={1.5}
        infiniteGrid={false}
      />

      {/* Boundary walls */}
      {[
        { p: [0, 0.4, halfZ + wall / 2], s: [w, 0.8, wall] },
        { p: [0, 0.4, -halfZ - wall / 2], s: [w, 0.8, wall] },
        { p: [halfX + wall / 2, 0.4, 0], s: [wall, 0.8, d] },
        { p: [-halfX - wall / 2, 0.4, 0], s: [wall, 0.8, d] },
      ].map((wdef, i) => (
        <mesh key={i} position={wdef.p as [number, number, number]} castShadow>
          <boxGeometry args={wdef.s as [number, number, number]} />
          <meshStandardMaterial
            color="#111827"
            emissive="#6366f1"
            emissiveIntensity={0.15}
            roughness={0.5}
            transparent
            opacity={0.55}
          />
        </mesh>
      ))}

      {/* Obstacle pillars */}
      {OBSTACLES.map((o, i) => (
        <group key={i} position={[o.x, 0, o.z]}>
          <mesh position={[0, o.h / 2, 0]} castShadow>
            <cylinderGeometry args={[o.r, o.r, o.h, 24]} />
            <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.5} />
          </mesh>
          {/* glowing top ring */}
          <mesh position={[0, o.h + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[o.r * 0.6, o.r, 24]} />
            <meshStandardMaterial color="#818cf8" emissive="#818cf8" emissiveIntensity={2} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
