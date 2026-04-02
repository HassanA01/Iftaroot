import "@testing-library/jest-dom";
import { vi } from "vitest";

// canvas-confetti uses HTMLCanvasElement.getContext() which jsdom doesn't support.
vi.mock("canvas-confetti", () => ({ default: vi.fn() }));

// jsdom doesn't support window.matchMedia — mock it for useMobileDetect hook.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock tsParticles — not available in jsdom.
vi.mock("@tsparticles/react", () => ({
  default: () => null,
  __esModule: true,
  initParticlesEngine: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@tsparticles/slim", () => ({
  loadSlim: vi.fn(),
}));
