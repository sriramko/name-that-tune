import { NextRequest, NextResponse } from "next/server";
import { getRoom, updateRoom } from "@/lib/rooms";
import { pusherServer } from "@/lib/pusher";
import { calculatePoints } from "@/lib/scoring";

function normalize(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .trim();
}

function isCorrectGuess(guess: string, title: string): boolean {
  const g = normalize(guess);
  const t = normalize(title);
  return g.includes(t) || t.includes(g);
}

export async function POST(req: NextRequest) {
  const { code, playerId, guess, timeElapsed } = await req.json();

  const room = getRoom(code);
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });
  if (room.phase !== "playing") return NextResponse.json({ correct: false });
  if (room.roundWinner) return NextResponse.json({ correct: false }); // already won

  const track = room.tracks[room.currentTrackIndex];
  if (!track) return NextResponse.json({ correct: false });

  const player = room.players.find((p) => p.id === playerId);
  const correct = isCorrectGuess(guess, track.title);

  if (correct) {
    const points = calculatePoints(timeElapsed ?? 30);
    if (player) player.score += points;

    updateRoom(code, { phase: "reveal", roundWinner: player?.nickname ?? "Someone" });

    await pusherServer.trigger(`room-${code}`, "round-won", {
      winner: player?.nickname,
      points,
      track,
      players: room.players,
    });

    return NextResponse.json({ correct: true, points });
  } else {
    // Wrong guess penalty
    if (player) player.score -= 1;

    await pusherServer.trigger(`room-${code}`, "scores-updated", {
      players: room.players,
    });

    return NextResponse.json({ correct: false });
  }
}
