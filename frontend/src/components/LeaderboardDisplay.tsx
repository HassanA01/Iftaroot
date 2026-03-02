import { useLayoutEffect, useRef, useState, useEffect } from "react";
import type { LeaderboardEntry } from "../types";

interface Props {
  entries: LeaderboardEntry[];
  prevEntries?: LeaderboardEntry[];
  highlightPlayerId?: string;
  maxEntries?: number;
}

const MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3)
    return (
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
        style={{ background: rank === 1 ? "rgba(245,200,66,0.2)" : rank === 2 ? "rgba(192,192,192,0.2)" : "rgba(205,127,50,0.2)" }}>
        {MEDALS[rank]}
      </div>
    );
  return (
    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
      style={{ background: "rgba(245,200,66,0.15)", color: "#f5c842" }}>
      #{rank}
    </div>
  );
}

export function LeaderboardDisplay({
  entries,
  prevEntries,
  highlightPlayerId,
  maxEntries = 5,
}: Props) {
  const shown = entries.slice(0, maxEntries);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const initRef = useRef({ prevEntries, shown, maxEntries });
  const hasPrev = !!(prevEntries && prevEntries.length > 0);

  const [visible, setVisible] = useState(hasPrev);
  useEffect(() => {
    if (hasPrev) return;
    const t = setTimeout(() => setVisible(true), 0);
    return () => clearTimeout(t);
  }, [hasPrev]);

  useLayoutEffect(() => {
    const { prevEntries: prev, shown: currentShown, maxEntries: limit } = initRef.current;
    if (!prev || prev.length === 0) return;

    const currentTops = new Map<string, number>();
    itemRefs.current.forEach((el, id) => {
      if (el) currentTops.set(id, el.offsetTop);
    });

    const sortedTops = [...currentTops.values()].sort((a, b) => a - b);
    const stepSize = sortedTops.length > 1 ? sortedTops[1] - sortedTops[0] : 60;

    const prevRankMap = new Map<string, number>();
    prev.slice(0, limit).forEach((e, i) => {
      prevRankMap.set(e.player_id, i);
    });

    itemRefs.current.forEach((el, playerId) => {
      if (!el) return;
      const prevIdx = prevRankMap.get(playerId);
      if (prevIdx === undefined) return;
      const currentIdx = currentShown.findIndex((e) => e.player_id === playerId);
      if (currentIdx === -1) return;
      const delta = (prevIdx - currentIdx) * stepSize;
      if (Math.abs(delta) < 2) return;
      el.style.transition = "none";
      el.style.transform = `translateY(${delta}px)`;
      el.getBoundingClientRect();
      el.style.transition = "transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)";
      el.style.transform = "translateY(0)";
    });
  }, []);

  const setRef = (playerId: string) => (el: HTMLDivElement | null) => {
    if (el) itemRefs.current.set(playerId, el);
    else itemRefs.current.delete(playerId);
  };

  return (
    <div className="space-y-3">
      {shown.map((entry, i) => {
        const isHighlighted = !!highlightPlayerId && entry.player_id === highlightPlayerId;

        return (
          <div
            key={entry.player_id}
            ref={setRef(entry.player_id)}
            style={{
              ...(isHighlighted
                ? { background: "rgba(245, 200, 66, 0.2)", border: "2px solid rgba(245, 200, 66, 0.5)" }
                : { background: "rgba(255, 255, 255, 0.08)", border: "2px solid transparent" }),
              ...(!hasPrev
                ? { transitionDelay: `${i * 80}ms`, transition: "opacity 0.4s ease, transform 0.4s ease" }
                : undefined),
            }}
            className={[
              "rounded-xl px-4 py-3 flex items-center gap-4",
              !hasPrev ? (visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4") : "opacity-100",
            ].join(" ")}
          >
            <RankBadge rank={entry.rank} />

            <div className="flex-1 min-w-0">
              <p className="font-bold text-white truncate">{entry.name}</p>
              {isHighlighted && (
                <p className="text-xs font-semibold" style={{ color: "#f5c842" }}>(you)</p>
              )}
            </div>

            <span className="font-bold tabular-nums shrink-0" style={{ color: "#f5c842" }}>
              {entry.score}
            </span>
          </div>
        );
      })}
    </div>
  );
}
