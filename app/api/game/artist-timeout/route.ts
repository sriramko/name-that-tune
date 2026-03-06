import { NextRequest, NextResponse } from "next/server";
import { getRoom, updateRoom } from "@/lib/rooms";
import { pusherServer } from "@/lib/pusher";

export async function POST(req: NextRequest) {
  const { code, playerId } = await req.json();

  const room = getRoom(code);
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });
  // Only the designated guesser can trigger the timeout
  if (room.artistGuesserPlayerId !== playerId) return NextResponse.json({ ok: true });
  if (room.phase !== "artist-bonus") return NextResponse.json({ ok: true });

  const track = room.tracks[room.currentTrackIndex];

  updateRoom(code, { phase: "reveal", artistGuesserPlayerId: null });

  await pusherServer.trigger(`room-${code}`, "artist-bonus-result", {
    correct: false,
    bonusWinner: null,
    track,
    players: room.players,
  });

  return NextResponse.json({ ok: true });
}
