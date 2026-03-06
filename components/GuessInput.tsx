"use client";

import { useState } from "react";

interface Props {
  onGuess: (guess: string) => void;
  result: "correct" | "wrong" | null;
}

export default function GuessInput({ onGuess, result }: Props) {
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!value.trim()) return;
    onGuess(value.trim());
    setValue("");
  }

  const borderColor =
    result === "correct"
      ? "border-green-400 ring-2 ring-green-400"
      : result === "wrong"
      ? "border-red-400 ring-2 ring-red-400"
      : "border-gray-700";

  return (
    <div className="flex flex-col gap-1">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          className={`flex-1 bg-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none border transition ${borderColor}`}
          placeholder="Type song title..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoComplete="off"
          autoFocus
        />
        <button
          type="submit"
          className="bg-yellow-400 text-gray-950 font-bold px-5 rounded-xl hover:bg-yellow-300 transition"
        >
          Guess
        </button>
      </form>
      {result === "wrong" && (
        <p className="text-red-400 text-xs pl-1">Wrong — -1 point</p>
      )}
    </div>
  );
}
