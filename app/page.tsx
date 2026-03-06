"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PLAYLISTS } from "@/lib/playlists";

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState<"home" | "create" | "join">("home");
  const [nickname, setNickname] = useState("");
  const [playlistId, setPlaylistId] = useState(PLAYLISTS[0].id);
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!nickname.trim()) return setError("Enter a nickname");
    setLoading(true);
    setError("");
    const res = await fetch("/api/room/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname: nickname.trim(), playlistId }),
    });
    const data = await res.json();
    if (!res.ok) { setLoading(false); return setError(data.error); }
    sessionStorage.setItem("playerId", data.playerId);
    sessionStorage.setItem("nickname", nickname.trim());
    router.push(`/room/${data.code}`);
  }

  async function handleJoin() {
    if (!nickname.trim()) return setError("Enter a nickname");
    if (!joinCode.trim()) return setError("Enter a room code");
    setLoading(true);
    setError("");
    const res = await fetch("/api/room/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname: nickname.trim(), code: joinCode.trim() }),
    });
    const data = await res.json();
    if (!res.ok) { setLoading(false); return setError(data.error); }
    sessionStorage.setItem("playerId", data.playerId);
    sessionStorage.setItem("nickname", nickname.trim());
    router.push(`/room/${data.code}`);
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <h1 className="text-5xl font-black text-center mb-2 text-yellow-400">
          Name That Tune!
        </h1>
        <p className="text-center text-gray-400 mb-10 text-sm">
          Hear it. Name it. Win it.
        </p>

        {mode === "home" && (
          <div className="flex flex-col gap-4">
            <button
              onClick={() => setMode("create")}
              className="w-full bg-yellow-400 text-gray-950 font-bold py-4 rounded-xl text-lg hover:bg-yellow-300 transition"
            >
              Create a Room
            </button>
            <button
              onClick={() => setMode("join")}
              className="w-full bg-gray-800 text-white font-bold py-4 rounded-xl text-lg hover:bg-gray-700 transition"
            >
              Join a Room
            </button>
          </div>
        )}

        {mode === "create" && (
          <div className="flex flex-col gap-4">
            <input
              className="w-full bg-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Your nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
            />
            <div className="flex flex-col gap-2">
              <label className="text-gray-400 text-sm">Choose a playlist</label>
              {PLAYLISTS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlaylistId(p.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition ${
                    playlistId === p.id
                      ? "border-yellow-400 bg-yellow-400/10 text-yellow-400"
                      : "border-gray-700 bg-gray-800 text-white hover:border-gray-500"
                  }`}
                >
                  <span className="font-semibold">{p.name}</span>
                  <span className="text-gray-400 text-sm ml-2">— {p.description}</span>
                </button>
              ))}
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              onClick={handleCreate}
              disabled={loading}
              className="w-full bg-yellow-400 text-gray-950 font-bold py-4 rounded-xl text-lg hover:bg-yellow-300 transition disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Room"}
            </button>
            <button
              onClick={() => { setMode("home"); setError(""); }}
              className="text-gray-500 hover:text-gray-300 text-sm text-center"
            >
              Back
            </button>
          </div>
        )}

        {mode === "join" && (
          <div className="flex flex-col gap-4">
            <input
              className="w-full bg-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Your nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
            />
            <input
              className="w-full bg-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 uppercase tracking-widest text-center text-xl font-mono"
              placeholder="ROOM CODE"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              maxLength={4}
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              onClick={handleJoin}
              disabled={loading}
              className="w-full bg-yellow-400 text-gray-950 font-bold py-4 rounded-xl text-lg hover:bg-yellow-300 transition disabled:opacity-50"
            >
              {loading ? "Joining..." : "Join Room"}
            </button>
            <button
              onClick={() => { setMode("home"); setError(""); }}
              className="text-gray-500 hover:text-gray-300 text-sm text-center"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
