import { Outlet, useNavigate, NavLink, useMatch } from "react-router-dom";
import { motion } from "motion/react";
import { CrescentIcon, LanternIcon } from "../components/icons";
import { useAuthStore } from "../stores/authStore";
import { useGameStore } from "../stores/gameStore";
import { endSession } from "../api/sessions";

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const { admin, clearAuth } = useAuthStore();
  const { activeSession, clearActiveSession } = useGameStore();

  const gameMatch = useMatch("/admin/game/:code");
  const isHostingGame = !!gameMatch;

  function handleLogout() {
    clearAuth();
    navigate("/login", { replace: true });
  }

  async function handleEndGame() {
    if (!activeSession) return;
    try {
      await endSession(activeSession.sessionId);
    } finally {
      clearActiveSession();
      navigate("/admin", { replace: true });
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "#1a0a2e" }}>
      <div className="ramadan-pattern" />

      {/* Header */}
      <header
        className="relative z-20 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between"
        style={{
          background: "linear-gradient(180deg, rgba(30, 15, 50, 0.95) 0%, rgba(20, 10, 40, 0.9) 100%)",
          borderBottom: "1px solid rgba(245, 200, 66, 0.2)",
        }}
      >
        {/* Logo + Nav */}
        <div className="flex items-center gap-3 sm:gap-6">
          <motion.div className="flex items-center gap-2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
            <div className="relative">
              <CrescentIcon className="w-8 h-8" style={{ color: "#f5c842" }} />
              <LanternIcon className="w-4 h-4 absolute -bottom-1 -right-1" style={{ color: "#f5c842" }} />
            </div>
            <span className="text-xl font-black" style={{ color: "#f5c842" }}>Iftaroot</span>
          </motion.div>

          <nav className="flex items-center gap-0.5 sm:gap-1">
            <NavLink to="/admin/quizzes"
              className={({ isActive }) =>
                `px-2.5 sm:px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "text-[#1a0a2e] font-bold"
                    : "hover:opacity-100 opacity-70'"}` }
              style={({ isActive }) => isActive
                ? { background: "#f5c842", color: "#1a0a2e" }
                : { color: "#f5c842" }}>
              Quizzes
            </NavLink>
            <NavLink to="/admin/history"
              className={({ isActive }) =>
                `px-2.5 sm:px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive ? "font-bold" : "opacity-70 hover:opacity-100"
                }`}
              style={({ isActive }) => isActive
                ? { background: "#f5c842", color: "#1a0a2e" }
                : { color: "#f5c842" }}>
              History
            </NavLink>
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-4">
          {admin?.email && (
            <span className="hidden sm:block text-sm truncate max-w-[180px]" style={{ color: "rgba(255,255,255,0.6)" }}>{admin.email}</span>
          )}
          {isHostingGame && activeSession ? (
            <motion.button onClick={handleEndGame} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="text-sm font-bold px-3 sm:px-4 py-2 rounded-lg transition"
              style={{ background: "rgba(244,67,54,0.2)", color: "#f44336", border: "1px solid rgba(244,67,54,0.4)" }}>
              End Game
            </motion.button>
          ) : (
            <motion.button onClick={handleLogout} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="text-sm font-medium px-3 sm:px-4 py-2 rounded-lg transition"
              style={{ color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.15)" }}>
              Sign out
            </motion.button>
          )}
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <Outlet />
      </main>
    </div>
  );
}
