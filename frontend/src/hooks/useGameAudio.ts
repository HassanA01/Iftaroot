import { useEffect, useRef, useState, useCallback } from "react";

type GamePhase = "waiting" | "question" | "reveal" | "leaderboard" | "arc_transition" | "podium";

const FADE_MS = 500;
const LOOP_VOLUME = 0.3;
const STING_VOLUME = 0.5;

function fadeOut(audio: HTMLAudioElement, duration = FADE_MS): Promise<void> {
  return new Promise((resolve) => {
    const start = audio.volume;
    if (start <= 0 || audio.paused) {
      resolve();
      return;
    }
    const step = start / (duration / 16);
    const id = setInterval(() => {
      const next = audio.volume - step;
      if (next <= 0) {
        clearInterval(id);
        audio.volume = 0;
        audio.pause();
        resolve();
      } else {
        audio.volume = next;
      }
    }, 16);
  });
}

function playAudio(audio: HTMLAudioElement, volume: number, loop: boolean) {
  audio.volume = volume;
  audio.loop = loop;
  audio.currentTime = 0;
  audio.play().catch(() => {
    // Autoplay blocked — will play on next user interaction
  });
}

export function useGameAudio(phase: GamePhase) {
  const [muted, setMuted] = useState(() => localStorage.getItem("hilal_audio_muted") === "true");

  const loopRef = useRef<HTMLAudioElement | null>(null);
  const revealRef = useRef<HTMLAudioElement | null>(null);
  const podiumRef = useRef<HTMLAudioElement | null>(null);

  // Track which phase we already played a sting for (prevent re-triggers on re-renders)
  const playedRevealRef = useRef(false);
  const playedPodiumRef = useRef(false);

  // Initialize audio elements once
  useEffect(() => {
    loopRef.current = new Audio("/audio/question-loop.mp3");
    revealRef.current = new Audio("/audio/reveal-sting.mp3");
    podiumRef.current = new Audio("/audio/podium-celebration.mp3");

    loopRef.current.preload = "auto";
    revealRef.current.preload = "auto";
    podiumRef.current.preload = "auto";

    return () => {
      loopRef.current?.pause();
      revealRef.current?.pause();
      podiumRef.current?.pause();
    };
  }, []);

  // Sync muted state to localStorage and audio elements
  useEffect(() => {
    localStorage.setItem("hilal_audio_muted", String(muted));
    if (loopRef.current) loopRef.current.muted = muted;
    if (revealRef.current) revealRef.current.muted = muted;
    if (podiumRef.current) podiumRef.current.muted = muted;
  }, [muted]);

  // Phase-driven audio logic
  useEffect(() => {
    const loop = loopRef.current;
    const reveal = revealRef.current;
    const podium = podiumRef.current;
    if (!loop || !reveal || !podium) return;

    switch (phase) {
      case "question":
        // Reset sting flags for new question cycle
        playedRevealRef.current = false;
        playedPodiumRef.current = false;
        playAudio(loop, LOOP_VOLUME, true);
        break;
      case "reveal":
        fadeOut(loop);
        if (!playedRevealRef.current) {
          playedRevealRef.current = true;
          playAudio(reveal, STING_VOLUME, false);
        }
        break;
      case "podium":
        fadeOut(loop);
        if (!playedPodiumRef.current) {
          playedPodiumRef.current = true;
          playAudio(podium, LOOP_VOLUME, true);
        }
        break;
      default:
        // leaderboard, arc_transition, waiting — silence
        if (!loop.paused) fadeOut(loop);
        break;
    }
  }, [phase]);

  const toggleMute = useCallback(() => setMuted((m) => !m), []);

  return { muted, toggleMute };
}
