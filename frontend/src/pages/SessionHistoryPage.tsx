import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { listSessions, endSession } from "../api/sessions";
import { ConfirmModal } from "../components/ConfirmModal";
import type { GameStatus } from "../types";

function statusBadge(status: GameStatus) {
  const styles: Record<GameStatus, string> = {
    waiting: "bg-yellow-900/40 text-yellow-400",
    active: "bg-green-900/40 text-green-400",
    finished: "bg-gray-800 text-gray-400",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[status]}`}>
      {status}
    </span>
  );
}

export function SessionHistoryPage() {
  const queryClient = useQueryClient();
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const { data: sessions = [], isLoading, isError } = useQuery({
    queryKey: ["sessions"],
    queryFn: () => listSessions(),
  });

  const deleteMutation = useMutation({
    mutationFn: endSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      setPendingDelete(null);
    },
  });

  return (
    <div>
      {pendingDelete && (
        <ConfirmModal
          title="Delete this session?"
          message="This cannot be undone."
          onConfirm={() => deleteMutation.mutate(pendingDelete)}
          onCancel={() => setPendingDelete(null)}
        />
      )}
      <h2 className="text-2xl font-bold mb-6">Session History</h2>

      {isLoading && <p className="text-gray-400">Loading…</p>}
      {isError && <p className="text-red-400">Failed to load session history.</p>}

      {!isLoading && !isError && sessions.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">No sessions yet.</p>
          <p className="mt-1 text-sm">Host a game from the Quizzes page to get started.</p>
        </div>
      )}

      {sessions.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-800">
                <th className="pb-3 pr-6 font-medium">Quiz</th>
                <th className="pb-3 pr-6 font-medium">Code</th>
                <th className="pb-3 pr-6 font-medium">Date</th>
                <th className="pb-3 pr-6 font-medium">Players</th>
                <th className="pb-3 pr-6 font-medium">Status</th>
                <th className="pb-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {sessions.map((s) => (
                <tr key={s.id} className="text-gray-300">
                  <td className="py-3 pr-6 font-medium text-white">{s.quiz_title}</td>
                  <td className="py-3 pr-6 font-mono">{s.code}</td>
                  <td className="py-3 pr-6 text-gray-400">
                    {new Date(s.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 pr-6">{s.player_count}</td>
                  <td className="py-3 pr-6">{statusBadge(s.status)}</td>
                  <td className="py-3">
                    {s.status === "waiting" && (
                      <div className="flex items-center gap-5">
                        <Link
                          to={`/admin/host/${s.code}`}
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition"
                        >
                          Resume →
                        </Link>
                        <button
                          onClick={() => setPendingDelete(s.id)}
                          disabled={deleteMutation.isPending}
                          className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50 transition"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
