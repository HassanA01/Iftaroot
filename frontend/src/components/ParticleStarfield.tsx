import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions } from "@tsparticles/engine";
import { useIsMobile } from "../hooks/useMobileDetect";

interface ParticleStarfieldProps {
  /** Speed multiplier (1.0 = default). Used by game intensity system. */
  speed?: number;
  /** Particle count multiplier (1.0 = default). Used by game intensity system. */
  countMultiplier?: number;
}

export function ParticleStarfield({ speed = 1, countMultiplier = 1 }: ParticleStarfieldProps) {
  const isMobile = useIsMobile();
  const baseCount = isMobile ? 30 : 80;
  const [engineReady, setEngineReady] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setEngineReady(true);
    });
  }, []);

  const options: ISourceOptions = useMemo(
    () => ({
      fullScreen: false,
      fpsLimit: 60,
      particles: {
        number: {
          value: Math.round(baseCount * countMultiplier),
        },
        color: { value: "#f5c842" },
        opacity: {
          value: { min: 0.15, max: 0.4 },
          animation: {
            enable: true,
            speed: 0.3,
            sync: false,
          },
        },
        size: {
          value: { min: 1, max: 2 },
        },
        move: {
          enable: true,
          speed: 0.3 * speed,
          direction: "none" as const,
          outModes: { default: "out" as const },
        },
      },
      interactivity: isMobile
        ? {}
        : {
            events: {
              onHover: {
                enable: true,
                mode: "repulse",
              },
            },
            modes: {
              repulse: {
                distance: 100,
                speed: 0.5,
              },
            },
          },
      detectRetina: true,
    }),
    [baseCount, speed, countMultiplier, isMobile],
  );

  if (!engineReady) return null;

  return (
    <Particles
      id="particle-starfield"
      options={options}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
