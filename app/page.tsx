"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { PLAYLISTS } from "@/lib/playlists";
import AuthButton from "@/components/AuthButton";

interface CustomPlaylist {
  id: string;
  name: string;
  tracks: { id: string }[];
}

export default function Home() {
  const router = useRouter();
  const { data: session } = useSession();

  const [mode, setMode] = useState<"home" | "create" | "join">("home");
  const [playlistId, setPlaylistId] = useState(PLAYLISTS[0].id);
  const [guestNickname, setGuestNickname] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [customPlaylists, setCustomPlaylists] = useState<CustomPlaylist[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  // Load custom playlists when signed in and on create screen
  useEffect(() => {
    if (!session?.user || mode !== "create") return;
    fetch("/api/playlist")
      .then((r) => r.json())
      .then((data) => setCustomPlaylists(data.playlists ?? []));
  }, [session, mode]);

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setEmailLoading(true);
    await signIn("email", { email: emailInput.trim(), redirect: false, callbackUrl: "/" });
    setEmailLoading(false);
    setEmailSent(true);
  }

  async function handleCreate() {
    if (!session) return signIn("github");
    setLoading(true);
    setError("");
    const res = await fetch("/api/room/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playlistId }),
    });
    const data = await res.json();
    if (!res.ok) { setLoading(false); return setError(data.error); }
    sessionStorage.setItem("playerId", data.playerId);
    router.push(`/room/${data.code}`);
  }

  async function handleJoin() {
    if (!joinCode.trim()) return setError("Enter a room code");
    if (!session && !guestNickname.trim()) return setError("Enter a nickname");
    setLoading(true);
    setError("");
    const res = await fetch("/api/room/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: joinCode.trim(),
        guestNickname: session ? undefined : guestNickname.trim(),
      }),
    });
    const data = await res.json();
    if (!res.ok) { setLoading(false); return setError(data.error); }
    sessionStorage.setItem("playerId", data.playerId);
    router.push(`/room/${data.code}`);
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">

        {/* Top-right auth button */}
        <div className="flex justify-end mb-6">
          <AuthButton />
        </div>

        <h1 className="text-5xl font-black text-center mb-2 text-yellow-400">
          Name That Tune!
        </h1>
        <p className="text-center text-gray-400 mb-10 text-sm">
          Hear it. Name it. Win it.
        </p>

        {/* Signed-in welcome */}
        {session?.user && mode === "home" && (
          <div className="flex items-center gap-3 bg-gray-900 rounded-xl px-4 py-3 mb-4">
            {session.user.image && (
              <Image
                src={session.user.image}
                alt="avatar"
                width={36}
                height={36}
                className="rounded-full"
                unoptimized
              />
            )}
            <div className="flex flex-col">
              <span className="text-gray-300 text-sm">
                Signed in as <span className="text-white font-semibold">{session.user.name}</span>
              </span>
              <Link href="/profile" className="text-yellow-400 text-xs hover:text-yellow-300 transition">
                View my stats →
              </Link>
            </div>
          </div>
        )}

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
            {session ? (
              <Link
                href="/playlist/create"
                className="w-full bg-gray-900 border border-gray-700 text-gray-300 font-semibold py-3 rounded-xl text-base hover:border-gray-500 hover:text-white transition text-center"
              >
                Create a Playlist
              </Link>
            ) : (
              <p className="text-center text-gray-600 text-xs mt-2">
                Sign in with GitHub to create rooms, build playlists, and track your stats
              </p>
            )}
          </div>
        )}

        {mode === "create" && (
          <div className="flex flex-col gap-4">
            {!session ? (
              <div className="bg-gray-900 rounded-xl p-6 flex flex-col gap-4">
                <p className="text-gray-300 text-center">Sign in to create a room</p>

                {emailSent ? (
                  <div className="text-center flex flex-col gap-2 py-2">
                    <p className="text-yellow-400 font-semibold">Check your email!</p>
                    <p className="text-gray-400 text-sm">
                      A sign-in link was sent to <span className="text-white">{emailInput}</span>.
                    </p>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => signIn("github")}
                      className="flex items-center justify-center gap-2 bg-white text-gray-950 font-bold py-3 rounded-xl hover:bg-gray-100 transition"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                      Sign in with GitHub
                    </button>

                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-gray-700" />
                      <span className="text-gray-600 text-xs">or</span>
                      <div className="flex-1 h-px bg-gray-700" />
                    </div>

                    <form onSubmit={handleEmailSignIn} className="flex flex-col gap-2">
                      <input
                        type="email"
                        placeholder="your@email.com"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="w-full bg-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        required
                      />
                      <button
                        type="submit"
                        disabled={emailLoading}
                        className="w-full bg-gray-700 text-white font-bold py-3 rounded-xl hover:bg-gray-600 transition disabled:opacity-50"
                      >
                        {emailLoading ? "Sending..." : "Send magic link"}
                      </button>
                    </form>
                  </>
                )}
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 bg-gray-900 rounded-xl px-4 py-3">
                  {session.user.image && (
                    <Image src={session.user.image} alt="avatar" width={32} height={32} className="rounded-full" unoptimized />
                  )}
                  <span className="text-gray-300 text-sm">Playing as <span className="text-white font-semibold">{session.user.name}</span></span>
                </div>

                {/* Curated playlists */}
                <div className="flex flex-col gap-2">
                  <label className="text-gray-400 text-sm">Curated playlists</label>
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

                {/* Custom playlists */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-gray-400 text-sm">Your playlists</label>
                    <Link
                      href="/playlist/create"
                      className="text-yellow-400 text-xs hover:text-yellow-300 transition"
                    >
                      + Create new
                    </Link>
                  </div>
                  {customPlaylists.length === 0 ? (
                    <p className="text-gray-600 text-sm text-center py-3">
                      No custom playlists yet —{" "}
                      <Link href="/playlist/create" className="text-yellow-400 hover:text-yellow-300">
                        create one
                      </Link>
                    </p>
                  ) : (
                    customPlaylists.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setPlaylistId(`custom:${p.id}`)}
                        className={`w-full text-left px-4 py-3 rounded-xl border transition ${
                          playlistId === `custom:${p.id}`
                            ? "border-yellow-400 bg-yellow-400/10 text-yellow-400"
                            : "border-gray-700 bg-gray-800 text-white hover:border-gray-500"
                        }`}
                      >
                        <span className="font-semibold">{p.name}</span>
                        <span className="text-gray-400 text-sm ml-2">— {p.tracks.length} songs</span>
                      </button>
                    ))
                  )}
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button
                  onClick={handleCreate}
                  disabled={loading}
                  className="w-full bg-yellow-400 text-gray-950 font-bold py-4 rounded-xl text-lg hover:bg-yellow-300 transition disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Room"}
                </button>
              </>
            )}
            <button onClick={() => { setMode("home"); setError(""); }} className="text-gray-500 hover:text-gray-300 text-sm text-center">
              Back
            </button>
          </div>
        )}

        {mode === "join" && (
          <div className="flex flex-col gap-4">
            {!session && (
              <input
                className="w-full bg-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="Your nickname (guest)"
                value={guestNickname}
                onChange={(e) => setGuestNickname(e.target.value)}
                maxLength={20}
              />
            )}
            {session?.user && (
              <div className="flex items-center gap-3 bg-gray-900 rounded-xl px-4 py-3">
                {session.user.image && (
                  <Image src={session.user.image} alt="avatar" width={32} height={32} className="rounded-full" unoptimized />
                )}
                <span className="text-gray-300 text-sm">Joining as <span className="text-white font-semibold">{session.user.name}</span></span>
              </div>
            )}
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
            <button onClick={() => { setMode("home"); setError(""); }} className="text-gray-500 hover:text-gray-300 text-sm text-center">
              Back
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
