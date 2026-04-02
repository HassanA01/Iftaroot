import { useMemo } from "react";

type IntensityTier = "calm" | "building" | "intense";

interface GameIntensity {
  ratio: number;
  tier: IntensityTier;
  particleSpeed: number;
  particleMultiplier: number;
  transitionDuration: number;
  transitionEase: string;
  timerPulseScale: number;
  showEdgeGlow: boolean;
  correctBurstCount: number;
  wrongShakeAmplitude: number;
  floatingDensity: "sparse" | "normal" | "dense";
  isCalm: boolean;
  isBuilding: boolean;
  isIntense: boolean;
}

export function useGameIntensity(
  questionIndex: number | undefined,
  totalQuestions: number | undefined,
): GameIntensity {
  return useMemo(() => {
    if (questionIndex == null || totalQuestions == null || totalQuestions === 0) {
      return makeIntensity(0);
    }
    const ratio = questionIndex / totalQuestions;
    return makeIntensity(ratio);
  }, [questionIndex, totalQuestions]);
}

function makeIntensity(ratio: number): GameIntensity {
  if (ratio < 0.34) {
    return {
      ratio,
      tier: "calm",
      particleSpeed: 1,
      particleMultiplier: 1,
      transitionDuration: 500,
      transitionEase: "easeOut",
      timerPulseScale: 1.0,
      showEdgeGlow: false,
      correctBurstCount: 0,
      wrongShakeAmplitude: 2,
      floatingDensity: "sparse",
      isCalm: true,
      isBuilding: false,
      isIntense: false,
    };
  }
  if (ratio < 0.67) {
    return {
      ratio,
      tier: "building",
      particleSpeed: 2,
      particleMultiplier: 1.5,
      transitionDuration: 350,
      transitionEase: "easeOut",
      timerPulseScale: 1.02,
      showEdgeGlow: false,
      correctBurstCount: 15,
      wrongShakeAmplitude: 4,
      floatingDensity: "normal",
      isCalm: false,
      isBuilding: true,
      isIntense: false,
    };
  }
  return {
    ratio,
    tier: "intense",
    particleSpeed: 3.3,
    particleMultiplier: 2,
    transitionDuration: 200,
    transitionEase: "easeOut",
    timerPulseScale: 1.05,
    showEdgeGlow: true,
    correctBurstCount: 30,
    wrongShakeAmplitude: 6,
    floatingDensity: "dense",
    isCalm: false,
    isBuilding: false,
    isIntense: true,
  };
}
