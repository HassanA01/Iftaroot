import { useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Users } from "lucide-react";
import { LanternIcon, CrescentIcon } from "../components/icons";
import { getSessionByCode, listSessionPlayers } from "../api/sessions";
import { useWebSocket } from "../hooks/useWebSocket";
import type { WsMessage } from "../types";

const WS_BASE = import.meta.env.VITE_WS_BASE_URL ?? "ws://localhost:8081";

interface PlayerInfo {
  id: string;
  name: string;
}

interface WsPlayerEvent {
  type: "joined" | "left";
  player_id: string;
  name: string;
}

export function PlayerLobbyPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  const playerId = sessionStorage.getItem("player_id") ?? "";
  const playerName = sessionStorage.getItem("player_name") ?? "";

  const [wsReady, setWsReady] = useState(false);
  const [disconnected, setDisconnected] = useState(false);
  const [wsEvents, setWsEvents] = useState<WsPlayerEvent[]>([]);

  const {
    data: session,
    isLoading: sessionLoading,
    isError: sessionError,
  } = useQuery({
    queryKey: ["session-by-code", code],
    queryFn: () => getSessionByCode(code!),
    enabled: !!code,
    retry: false,
  });

  const { data: initialPlayers } = useQuery({
    queryKey: ["session-players", session?.id],
    queryFn: () => listSessionPlayers(session!.id),
    enabled: !!session?.id,
  });

  const players: PlayerInfo[] = useMemo(() => {
    let result: PlayerInfo[] = (initialPlayers ?? []).map((p) => ({
      id: p.id,
      name: p.name,
    }));
    for (const ev of wsEvents) {
      if (ev.type === "joined" && !result.some((p) => p.id === ev.player_id)) {
        result.push({ id: ev.player_id, name: ev.name });
      } else if (ev.type === "left") {
        result = result.filter((p) => p.id !== ev.player_id);
      }
    }
    return result;
  }, [initialPlayers, wsEvents]);

  const handleMessage = useCallback(
    (msg: WsMessage) => {
      if (msg.type === "player_joined") {
        const payload = msg.payload as { player_id: string; name: string };
        setWsEvents((prev) => [
          ...prev,
          { type: "joined", player_id: payload.player_id, name: payload.name },
        ]);
      } else if (msg.type === "player_left") {
        const payload = msg.payload as { player_id: string };
        setWsEvents((prev) => [
          ...prev,
          { type: "left", player_id: payload.player_id, name: "" },
        ]);
      } else if (msg.type === "game_started") {
        navigate(`/game/${code}/play`);
      }
    },
    [code, navigate],
  );

  useWebSocket({
    url: `${WS_BASE}/api/v1/ws/player/${code}?player_id=${playerId}&name=${encodeURIComponent(playerName)}`,
    onMessage: handleMessage,
    onOpen: () => { setWsReady(true); setDisconnected(false); },
    onClose: () => { setWsReady(false); setDisconnected(true); },
    enabled: !!session && !!playerId && !!code,
  });

  const PLAYER_COLORS = [
    "#f5c842", "#ff6b35", "#4caf50", "#2196f3", "#f44336",
    "#9c27b0", "#00bcd4", "#ff9800",
  ];

  // ── Loading ──
  if (sessionLoading) {
    return (
      <div className="min-h-screen w-full relative overflow-hidden" style={{ background: "#1a0a2e" }}>
        <div className="ramadan-pattern" />
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <motion.div
              animate={{ y: [0, -15, 0], rotate: [-3, 3, -3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <LanternIcon className="w-20 h-20 mx-auto drop-shadow-[0_0_30px_rgba(245,200,66,0.7)]" style={{ color: "#f5c842" }} />
            </motion.div>
            <p className="mt-4 font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>Looking up game…</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Not found ──
  if (sessionError || !session) {
    return (
      <div className="min-h-screen w-full relative overflow-hidden" style={{ background: "#1a0a2e" }}>
        <div className="ramadan-pattern" />
        <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
          <motion.div
            className="text-center w-full max-w-sm p-8 rounded-3xl"
            style={{
              background: "linear-gradient(135deg, rgba(42, 20, 66, 0.9) 0%, rgba(30, 15, 50, 0.95) 100%)",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(245, 200, 66, 0.2)",
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <CrescentIcon className="w-12 h-12 mx-auto mb-4" style={{ color: "#f5c842" }} />
            <h1 className="text-2xl font-bold text-white mb-2">Game not found</h1>
            <p className="mb-6" style={{ color: "rgba(255,255,255,0.6)" }}>
              Code <span className="font-mono font-bold" style={{ color: "#f5c842" }}>{code}</span> doesn't match any active game.
            </p>
            <motion.a
              href="/join"
              className="inline-block py-3 px-6 rounded-xl font-bold text-white"
              style={{ background: "linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%)" }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              ← Try a different code
            </motion.a>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── No identity ──
  if (!playerId || !playerName) {
    return (
      <div className="min-h-screen w-full relative overflow-hidden" style={{ background: "#1a0a2e" }}>
        <div className="ramadan-pattern" />
        <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
          <motion.div
            className="text-center w-full max-w-sm p-8 rounded-3xl"
            style={{
              background: "linear-gradient(135deg, rgba(42, 20, 66, 0.9) 0%, rgba(30, 15, 50, 0.95) 100%)",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(245, 200, 66, 0.2)",
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <LanternIcon className="w-12 h-12 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(245,200,66,0.6)]" style={{ color: "#f5c842" }} />
            <h1 className="text-2xl font-bold text-white mb-4">Enter your name to join</h1>
            <motion.a
              href={`/join?code=${code}`}
              className="inline-block py-3 px-6 rounded-xl font-bold text-white"
              style={{ background: "linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%)" }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Join Game
            </motion.a>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── Lobby ──
  return (
    <div className="min-h-screen w-full relative overflow-hidden" style={{ background: "#1a0a2e" }}>
      <div className="ramadan-pattern" />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-8 max-w-md mx-auto">
        {/* Animated lantern */}
        <motion.div
          className="mb-8"
          animate={{ y: [0, -15, 0], rotate: [-3, 3, -3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <LanternIcon className="w-24 h-24 drop-shadow-[0_0_40px_rgba(245,200,66,0.8)]" style={{ color: "#f5c842" }} />
        </motion.div>

        {/* Player identity */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <CrescentIcon className="w-6 h-6" style={{ color: "#f5c842" }} />
            <h2 className="text-2xl font-bold text-white">Welcome!</h2>
          </div>
          <p className="text-xl font-bold" style={{ color: "#f5c842" }}>{playerName}</p>
        </motion.div>

        {/* Connection status / player count */}
        {disconnected ? (
          <motion.div
            className="mb-8 px-8 py-4 rounded-2xl"
            style={{ background: "rgba(244, 67, 54, 0.15)", border: "2px solid rgba(244, 67, 54, 0.4)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="font-medium" style={{ color: "#f44336" }}>Disconnected. Reconnecting…</p>
          </motion.div>
        ) : (
          <motion.div
            className="mb-8 px-8 py-4 rounded-2xl flex items-center gap-3"
            style={{
              background: "rgba(245, 200, 66, 0.15)",
              border: "2px solid rgba(245, 200, 66, 0.3)",
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Users className="w-6 h-6" style={{ color: "#f5c842" }} />
            <div>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>Players in lobby</p>
              <motion.p
                className="text-2xl font-bold"
                style={{ color: "#f5c842" }}
                key={players.length}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {players.length}
              </motion.p>
            </div>
          </motion.div>
        )}

        {/* Waiting message + pulse dots */}
        <motion.p
          className="text-lg mb-8"
          style={{ color: "#f5c842" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {wsReady ? "Waiting for host to start…" : "Connecting…"}
        </motion.p>

        <div className="flex gap-3 mb-10">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-4 h-4 rounded-full"
              style={{ background: "#f5c842" }}
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>

        {/* Player list */}
        {players.length > 0 && (
          <motion.div
            className="w-full space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {players.map((p, i) => (
              <motion.div
                key={p.id}
                className="px-4 py-3 rounded-xl flex items-center gap-3"
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(245, 200, 66, 0.2)",
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
                  style={{ background: PLAYER_COLORS[i % PLAYER_COLORS.length] }}
                >
                  {p.name[0]?.toUpperCase()}
                </div>
                <p className="text-white font-medium flex-1">{p.name}</p>
                {p.id === playerId && (
                  <span className="text-sm" style={{ color: "#f5c842" }}>(You)</span>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
