import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Calendar, Users, Hash, ExternalLink, Trash2 } from "lucide-react";
import { ConfirmModal } from "../components/ConfirmModal";
import { listSessions, endSession } from "../api/sessions";
import type { GameStatus } from "../types";

const STATUS_STYLES: Record<GameStatus, { bg: string; color: string; label: string }> = {
  waiting: { bg: "rgba(245,200,66,0.15)", color: "#f5c842", label: "waiting" },
  active: { bg: "rgba(76,175,80,0.15)", color: "#4caf50", label: "active" },
  finished: { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)", label: "finished" },
};

function StatusBadge({ status }: { status: GameStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ background: s.bg, color: s.color }}>
      {s.label}
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

      <motion.h2 className="text-3xl font-black text-white mb-8" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        Session History
      </motion.h2>

      {isLoading && (
        <div className="flex gap-3 justify-center py-12">
          {[0, 1, 2].map((i) => (
            <motion.div key={i} className="w-3 h-3 rounded-full" style={{ background: "#f5c842" }}
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
          ))}
        </div>
      )}

      {isError && (
        <div className="text-center py-12 rounded-2xl" style={{ background: "rgba(244,67,54,0.1)", border: "1px solid rgba(244,67,54,0.3)" }}>
          <p style={{ color: "#f44336" }}>Failed to load session history.</p>
        </div>
      )}

      {!isLoading && !isError && sessions.length === 0 && (
        <motion.div className="text-center py-16 rounded-2xl"
          style={{ background: "rgba(245,200,66,0.05)", border: "2px dashed rgba(245,200,66,0.3)" }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-lg text-white mb-1">No sessions yet.</p>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Host a game from the Quizzes page to get started.</p>
        </motion.div>
      )}

      {sessions.length > 0 && (
        <div className="space-y-3">
          {sessions.map((s, i) => (
            <motion.div key={s.id}
              className="px-4 sm:px-5 py-4 rounded-2xl flex items-start sm:items-center gap-3 sm:gap-4"
              style={{
                background: "linear-gradient(135deg, rgba(42,20,66,0.7) 0%, rgba(30,15,50,0.8) 100%)",
                border: "1px solid rgba(245,200,66,0.12)",
              }}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>

              {/* Quiz title + meta */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white truncate">{s.quiz_title}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                  <div className="flex items-center gap-1 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                    <Hash className="w-3 h-3" />
                    <span className="font-mono">{s.code}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(s.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                    <Users className="w-3 h-3" />
                    <span>{s.player_count}</span>
                  </div>
                </div>
              </div>

              {/* Status + actions — stacked on mobile, inline on sm+ */}
              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 flex-shrink-0">
                <StatusBadge status={s.status} />
                {s.status === "waiting" && (
                  <div className="flex items-center gap-2">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link to={`/admin/host/${s.code}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
                        style={{ background: "rgba(245,200,66,0.15)", color: "#f5c842", border: "1px solid rgba(245,200,66,0.3)" }}>
                        <ExternalLink className="w-3.5 h-3.5" />
                        Resume
                      </Link>
                    </motion.div>
                    <motion.button
                      onClick={() => setPendingDelete(s.id)}
                      disabled={deleteMutation.isPending}
                      aria-label="Delete"
                      className="p-1.5 rounded-lg transition disabled:opacity-50"
                      style={{ background: "rgba(244,67,54,0.1)", color: "#f44336", border: "1px solid rgba(244,67,54,0.25)" }}
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
