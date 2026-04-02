import { motion } from "motion/react";
import { useIsMobile } from "../hooks/useMobileDetect";

type Density = "sparse" | "normal" | "dense";

interface FloatingElementsProps {
  density?: Density;
}

interface FloatingShape {
  id: string;
  type: "diamond" | "crescent" | "star";
  x: number;
  y: number;
  scale: number;
  blur: number;
  opacity: number;
  floatAmplitude: number;
  duration: number;
}

const ALL_SHAPES: FloatingShape[] = [
  { id: "d1", type: "diamond", x: 8, y: 15, scale: 0.4, blur: 1.5, opacity: 0.06, floatAmplitude: 15, duration: 10 },
  { id: "s1", type: "star", x: 85, y: 10, scale: 0.6, blur: 1, opacity: 0.08, floatAmplitude: 12, duration: 8 },
  { id: "c1", type: "crescent", x: 92, y: 55, scale: 0.5, blur: 1.5, opacity: 0.06, floatAmplitude: 18, duration: 12 },
  { id: "d2", type: "diamond", x: 15, y: 70, scale: 0.7, blur: 0.5, opacity: 0.1, floatAmplitude: 10, duration: 7 },
  { id: "s2", type: "star", x: 70, y: 80, scale: 0.35, blur: 2, opacity: 0.05, floatAmplitude: 20, duration: 11 },
  { id: "c2", type: "crescent", x: 5, y: 40, scale: 0.8, blur: 0, opacity: 0.12, floatAmplitude: 8, duration: 6 },
  { id: "d3", type: "diamond", x: 50, y: 25, scale: 0.3, blur: 2, opacity: 0.04, floatAmplitude: 22, duration: 13 },
  { id: "s3", type: "star", x: 30, y: 60, scale: 0.9, blur: 0, opacity: 0.1, floatAmplitude: 6, duration: 9 },
  { id: "c3", type: "crescent", x: 60, y: 90, scale: 0.45, blur: 1, opacity: 0.07, floatAmplitude: 14, duration: 10 },
  { id: "d4", type: "diamond", x: 40, y: 5, scale: 0.55, blur: 1, opacity: 0.08, floatAmplitude: 16, duration: 8 },
  { id: "s4", type: "star", x: 20, y: 90, scale: 0.4, blur: 1.5, opacity: 0.06, floatAmplitude: 19, duration: 11 },
  { id: "c4", type: "crescent", x: 78, y: 35, scale: 0.65, blur: 0.5, opacity: 0.09, floatAmplitude: 11, duration: 7 },
];

const DENSITY_COUNT: Record<Density, number> = { sparse: 4, normal: 6, dense: 12 };

function DiamondSVG() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 0l12 12-12 12L0 12 12 0zm0 4L4 12l8 8 8-8-8-8z" fill="#f5c842" fillRule="evenodd" />
    </svg>
  );
}

function CrescentSVG() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M15 3a9 9 0 11-6 15.87A9 9 0 0015 3z" fill="#f5c842" />
    </svg>
  );
}

function StarSVG() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 2l2.09 6.26H21l-5.55 4.03L17.55 18.53 12 14.47l-5.55 4.06L8.55 12.29 3 8.26h6.91L12 2z" fill="#f5c842" />
    </svg>
  );
}

const SHAPE_MAP = { diamond: DiamondSVG, crescent: CrescentSVG, star: StarSVG };

export function FloatingElements({ density = "normal" }: FloatingElementsProps) {
  const isMobile = useIsMobile();
  const count = isMobile ? Math.min(DENSITY_COUNT[density], 4) : DENSITY_COUNT[density];
  const shapes = ALL_SHAPES.slice(0, count);

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}
      aria-hidden="true"
    >
      {shapes.map((s) => {
        const Shape = SHAPE_MAP[s.type];
        return (
          <motion.div
            key={s.id}
            animate={{ y: [0, -s.floatAmplitude, 0] }}
            transition={{ duration: s.duration, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute",
              left: `${s.x}%`,
              top: `${s.y}%`,
              transform: `scale(${s.scale})`,
              filter: s.blur > 0 ? `blur(${s.blur}px)` : undefined,
              opacity: s.opacity,
            }}
          >
            <Shape />
          </motion.div>
        );
      })}
    </div>
  );
}
