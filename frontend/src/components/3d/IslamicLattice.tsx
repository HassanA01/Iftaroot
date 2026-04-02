import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

function DiamondGeometry() {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0.5);
    s.lineTo(0.5, 0);
    s.lineTo(0, -0.5);
    s.lineTo(-0.5, 0);
    s.closePath();
    return s;
  }, []);

  const extrudeSettings = useMemo(
    () => ({ depth: 0.04, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 2 }),
    [],
  );

  return <extrudeGeometry args={[shape, extrudeSettings]} />;
}

export function IslamicLattice() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.1) * 0.15;
    }
  });

  const diamonds = useMemo(() => {
    const items: { x: number; y: number; delay: number }[] = [];
    for (let row = -2; row <= 2; row++) {
      for (let col = -2; col <= 2; col++) {
        const offset = row % 2 === 0 ? 0 : 0.6;
        items.push({
          x: col * 1.2 + offset,
          y: row * 1.2,
          delay: (row + col) * 0.3,
        });
      }
    }
    return items;
  }, []);

  return (
    <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.3}>
      <group ref={groupRef} position={[0, 0, -2.5]} scale={[0.5, 0.5, 0.5]}>
        {diamonds.map((d, i) => (
          <mesh key={i} position={[d.x, d.y, 0]}>
            <DiamondGeometry />
            <meshStandardMaterial
              color="#f5c842"
              emissive="#f5c842"
              emissiveIntensity={0.08}
              transparent
              opacity={0.1}
              metalness={0.6}
              roughness={0.3}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
        <pointLight color="#f5c842" intensity={1} position={[0, 0, -1]} distance={8} />
      </group>
    </Float>
  );
}
