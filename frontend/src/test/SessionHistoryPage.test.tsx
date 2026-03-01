import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionHistoryPage } from "../pages/SessionHistoryPage";
import * as sessionsApi from "../api/sessions";
import type { SessionSummary } from "../types";

vi.mock("../api/sessions", () => ({ listSessions: vi.fn() }));

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={["/admin/history"]}>
        <Routes>
          <Route path="/admin/history" element={<SessionHistoryPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

const fakeSessions: SessionSummary[] = [
  {
    id: "s1",
    quiz_id: "q1",
    quiz_title: "Ramadan Trivia",
    code: "123456",
    status: "finished",
    player_count: 8,
    created_at: "2026-03-01T18:00:00Z",
  },
  {
    id: "s2",
    quiz_id: "q1",
    quiz_title: "Ramadan Trivia",
    code: "654321",
    status: "active",
    player_count: 3,
    created_at: "2026-03-02T18:00:00Z",
  },
];

describe("SessionHistoryPage", () => {
  it("shows empty state when no sessions", async () => {
    vi.mocked(sessionsApi.listSessions).mockResolvedValue([]);
    renderPage();
    expect(await screen.findByText(/no sessions yet/i)).toBeInTheDocument();
  });

  it("shows session rows when data loads", async () => {
    vi.mocked(sessionsApi.listSessions).mockResolvedValue(fakeSessions);
    renderPage();
    // Two sessions share the same quiz title — use findAllByText
    expect(await screen.findAllByText("Ramadan Trivia")).toHaveLength(2);
    expect(screen.getByText("123456")).toBeInTheDocument();
    expect(screen.getByText("654321")).toBeInTheDocument();
  });

  it("shows player counts", async () => {
    vi.mocked(sessionsApi.listSessions).mockResolvedValue(fakeSessions);
    renderPage();
    await screen.findAllByText("Ramadan Trivia");
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("shows status badges", async () => {
    vi.mocked(sessionsApi.listSessions).mockResolvedValue(fakeSessions);
    renderPage();
    await screen.findAllByText("Ramadan Trivia");
    expect(screen.getByText("finished")).toBeInTheDocument();
    expect(screen.getByText("active")).toBeInTheDocument();
  });

  it("shows error state on fetch failure", async () => {
    vi.mocked(sessionsApi.listSessions).mockRejectedValue(new Error("network error"));
    renderPage();
    expect(await screen.findByText(/failed to load session history/i)).toBeInTheDocument();
  });
});
