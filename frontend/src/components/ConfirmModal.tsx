import { motion } from "motion/react";

interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
}

export function ConfirmModal({ title, message, onConfirm, onCancel, confirmLabel = "Delete" }: ConfirmModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.7)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <motion.div
        className="w-full max-w-sm mx-4 rounded-2xl p-6"
        style={{
          background: "linear-gradient(135deg, rgba(42,20,66,0.98) 0%, rgba(26,10,46,0.99) 100%)",
          border: "1px solid rgba(245,200,66,0.3)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(245,200,66,0.05)",
        }}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <h2 id="confirm-modal-title" className="text-lg font-bold text-white mb-2">
          {title}
        </h2>
        <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>{message}</p>
        <div className="flex justify-end gap-3">
          <motion.button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold rounded-lg transition"
            style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.15)" }}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          >
            Cancel
          </motion.button>
          <motion.button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-semibold text-white rounded-lg transition"
            style={{ background: "rgba(244,67,54,0.2)", color: "#f44336", border: "1px solid rgba(244,67,54,0.4)" }}
            whileHover={{ scale: 1.02, background: "rgba(244,67,54,0.3)" }} whileTap={{ scale: 0.98 }}
          >
            {confirmLabel}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
