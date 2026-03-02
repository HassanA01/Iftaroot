import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PrayerArcTransition } from "../components/PrayerArcTransition";

describe("PrayerArcTransition", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders all 5 prayer labels", () => {
    render(<PrayerArcTransition onComplete={vi.fn()} />);
    expect(screen.getByText("Fajr")).toBeInTheDocument();
    expect(screen.getByText("Dhuhr")).toBeInTheDocument();
    expect(screen.getByText("Asr")).toBeInTheDocument();
    expect(screen.getByText("Maghrib")).toBeInTheDocument();
    expect(screen.getByText("Isha")).toBeInTheDocument();
  });

  it("calls onComplete after 1600ms", () => {
    const onComplete = vi.fn();
    render(<PrayerArcTransition onComplete={onComplete} />);
    expect(onComplete).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1600);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("does not call onComplete before animation ends", () => {
    const onComplete = vi.fn();
    render(<PrayerArcTransition onComplete={onComplete} />);
    act(() => {
      vi.advanceTimersByTime(1599);
    });
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("lights up all 5 dots by the end of the animation", () => {
    const { container } = render(<PrayerArcTransition onComplete={vi.fn()} />);
    act(() => { vi.advanceTimersByTime(1500); });
    const circles = container.querySelectorAll("circle");
    circles.forEach((c) => expect(c.getAttribute("fill")).toBe("#f5c842"));
  });

  it("does not call onComplete after unmount", () => {
    const onComplete = vi.fn();
    const { unmount } = render(<PrayerArcTransition onComplete={onComplete} />);
    unmount();
    act(() => { vi.advanceTimersByTime(2000); });
    expect(onComplete).not.toHaveBeenCalled();
  });
});
