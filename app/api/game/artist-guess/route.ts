import { NextRequest, NextResponse } from "next/server";
import { getRoom, updateRoom } from "@/lib/rooms";
import { pusherServer } from "@/lib/pusher";

function normalize(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
}

function isCorrectArtist(guess: string, artistName: string): boolean {
  // Split the track's artist field by common separators (ft., feat., &, x, ,)
  const artists = artistName
    .split(/\bft\.?\b|\bfeat\.?\b|[&,]|\bx\b/i)
    .map((a) => normalize(a.trim()))
    .filter(Boolean);

  // Split the player's guess by commas
  const guesses = guess.split(",").map((g) => normalize(g.trim())).filter(Boolean);

  // Award point if any guess matches any artist (lenient substring match)
  return guesses.some((g) => artists.some((a) => a.includes(g) || g.includes(a)));
}

export async function POST(req: NextRequest) {
  const { code, playerId, guess } = await req.json();

  const room = getRoom(code);
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });
  if (room.phase !== "artist-bonus") return NextResponse.json({ correct: false });
  if (room.artistGuesserPlayerId !== playerId) return NextResponse.json({ correct: false });

  const track = room.tracks[room.currentTrackIndex];
  if (!track) return NextResponse.json({ correct: false });

  const correct = isCorrectArtist(guess, track.artist);

  if (correct) {
    const player = room.players.find((p) => p.id === playerId);
    if (player) player.score += 1;

    updateRoom(code, { phase: "reveal", artistGuesserPlayerId: null });

    await pusherServer.trigger(`room-${code}`, "artist-bonus-result", {
      correct: true,
      bonusWinner: player?.nickname ?? "Someone",
      track,
      players: room.players,
    });

    return NextResponse.json({ correct: true });
  }

  return NextResponse.json({ correct: false });
}
