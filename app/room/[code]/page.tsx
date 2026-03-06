"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { getPusherClient } from "@/lib/pusher";
import { Room, Player, Track } from "@/types";
import Scoreboard from "@/components/Scoreboard";
import AudioPlayer from "@/components/AudioPlayer";
import GuessInput from "@/components/GuessInput";

type Phase = "lobby" | "playing" | "reveal" | "finished";

export default function RoomPage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();

  const [playerId, setPlayerId] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [phase, setPhase] = useState<Phase>("lobby");
  const [isHost, setIsHost] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [trackIndex, setTrackIndex] = useState(0);
  const [totalTracks, setTotalTracks] = useState(0);
  const [roundWinner, setRoundWinner] = useState<string | null>(null);
  const [roundPoints, setRoundPoints] = useState<number | null>(null);
  const [revealedTrack, setRevealedTrack] = useState<Track | null>(null);
  const [skipped, setSkipped] = useState(false);
  const [guessResult, setGuessResult] = useState<"correct" | "wrong" | null>(null);
  const [starting, setStarting] = useState(false);

  const currentTimeRef = useRef(0);
  const isHostRef = useRef(false);

  // Keep isHostRef in sync so callbacks always have the latest value
  useEffect(() => { isHostRef.current = isHost; }, [isHost]);

  // Load player identity from sessionStorage
  useEffect(() => {
    const pid = sessionStorage.getItem("playerId") ?? "";
    const nick = sessionStorage.getItem("nickname") ?? "";
    if (!pid || !nick) { router.push("/"); return; }
    setPlayerId(pid);
  }, [router]);

  // Fetch initial room state
  useEffect(() => {
    if (!playerId) return;
    fetch(`/api/room/state?code=${code}`)
      .then((r) => r.json())
      .then((room: Room) => {
        setPlayers(room.players);
        setPhase(room.phase);
        setIsHost(room.hostId === playerId);
        setTotalTracks(room.tracks.length);
      });
  }, [code, playerId]);

  // Called by AudioPlayer when the clip ends — host auto-skips
  const handleAudioEnded = useCallback(() => {
    if (!isHostRef.current) return;
    fetch("/api/game/skip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, playerId: sessionStorage.getItem("playerId") }),
    });
  }, [code]);

  // Pusher subscriptions
  useEffect(() => {
    if (!playerId) return;
    const pusher = getPusherClient();
    const channel = pusher.subscribe(`room-${code}`);

    channel.bind("player-joined", (data: { players: Player[] }) => {
      setPlayers(data.players);
    });

    channel.bind("game-started", (data: { previewUrl: string; trackIndex: number; totalTracks: number }) => {
      setPhase("playing");
      setPreviewUrl(data.previewUrl);
      setTrackIndex(data.trackIndex);
      setTotalTracks(data.totalTracks);
      setRoundWinner(null);
      setRoundPoints(null);
      setRevealedTrack(null);
      setSkipped(false);
      setGuessResult(null);
    });

    channel.bind("round-won", (data: { winner: string; points: number; track: Track; players: Player[] }) => {
      setPhase("reveal");
      setRoundWinner(data.winner);
      setRoundPoints(data.points);
      setRevealedTrack(data.track);
      setPlayers(data.players);
      setSkipped(false);
    });

    channel.bind("round-skipped", (data: { track: Track; players: Player[] }) => {
      setPhase("reveal");
      setRoundWinner(null);
      setRoundPoints(null);
      setRevealedTrack(data.track);
      setPlayers(data.players);
      setSkipped(true);
    });

    channel.bind("scores-updated", (data: { players: Player[] }) => {
      setPlayers(data.players);
    });

    channel.bind("next-round", (data: { previewUrl: string; trackIndex: number; totalTracks: number }) => {
      setPhase("playing");
      setPreviewUrl(data.previewUrl);
      setTrackIndex(data.trackIndex);
      setRoundWinner(null);
      setRoundPoints(null);
      setRevealedTrack(null);
      setSkipped(false);
      setGuessResult(null);
    });

    channel.bind("game-finished", (data: { players: Player[] }) => {
      setPhase("finished");
      setPlayers(data.players);
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`room-${code}`);
    };
  }, [code, playerId]);

  async function handleStartGame() {
    setStarting(true);
    await fetch("/api/game/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, playerId }),
    });
    setStarting(false);
  }

  async function handleGuess(guess: string) {
    const res = await fetch("/api/game/guess", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, playerId, guess, timeElapsed: currentTimeRef.current }),
    });
    const data = await res.json();
    setGuessResult(data.correct ? "correct" : "wrong");
    if (!data.correct) setTimeout(() => setGuessResult(null), 800);
  }

  async function handleNextRound() {
    await fetch("/api/game/next", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, playerId }),
    });
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center p-6">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-yellow-400">Name That Tune!</h1>
          <div className="bg-gray-800 px-4 py-2 rounded-lg font-mono text-xl tracking-widest">
            {code}
          </div>
        </div>

        {/* Lobby */}
        {phase === "lobby" && (
          <div className="flex flex-col gap-6">
            <div className="bg-gray-900 rounded-2xl p-6">
              <h2 className="text-gray-400 text-sm mb-4 uppercase tracking-wider">
                Players in lobby ({players.length})
              </h2>
              <ul className="flex flex-col gap-2">
                {players.map((p) => (
                  <li key={p.id} className="flex items-center gap-2">
                    {p.avatar ? (
                      <img src={p.avatar} alt={p.nickname} className="w-7 h-7 rounded-full" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300">
                        {p.nickname[0].toUpperCase()}
                      </div>
                    )}
                    <span className="font-medium">{p.nickname}</span>
                    {p.id === playerId && (
                      <span className="text-xs text-gray-500">(you)</span>
                    )}
                    {p.id === players[0]?.id && (
                      <span className="text-xs text-yellow-400 ml-auto">host</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {isHost ? (
              <button
                onClick={handleStartGame}
                disabled={starting || players.length < 1}
                className="w-full bg-yellow-400 text-gray-950 font-bold py-4 rounded-xl text-lg hover:bg-yellow-300 transition disabled:opacity-50"
              >
                {starting ? "Starting..." : "Start Game"}
              </button>
            ) : (
              <p className="text-center text-gray-500">Waiting for host to start...</p>
            )}

            <p className="text-center text-gray-600 text-sm">
              Share code <span className="text-yellow-400 font-mono font-bold">{code}</span> with friends to join
            </p>
          </div>
        )}

        {/* Playing */}
        {phase === "playing" && (
          <div className="flex flex-col gap-6">
            <div className="text-center text-gray-400 text-sm">
              Round {trackIndex + 1} of {totalTracks}
            </div>
            <AudioPlayer
              previewUrl={previewUrl}
              onTimeUpdate={(t) => { currentTimeRef.current = t; }}
              onEnded={handleAudioEnded}
            />
            <GuessInput onGuess={handleGuess} result={guessResult} />
            <Scoreboard players={players} currentPlayerId={playerId} />
          </div>
        )}

        {/* Reveal */}
        {phase === "reveal" && revealedTrack && (
          <div className="flex flex-col gap-6">
            <div className="bg-gray-900 rounded-2xl overflow-hidden">
              {revealedTrack.artworkUrl && (
                <div className="relative w-full aspect-square">
                  <Image
                    src={revealedTrack.artworkUrl}
                    alt={`${revealedTrack.title} artwork`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
              <div className="p-6 text-center">
                {skipped ? (
                  <p className="text-gray-400 font-bold text-lg mb-1">Nobody got it!</p>
                ) : (
                  <p className="text-green-400 font-bold text-lg mb-1">
                    {roundWinner} got it
                    {roundPoints !== null && (
                      <span className="text-yellow-400"> +{roundPoints} pts</span>
                    )}
                    !
                  </p>
                )}
                <p className="text-white text-2xl font-black">{revealedTrack.title}</p>
                <p className="text-gray-400">{revealedTrack.artist}</p>
              </div>
            </div>
            <Scoreboard players={players} currentPlayerId={playerId} />
            {isHost && (
              <button
                onClick={handleNextRound}
                className="w-full bg-yellow-400 text-gray-950 font-bold py-4 rounded-xl text-lg hover:bg-yellow-300 transition"
              >
                Next Round →
              </button>
            )}
            {!isHost && (
              <p className="text-center text-gray-500">Waiting for host to continue...</p>
            )}
          </div>
        )}

        {/* Finished */}
        {phase === "finished" && (
          <div className="flex flex-col gap-6">
            <div className="bg-gray-900 rounded-2xl p-6 text-center">
              <p className="text-yellow-400 text-4xl font-black mb-2">Game Over!</p>
              <p className="text-gray-400">Final scores</p>
            </div>
            <Scoreboard players={players} currentPlayerId={playerId} showRank />
            <button
              onClick={() => router.push("/")}
              className="w-full bg-gray-800 text-white font-bold py-4 rounded-xl text-lg hover:bg-gray-700 transition"
            >
              Back to Home
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
