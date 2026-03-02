import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Plus, Play, BarChart3, Calendar, Pencil, Trash2 } from "lucide-react";
import { ConfirmModal } from "../components/ConfirmModal";
import { listQuizzes, deleteQuiz } from "../api/quizzes";
import { createSession } from "../api/sessions";

interface PendingDelete {
  id: string;
  title: string;
}

export function QuizListPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);

  const { data: quizzes = [], isLoading, isError } = useQuery({
    queryKey: ["quizzes"],
    queryFn: listQuizzes,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteQuiz,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      setPendingDelete(null);
    },
  });

  const hostMutation = useMutation({
    mutationFn: createSession,
    onSuccess: (data) => navigate(`/admin/host/${data.code}`),
  });

  return (
    <div>
      {pendingDelete && (
        <ConfirmModal
          title={`Delete "${pendingDelete.title}"?`}
          message="This cannot be undone."
          onConfirm={() => deleteMutation.mutate(pendingDelete.id)}
          onCancel={() => setPendingDelete(null)}
        />
      )}

      {/* Header */}
      <motion.div className="flex items-center justify-between mb-8" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-3xl font-black text-white">Game Library</h2>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link to="/admin/quizzes/new"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm"
            style={{ background: "linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%)", color: "white", boxShadow: "0 4px 20px rgba(255,107,53,0.4)" }}>
            <Plus className="w-4 h-4" />
            New Quiz
          </Link>
        </motion.div>
      </motion.div>

      {/* States */}
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
          <p style={{ color: "#f44336" }}>Failed to load quizzes.</p>
        </div>
      )}

      {!isLoading && !isError && quizzes.length === 0 && (
        <motion.div className="text-center py-16 rounded-2xl"
          style={{ background: "rgba(245,200,66,0.05)", border: "2px dashed rgba(245,200,66,0.3)" }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-lg text-white mb-2">No quizzes yet.</p>
          <Link to="/admin/quizzes/new" className="text-sm font-semibold" style={{ color: "#f5c842" }}>
            Create your first quiz →
          </Link>
        </motion.div>
      )}

      {/* Quiz grid */}
      {quizzes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {quizzes.map((quiz, i) => (
            <motion.div key={quiz.id}
              className="p-6 rounded-2xl relative overflow-hidden group cursor-pointer"
              style={{
                background: "linear-gradient(135deg, rgba(42,20,66,0.8) 0%, rgba(30,15,50,0.9) 100%)",
                border: "1px solid rgba(245,200,66,0.2)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ boxShadow: "0 8px 30px rgba(245,200,66,0.2)" }}>

              {/* Quiz info */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-white mb-2 pr-2 leading-snug">{quiz.title}</h3>
                <div className="flex items-center gap-4 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {quiz.questions != null && (
                    <div className="flex items-center gap-1">
                      <BarChart3 className="w-4 h-4" />
                      <span>{quiz.questions.length} questions</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(quiz.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4">
                <motion.button
                  onClick={() => hostMutation.mutate(quiz.id)}
                  disabled={hostMutation.isPending}
                  className="flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #f5c842 0%, #ffd700 100%)", color: "#1a0a2e" }}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Play className="w-4 h-4" />
                  Host
                </motion.button>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to={`/admin/quizzes/${quiz.id}/edit`}
                    className="p-2 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(33,150,243,0.2)", color: "#2196f3", border: "1px solid rgba(33,150,243,0.3)" }}>
                    <Pencil className="w-4 h-4" />
                  </Link>
                </motion.div>

                <motion.button
                  onClick={() => setPendingDelete({ id: quiz.id, title: quiz.title })}
                  disabled={deleteMutation.isPending}
                  aria-label="Delete"
                  className="p-2 rounded-lg flex items-center justify-center disabled:opacity-50"
                  style={{ background: "rgba(244,67,54,0.15)", color: "#f44336", border: "1px solid rgba(244,67,54,0.3)" }}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
