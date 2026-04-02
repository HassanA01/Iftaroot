export function AuroraBackground() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
      aria-hidden="true"
    >
      {/* Layer 1 — deep purple drift */}
      <div
        style={{
          position: "absolute",
          top: "-20%",
          left: "-20%",
          width: "140%",
          height: "140%",
          background: "radial-gradient(ellipse at 30% 40%, #2a1442 0%, transparent 60%)",
          filter: "blur(60px)",
          animation: "aurora-drift-1 8s ease-in-out infinite",
        }}
      />
      {/* Layer 2 — mid purple drift */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          left: "-10%",
          width: "120%",
          height: "120%",
          background: "radial-gradient(ellipse at 70% 60%, #150830 0%, transparent 60%)",
          filter: "blur(60px)",
          animation: "aurora-drift-2 12s ease-in-out infinite",
        }}
      />
      {/* Layer 3 — faint gold hint */}
      <div
        style={{
          position: "absolute",
          top: "-15%",
          left: "-15%",
          width: "130%",
          height: "130%",
          background: "radial-gradient(ellipse at 50% 50%, rgba(245,200,66,0.03) 0%, transparent 50%)",
          filter: "blur(60px)",
          animation: "aurora-drift-3 16s ease-in-out infinite",
        }}
      />
    </div>
  );
}
