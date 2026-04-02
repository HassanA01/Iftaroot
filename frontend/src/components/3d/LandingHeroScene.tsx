import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { GradientMesh } from "./GradientMesh";
import { IslamicLattice } from "./IslamicLattice";
import { CrescentMoon3D } from "./CrescentMoon3D";

export function LandingHeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
      }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.5]}
    >
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 5, 5]} intensity={0.35} color="#f5c842" />

      <GradientMesh />
      <IslamicLattice />
      <CrescentMoon3D />

      <EffectComposer>
        <Bloom
          intensity={0.5}
          luminanceThreshold={0.5}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  );
}
