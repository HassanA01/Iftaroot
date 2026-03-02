import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useWebSocket } from "../hooks/useWebSocket";
import type { WsMessage } from "../types";

// Capture the WebSocket instance created by the hook so we can assert on it.
let lastWsInstance: MockWebSocket | null = null;

class MockWebSocket {
  close = vi.fn();
  send = vi.fn();
  readyState = 1; // OPEN
  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: ((e: Event) => void) | null = null;
  onmessage: ((e: MessageEvent) => void) | null = null;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    lastWsInstance = this;
  }
}

const noop = (_: WsMessage) => {};

describe("useWebSocket", () => {
  beforeEach(() => {
    lastWsInstance = null;
    vi.stubGlobal("WebSocket", MockWebSocket);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("registers a pagehide listener that closes the socket", () => {
    const addSpy = vi.spyOn(window, "addEventListener");

    renderHook(() =>
      useWebSocket({ url: "ws://test/socket", onMessage: noop, enabled: true }),
    );

    const pagehideCall = addSpy.mock.calls.find((c) => c[0] === "pagehide");
    expect(pagehideCall).toBeDefined();

    window.dispatchEvent(new Event("pagehide"));
    expect(lastWsInstance!.close).toHaveBeenCalled();

    addSpy.mockRestore();
  });

  it("removes the pagehide listener on cleanup", () => {
    const removeSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() =>
      useWebSocket({ url: "ws://test/socket", onMessage: noop, enabled: true }),
    );

    unmount();

    const removedPagehide = removeSpy.mock.calls.find(
      (c) => c[0] === "pagehide",
    );
    expect(removedPagehide).toBeDefined();

    removeSpy.mockRestore();
  });

  it("closes the socket on component unmount", () => {
    const { unmount } = renderHook(() =>
      useWebSocket({ url: "ws://test/socket", onMessage: noop, enabled: true }),
    );

    unmount();
    expect(lastWsInstance!.close).toHaveBeenCalled();
  });

  it("does not open a socket when enabled=false", () => {
    renderHook(() =>
      useWebSocket({
        url: "ws://test/socket",
        onMessage: noop,
        enabled: false,
      }),
    );

    expect(lastWsInstance).toBeNull();
  });
});
