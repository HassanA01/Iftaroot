import { useRef, type ReactNode, type CSSProperties } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useIsMobile } from "../hooks/useMobileDetect";
import { tiltSpring } from "../lib/animations";

interface TiltCardProps {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  /** Max rotation in degrees. Default 8. */
  maxRotation?: number;
  /** Whether to show the gold shine overlay. Default true. */
  shine?: boolean;
}

export function TiltCard({
  children,
  style,
  className,
  maxRotation = 8,
  shine = true,
}: TiltCardProps) {
  const isMobile = useIsMobile();
  const ref = useRef<HTMLDivElement>(null);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const shineX = useMotionValue(50);
  const shineY = useMotionValue(50);

  const springX = useSpring(rotateX, tiltSpring);
  const springY = useSpring(rotateY, tiltSpring);

  function handleMouseMove(e: React.MouseEvent) {
    if (!ref.current || isMobile) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const percentX = (e.clientX - centerX) / (rect.width / 2);
    const percentY = (e.clientY - centerY) / (rect.height / 2);

    rotateY.set(percentX * maxRotation);
    rotateX.set(-percentY * maxRotation);
    shineX.set(((e.clientX - rect.left) / rect.width) * 100);
    shineY.set(((e.clientY - rect.top) / rect.height) * 100);
  }

  function handleMouseLeave() {
    rotateX.set(0);
    rotateY.set(0);
    shineX.set(50);
    shineY.set(50);
  }

  if (isMobile) {
    return (
      <div style={style} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 1000,
        rotateX: springX,
        rotateY: springY,
        transformStyle: "preserve-3d",
        position: "relative",
        ...style,
      }}
      className={className}
    >
      {children}
      {shine && (
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "inherit",
            pointerEvents: "none",
            background: `radial-gradient(circle at ${shineX.get()}% ${shineY.get()}%, rgba(245,200,66,0.08) 0%, transparent 60%)`,
          }}
          aria-hidden="true"
        />
      )}
    </motion.div>
  );
}
