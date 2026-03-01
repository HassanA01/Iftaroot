import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listQuizzes, deleteQuiz } from "../api/quizzes";
import { createSession } from "../api/sessions";
import { ConfirmModal } from "../components/ConfirmModal";

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

  function handleDeleteClick(id: string, title: string) {
    setPendingDelete({ id, title });
  }

  function handleConfirmDelete() {
    if (pendingDelete) {
      deleteMutation.mutate(pendingDelete.id);
    }
  }

  function handleCancelDelete() {
    setPendingDelete(null);
  }

  return (
    <div>
      {pendingDelete && (
        <ConfirmModal
          title={`Delete "${pendingDelete.title}"?`}
          message="This cannot be undone."
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Quizzes</h2>
        <Link
          to="/admin/quizzes/new"
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
        >
          + New quiz
        </Link>
      </div>

      {isLoading && <p className="text-gray-400">Loading…</p>}
      {isError && <p className="text-red-400">Failed to load quizzes.</p>}

      {!isLoading && !isError && quizzes.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">No quizzes yet.</p>
          <p className="mt-1 text-sm">
            <Link to="/admin/quizzes/new" className="text-indigo-400 hover:text-indigo-300">
              Create your first quiz
            </Link>
          </p>
        </div>
      )}

      {quizzes.length > 0 && (
        <ul className="space-y-3">
          {quizzes.map((quiz) => (
            <li
              key={quiz.id}
              className="bg-gray-900 rounded-xl px-5 py-4 flex items-center justify-between gap-4"
            >
              <div>
                <p className="font-semibold text-white">{quiz.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {new Date(quiz.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => hostMutation.mutate(quiz.id)}
                  disabled={hostMutation.isPending}
                  className="text-sm text-green-400 hover:text-green-300 disabled:opacity-50 font-semibold transition"
                >
                  Host
                </button>
                <Link
                  to={`/admin/quizzes/${quiz.id}/edit`}
                  className="text-sm text-indigo-400 hover:text-indigo-300 transition"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDeleteClick(quiz.id, quiz.title)}
                  disabled={deleteMutation.isPending}
                  className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50 transition"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
