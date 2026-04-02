import type { Variants } from "motion/react";

/** Cinematic enter: scale up from slightly smaller + blur clear */
export const cinematicEnter: Variants = {
  hidden: { opacity: 0, scale: 0.95, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    filter: "blur(4px)",
    transition: { duration: 0.3, ease: "easeIn" },
  },
};

/** Staggered container — use on parent, children use cinematicEnter */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05 },
  },
};

/** Slide up with fade */
export const slideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

/** Card hover spring config — used by TiltCard reset */
export const tiltSpring = { type: "spring" as const, stiffness: 300, damping: 20 };
