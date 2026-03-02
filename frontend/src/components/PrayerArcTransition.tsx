import { useEffect, useRef, useState } from "react";

const PRAYERS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;

// SVG dimensions
const W = 400;
const H = 220;
const CX = W / 2;      // 200
const CY = H - 20;     // 200  (flat bottom, center of the circle)
const R = CX - 20;     // 180  (radius, so left tip = 20, right tip = 380)

// Angles for each prayer: 180° (left) → 135° → 90° (top) → 45° → 0° (right)
// SVG y-axis is flipped so we subtract from CY
const ANGLES_DEG = [180, 135, 90, 45, 0];

function polarToCartesian(angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: CX + R * Math.cos(rad),
    y: CY - R * Math.sin(rad),
  };
}

// SVG path: semicircle from left (180°) to right (0°) via top
// M = move to left tip, A = arc to right tip (large-arc-flag=0, sweep=1)
const LEFT = polarToCartesian(180);
const RIGHT = polarToCartesian(0);
const ARC_PATH = `M ${LEFT.x} ${LEFT.y} A ${R} ${R} 0 0 1 ${RIGHT.x} ${RIGHT.y}`;

// Approximate arc length for a semicircle
const ARC_LENGTH = Math.PI * R;

const ANIMATION_MS = 1500;
const COMPLETE_DELAY_MS = 100;

interface Props {
  onComplete: () => void;
}

export function PrayerArcTransition({ onComplete }: Props) {
  const [litDots, setLitDots] = useState<boolean[]>([false, false, false, false, false]);

  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; });

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Light up each dot at its proportional timestamp
    ANGLES_DEG.forEach((_, i) => {
      const delay = (i / (PRAYERS.length - 1)) * ANIMATION_MS;
      timers.push(
        setTimeout(() => {
          setLitDots((prev) => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
        }, delay),
      );
    });

    // Fire onComplete after animation + buffer
    timers.push(setTimeout(() => onCompleteRef.current(), ANIMATION_MS + COMPLETE_DELAY_MS));

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center"
      style={{ background: "#1a0a2e" }}
    >
      <style>{`
        @keyframes arcDraw {
          from { stroke-dashoffset: ${ARC_LENGTH}; }
          to   { stroke-dashoffset: 0; }
        }
      `}</style>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        style={{ maxWidth: "90vw" }}
        aria-hidden="true"
      >
        {/* Dim track */}
        <path
          d={ARC_PATH}
          fill="none"
          stroke="rgba(245,200,66,0.15)"
          strokeWidth={4}
          strokeLinecap="round"
        />

        {/* Animated fill */}
        <path
          d={ARC_PATH}
          fill="none"
          stroke="#f5c842"
          strokeWidth={4}
          strokeLinecap="round"
          style={{
            strokeDasharray: ARC_LENGTH,
            strokeDashoffset: ARC_LENGTH,
            animation: `arcDraw ${ANIMATION_MS}ms linear forwards`,
            filter: "drop-shadow(0 0 8px rgba(245,200,66,0.7))",
          }}
        />

        {/* Dots */}
        {ANGLES_DEG.map((angle, i) => {
          const pos = polarToCartesian(angle);
          const lit = litDots[i];
          return (
            <circle
              key={PRAYERS[i]}
              cx={pos.x}
              cy={pos.y}
              r={6}
              fill={lit ? "#f5c842" : "rgba(245,200,66,0.25)"}
              style={{
                transition: "fill 0.3s ease",
                filter: lit ? "drop-shadow(0 0 6px rgba(245,200,66,0.9))" : "none",
              }}
            />
          );
        })}
      </svg>

      {/* Labels */}
      <div
        style={{
          display: "flex",
          width: W,
          maxWidth: "90vw",
          justifyContent: "space-between",
          marginTop: 8,
        }}
      >
        {PRAYERS.map((name, i) => (
          <span
            key={name}
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.05em",
              color: litDots[i] ? "#f5c842" : "rgba(245,200,66,0.3)",
              transition: "color 0.3s ease",
              textAlign: "center",
              width: 56,
            }}
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}
