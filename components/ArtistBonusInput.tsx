"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  onGuess: (guess: string) => void;
  onTimeout: () => void;
  result: "correct" | "wrong" | null;
  duration?: number;
}

export default function ArtistBonusInput({ onGuess, onTimeout, result, duration = 10 }: Props) {
  const [value, setValue] = useState("");
  const [timeLeft, setTimeLeft] = useState(duration);
  const timedOut = useRef(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (!timedOut.current) {
        timedOut.current = true;
        onTimeout();
      }
      return;
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, onTimeout]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!value.trim() || timeLeft <= 0) return;
    onGuess(value.trim());
    setValue("");
  }

  const urgency =
    timeLeft <= 3 ? "text-red-400 border-red-400" :
    timeLeft <= 6 ? "text-orange-400 border-orange-400" :
                    "text-yellow-400 border-yellow-400";

  return (
    <div className="bg-gray-900 rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-white font-semibold">Who's the artist?</p>
        <span className={`text-2xl font-black tabular-nums ${urgency}`}>
          {timeLeft}s
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          className={`flex-1 bg-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none border transition ${
            result === "wrong" ? "border-red-400 ring-2 ring-red-400" : "border-gray-700"
          }`}
          placeholder='e.g. "Drake" or "Drake, Rihanna"'
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoComplete="off"
          autoFocus
          disabled={timeLeft <= 0}
        />
        <button
          type="submit"
          disabled={timeLeft <= 0}
          className="bg-yellow-400 text-gray-950 font-bold px-5 rounded-xl hover:bg-yellow-300 transition disabled:opacity-40"
        >
          Guess
        </button>
      </form>

      <p className="text-gray-600 text-xs">+1 point for the correct artist</p>
      {result === "wrong" && (
        <p className="text-red-400 text-xs -mt-2">Not quite — try again</p>
      )}
    </div>
  );
}
