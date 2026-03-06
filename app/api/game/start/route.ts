import { NextRequest, NextResponse } from "next/server";
import { getRoom, updateRoom } from "@/lib/rooms";
import { pusherServer } from "@/lib/pusher";

export async function POST(req: NextRequest) {
  const { code, playerId } = await req.json();

  const room = getRoom(code);
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });
  if (room.hostId !== playerId) return NextResponse.json({ error: "Not host" }, { status: 403 });
  if (room.tracks.length === 0) return NextResponse.json({ error: "Tracks not loaded yet" }, { status: 400 });

  updateRoom(code, { phase: "playing", currentTrackIndex: 0, roundWinner: null });

  await pusherServer.trigger(`room-${code}`, "game-started", {
    previewUrl: room.tracks[0].previewUrl,
    trackIndex: 0,
    totalTracks: room.tracks.length,
  });

  return NextResponse.json({ ok: true });
}
