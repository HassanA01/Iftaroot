import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useGameAudio } from "../hooks/useGameAudio";

type Phase = "waiting" | "question" | "reveal" | "leaderboard" | "arc_transition" | "podium";

// Mock HTMLAudioElement
const createMockAudio = () => ({
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn(),
  volume: 1,
  muted: false,
  loop: false,
  currentTime: 0,
  paused: true,
  preload: "",
});

let audioInstances: ReturnType<typeof createMockAudio>[];

beforeEach(() => {
  audioInstances = [];
  // Must use a real function (not arrow) so it works with `new Audio()`
  globalThis.Audio = function MockAudio() {
    const mock = createMockAudio();
    audioInstances.push(mock);
    return mock;
  } as unknown as typeof Audio;
  localStorage.clear();
});

describe("useGameAudio", () => {
  it("creates 3 audio elements on mount", () => {
    renderHook(() => useGameAudio("waiting"));
    expect(audioInstances).toHaveLength(3);
  });

  it("plays loop on question phase", () => {
    const { rerender } = renderHook(({ phase }: { phase: Phase }) => useGameAudio(phase), {
      initialProps: { phase: "waiting" as Phase },
    });

    rerender({ phase: "question" });

    const loop = audioInstances[0];
    expect(loop.play).toHaveBeenCalled();
    expect(loop.loop).toBe(true);
    expect(loop.volume).toBe(0.3);
  });

  it("plays reveal sting on reveal phase", () => {
    const { rerender } = renderHook(({ phase }: { phase: Phase }) => useGameAudio(phase), {
      initialProps: { phase: "question" as Phase },
    });

    rerender({ phase: "reveal" });

    const reveal = audioInstances[1];
    expect(reveal.play).toHaveBeenCalled();
    expect(reveal.loop).toBe(false);
    expect(reveal.volume).toBe(0.5);
  });

  it("plays podium celebration on podium phase", () => {
    const { rerender } = renderHook(({ phase }: { phase: Phase }) => useGameAudio(phase), {
      initialProps: { phase: "question" as Phase },
    });

    rerender({ phase: "podium" });

    const podium = audioInstances[2];
    expect(podium.play).toHaveBeenCalled();
    expect(podium.loop).toBe(true);
    expect(podium.volume).toBe(0.3);
  });

  it("does not replay reveal sting on re-render with same phase", () => {
    const { rerender } = renderHook(({ phase }: { phase: Phase }) => useGameAudio(phase), {
      initialProps: { phase: "question" as Phase },
    });

    rerender({ phase: "reveal" });
    const reveal = audioInstances[1];
    expect(reveal.play).toHaveBeenCalledTimes(1);

    // Re-render with same phase — should NOT play again
    rerender({ phase: "reveal" });
    expect(reveal.play).toHaveBeenCalledTimes(1);
  });

  it("toggleMute flips muted state and persists to localStorage", () => {
    const { result } = renderHook(() => useGameAudio("waiting"));

    expect(result.current.muted).toBe(false);

    act(() => result.current.toggleMute());
    expect(result.current.muted).toBe(true);
    expect(localStorage.getItem("hilal_audio_muted")).toBe("true");

    act(() => result.current.toggleMute());
    expect(result.current.muted).toBe(false);
    expect(localStorage.getItem("hilal_audio_muted")).toBe("false");
  });

  it("initializes muted state from localStorage", () => {
    localStorage.setItem("hilal_audio_muted", "true");
    const { result } = renderHook(() => useGameAudio("waiting"));
    expect(result.current.muted).toBe(true);
  });

  it("sets muted property on all audio elements", () => {
    const { result } = renderHook(() => useGameAudio("waiting"));

    act(() => result.current.toggleMute());

    for (const audio of audioInstances) {
      expect(audio.muted).toBe(true);
    }
  });

  it("resets sting flags when question phase starts again", () => {
    const { rerender } = renderHook(({ phase }: { phase: Phase }) => useGameAudio(phase), {
      initialProps: { phase: "question" as Phase },
    });

    // Play reveal
    rerender({ phase: "reveal" });
    expect(audioInstances[1].play).toHaveBeenCalledTimes(1);

    // New question cycle
    rerender({ phase: "question" });

    // Play reveal again — should work because flags were reset
    rerender({ phase: "reveal" });
    expect(audioInstances[1].play).toHaveBeenCalledTimes(2);
  });

  it("cleans up audio on unmount", () => {
    const { unmount } = renderHook(() => useGameAudio("question"));

    unmount();

    for (const audio of audioInstances) {
      expect(audio.pause).toHaveBeenCalled();
    }
  });
});
