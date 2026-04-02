import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

function CrescentGeometry() {
  const shape = useMemo(() => {
    const outer = new THREE.Shape();
    const outerRadius = 1;
    outer.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);

    const hole = new THREE.Path();
    hole.absarc(0.4, 0.2, outerRadius * 0.8, 0, Math.PI * 2, true);
    outer.holes.push(hole);

    return outer;
  }, []);

  const extrudeSettings = useMemo(
    () => ({
      depth: 0.15,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.03,
      bevelSegments: 4,
      curveSegments: 64,
    }),
    [],
  );

  return <extrudeGeometry args={[shape, extrudeSettings]} />;
}

function OrbitingStar({
  radius,
  speed,
  offset,
  size,
}: {
  radius: number;
  speed: number;
  offset: number;
  size: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() * speed + offset;
    ref.current.position.x = Math.cos(t) * radius;
    ref.current.position.y = Math.sin(t) * radius * 0.6;
    ref.current.position.z = Math.sin(t * 0.5) * 0.3;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[size, 8, 8]} />
      <meshStandardMaterial
        color="#f5c842"
        emissive="#f5c842"
        emissiveIntensity={0.8}
      />
    </mesh>
  );
}

export function CrescentMoon3D() {
  const groupRef = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  useFrame(() => {
    if (!groupRef.current) return;
    const targetRotY = pointer.x * 0.175;
    const targetRotX = -pointer.y * 0.175;
    groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * 0.05;
    groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * 0.05;
  });

  // Deterministic pseudo-random based on index to satisfy React hooks purity
  const stars = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => {
        const seed = (i * 7919 + 104729) % 1000 / 1000; // deterministic hash
        const seed2 = (i * 6271 + 87631) % 1000 / 1000;
        const seed3 = (i * 3571 + 52147) % 1000 / 1000;
        return {
          radius: 1.5 + seed * 1.2,
          speed: 0.2 + seed2 * 0.4,
          offset: (i / 24) * Math.PI * 2,
          size: 0.02 + seed3 * 0.03,
        };
      }),
    [],
  );

  return (
    <Float speed={0.8} rotationIntensity={0} floatIntensity={0.4}>
      <group ref={groupRef} position={[0, 0.3, 0]} scale={[0.6, 0.6, 0.6]}>
        <mesh rotation={[0, 0, Math.PI * 0.1]}>
          <CrescentGeometry />
          <meshStandardMaterial
            color="#f5c842"
            emissive="#f5c842"
            emissiveIntensity={0.2}
            metalness={0.7}
            roughness={0.2}
            transparent
            opacity={0.7}
          />
        </mesh>

        {stars.map((s, i) => (
          <OrbitingStar key={i} {...s} />
        ))}
      </group>
    </Float>
  );
}
