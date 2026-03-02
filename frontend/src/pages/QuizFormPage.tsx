import { useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Plus, Trash2, Check } from "lucide-react";
import { CrescentIcon } from "../components/icons";
import { getQuiz, createQuiz, updateQuiz } from "../api/quizzes";
import type { Quiz } from "../types";
import type { QuestionInput } from "../api/quizzes";

interface OptionDraft {
  text: string;
  is_correct: boolean;
}

interface QuestionDraft {
  text: string;
  time_limit: number;
  options: OptionDraft[];
}

function blankOption(): OptionDraft {
  return { text: "", is_correct: false };
}

function blankQuestion(): QuestionDraft {
  return { text: "", time_limit: 20, options: [blankOption(), blankOption()] };
}

const OPTION_COLORS = ["#4caf50", "#2196f3", "#ff6b35", "#f44336"];
const OPTION_LETTERS = ["A", "B", "C", "D"];

// ── Inner form ────────────────────────────────────────────────────────────────

interface QuizFormProps {
  quizID?: string;
  initial: { title: string; questions: QuestionDraft[] };
}

function QuizForm({ quizID, initial }: QuizFormProps) {
  const isEdit = !!quizID;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState(initial.title);
  const [questions, setQuestions] = useState<QuestionDraft[]>(initial.questions);
  const [formError, setFormError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (input: { title: string; questions: QuestionInput[] }) =>
      isEdit ? updateQuiz(quizID!, input) : createQuiz(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      if (isEdit) queryClient.invalidateQueries({ queryKey: ["quiz", quizID] });
      navigate("/admin/quizzes");
    },
  });

  function validate(): string | null {
    if (!title.trim()) return "Quiz title is required.";
    if (questions.length === 0) return "Add at least one question.";
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) return `Question ${i + 1} needs text.`;
      if (q.options.length < 2 || q.options.length > 4)
        return `Question ${i + 1} must have 2–4 options.`;
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].text.trim())
          return `Question ${i + 1}, option ${j + 1} needs text.`;
      }
      if (q.options.filter((o) => o.is_correct).length !== 1)
        return `Question ${i + 1} must have exactly one correct option.`;
    }
    return null;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) { setFormError(err); return; }
    setFormError(null);
    mutation.mutate({
      title: title.trim(),
      questions: questions.map((q, i) => ({
        text: q.text.trim(),
        time_limit: q.time_limit,
        order: i + 1,
        options: q.options.map((o) => ({ text: o.text.trim(), is_correct: o.is_correct })),
      })),
    });
  }

  function updateQuestion(idx: number, patch: Partial<QuestionDraft>) {
    setQuestions((qs) => qs.map((q, i) => (i === idx ? { ...q, ...patch } : q)));
  }
  function addQuestion() { setQuestions((qs) => [...qs, blankQuestion()]); }
  function removeQuestion(idx: number) { setQuestions((qs) => qs.filter((_, i) => i !== idx)); }
  function updateOption(qIdx: number, oIdx: number, patch: Partial<OptionDraft>) {
    setQuestions((qs) => qs.map((q, i) =>
      i !== qIdx ? q : { ...q, options: q.options.map((o, j) => (j === oIdx ? { ...o, ...patch } : o)) }
    ));
  }
  function setCorrect(qIdx: number, oIdx: number) {
    setQuestions((qs) => qs.map((q, i) =>
      i !== qIdx ? q : { ...q, options: q.options.map((o, j) => ({ ...o, is_correct: j === oIdx })) }
    ));
  }
  function addOption(qIdx: number) {
    setQuestions((qs) => qs.map((q, i) => (i !== qIdx ? q : { ...q, options: [...q.options, blankOption()] })));
  }
  function removeOption(qIdx: number, oIdx: number) {
    setQuestions((qs) => qs.map((q, i) =>
      i !== qIdx ? q : { ...q, options: q.options.filter((_, j) => j !== oIdx) }
    ));
  }

  const inputStyle = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(245,200,66,0.2)",
    color: "white",
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <motion.div className="flex items-center gap-3 mb-8" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <CrescentIcon className="w-6 h-6" style={{ color: "#f5c842" }} />
        <h2 className="text-2xl font-black text-white">{isEdit ? "Edit quiz" : "New quiz"}</h2>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <label className="block text-sm font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.7)" }}>Quiz title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-sm outline-none transition"
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "rgba(245,200,66,0.6)")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(245,200,66,0.2)")}
            placeholder="e.g. General Knowledge"
          />
        </motion.div>

        {/* Questions */}
        <div className="space-y-4">
          {questions.map((q, qIdx) => (
            <motion.div key={qIdx}
              className="p-5 rounded-2xl space-y-4"
              style={{ background: "linear-gradient(135deg, rgba(42,20,66,0.8) 0%, rgba(30,15,50,0.9) 100%)", border: "1px solid rgba(245,200,66,0.15)" }}
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: qIdx * 0.04 }}>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{ background: "rgba(245,200,66,0.2)", color: "#f5c842" }}>
                    {qIdx + 1}
                  </div>
                  <span className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>Question {qIdx + 1}</span>
                </div>
                {questions.length > 1 && (
                  <button type="button" onClick={() => removeQuestion(qIdx)} aria-label="Remove"
                    className="p-1.5 rounded-lg transition" style={{ color: "#f44336", background: "rgba(244,67,54,0.1)" }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <input
                type="text"
                required
                value={q.text}
                onChange={(e) => updateQuestion(qIdx, { text: e.target.value })}
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "rgba(245,200,66,0.6)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(245,200,66,0.2)")}
                placeholder="Question text"
              />

              <div className="flex items-center gap-3">
                <label className="text-xs whitespace-nowrap" style={{ color: "rgba(255,255,255,0.5)" }}>Time limit (s)</label>
                <input
                  type="number"
                  min={5}
                  max={120}
                  value={q.time_limit}
                  onChange={(e) => updateQuestion(qIdx, { time_limit: Number(e.target.value) })}
                  className="w-20 rounded-lg px-3 py-1.5 text-sm outline-none transition"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(245,200,66,0.6)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(245,200,66,0.2)")}
                />
              </div>

              {/* Options */}
              <div className="space-y-2">
                {q.options.map((o, oIdx) => {
                  const color = OPTION_COLORS[oIdx % 4];
                  return (
                    <div key={oIdx} className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setCorrect(qIdx, oIdx)}
                        className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 transition"
                        style={{
                          background: o.is_correct ? color : `${color}22`,
                          border: `2px solid ${o.is_correct ? color : `${color}44`}`,
                          color: o.is_correct ? "white" : color,
                        }}
                        title="Mark as correct">
                        {o.is_correct ? <Check className="w-4 h-4" /> : OPTION_LETTERS[oIdx]}
                      </button>
                      <input
                        type="text"
                        required
                        value={o.text}
                        onChange={(e) => updateOption(qIdx, oIdx, { text: e.target.value })}
                        className="flex-1 rounded-xl px-3 py-2 text-sm outline-none transition"
                        style={inputStyle}
                        onFocus={(e) => (e.target.style.borderColor = color)}
                        onBlur={(e) => (e.target.style.borderColor = "rgba(245,200,66,0.2)")}
                        placeholder={`Option ${oIdx + 1}`}
                      />
                      {q.options.length > 2 && (
                        <button type="button" onClick={() => removeOption(qIdx, oIdx)}
                          className="p-1.5 rounded-lg transition shrink-0" style={{ color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.05)" }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
                {q.options.length < 4 && (
                  <button type="button" onClick={() => addOption(qIdx)}
                    className="text-xs font-medium transition mt-1 flex items-center gap-1"
                    style={{ color: "#f5c842" }}>
                    <Plus className="w-3 h-3" /> Add option
                  </button>
                )}
              </div>
            </motion.div>
          ))}

          <motion.button
            type="button"
            onClick={addQuestion}
            className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition"
            style={{ border: "2px dashed rgba(245,200,66,0.3)", color: "rgba(245,200,66,0.7)" }}
            whileHover={{ borderColor: "rgba(245,200,66,0.6)", color: "#f5c842" }}>
            <Plus className="w-4 h-4" /> Add question
          </motion.button>
        </div>

        {(formError || mutation.isError) && (
          <div className="text-sm rounded-xl px-4 py-3"
            style={{ background: "rgba(244,67,54,0.1)", border: "1px solid rgba(244,67,54,0.3)", color: "#f44336" }}>
            {formError ??
              (mutation.error as { response?: { data?: { error?: string } } })?.response?.data?.error ??
              "Something went wrong. Please try again."}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <motion.button
            type="submit"
            disabled={mutation.isPending}
            className="px-6 py-2.5 rounded-xl font-bold text-sm text-white disabled:cursor-not-allowed"
            style={{
              background: mutation.isPending ? "rgba(255,107,53,0.4)" : "linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%)",
              boxShadow: mutation.isPending ? "none" : "0 6px 20px rgba(255,107,53,0.35)",
            }}
            whileHover={!mutation.isPending ? { scale: 1.02 } : {}}
            whileTap={!mutation.isPending ? { scale: 0.98 } : {}}>
            {mutation.isPending ? "Saving…" : isEdit ? "Save changes" : "Create quiz"}
          </motion.button>
          <button type="button" onClick={() => navigate("/admin/quizzes")}
            className="text-sm transition" style={{ color: "rgba(255,255,255,0.4)" }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Page wrapper ──────────────────────────────────────────────────────────────

function quizToInitial(quiz: Quiz) {
  return {
    title: quiz.title,
    questions:
      quiz.questions && quiz.questions.length > 0
        ? quiz.questions.map((q) => ({
            text: q.text,
            time_limit: q.time_limit,
            options: q.options.map((o) => ({ text: o.text, is_correct: !!o.is_correct })),
          }))
        : [blankQuestion()],
  };
}

export function QuizFormPage() {
  const { quizID } = useParams<{ quizID: string }>();
  const isEdit = !!quizID;

  const { data: existing, isLoading, isError } = useQuery({
    queryKey: ["quiz", quizID],
    queryFn: () => getQuiz(quizID!),
    enabled: isEdit,
  });

  if (isEdit && isLoading) {
    return (
      <div className="flex gap-3 justify-center py-12">
        {[0, 1, 2].map((i) => (
          <motion.div key={i} className="w-3 h-3 rounded-full" style={{ background: "#f5c842" }}
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
        ))}
      </div>
    );
  }

  if (isEdit && (isError || !existing)) {
    return <p className="text-center py-12" style={{ color: "#f44336" }}>Quiz not found.</p>;
  }

  const initial = existing
    ? quizToInitial(existing)
    : { title: "", questions: [blankQuestion()] };

  return <QuizForm quizID={quizID} initial={initial} />;
}
