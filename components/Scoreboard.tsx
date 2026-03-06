"use client";

import { Player } from "@/types";

interface Props {
  players: Player[];
  currentPlayerId: string;
  showRank?: boolean;
}

export default function Scoreboard({ players, currentPlayerId, showRank }: Props) {
  const sorted = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="bg-gray-900 rounded-2xl p-4">
      <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-3">Scoreboard</h3>
      <ul className="flex flex-col gap-2">
        {sorted.map((p, i) => (
          <li
            key={p.id}
            className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all ${
              showRank && i === 0
                ? "bg-yellow-400/10 border-yellow-400/50"
                : p.id === currentPlayerId
                ? "bg-yellow-400/10 border-yellow-400/30"
                : "bg-gray-800 border-transparent"
            }`}
          >
            <div className="flex items-center gap-3">
              {showRank && (
                <span className="text-lg w-6 text-center">
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : (
                    <span className="text-gray-500 text-sm">{i + 1}.</span>
                  )}
                </span>
              )}
              {p.avatar ? (
                <img src={p.avatar} alt={p.nickname} className="w-6 h-6 rounded-full" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-xs font-bold text-gray-300">
                  {p.nickname[0].toUpperCase()}
                </div>
              )}
              <span className="font-medium">
                {p.nickname}
                {p.id === currentPlayerId && (
                  <span className="text-xs text-gray-500 ml-1">(you)</span>
                )}
              </span>
            </div>
            <span className="font-bold text-yellow-400">{p.score} pts</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
