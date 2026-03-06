import { NextRequest, NextResponse } from "next/server";
import { getRoom, updateRoom } from "@/lib/rooms";
import { pusherServer } from "@/lib/pusher";

export async function POST(req: NextRequest) {
  const { code, playerId } = await req.json();

  const room = getRoom(code);
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });
  if (room.hostId !== playerId) return NextResponse.json({ error: "Not host" }, { status: 403 });
  if (room.phase !== "playing") return NextResponse.json({ ok: true }); // already handled

  const track = room.tracks[room.currentTrackIndex];
  updateRoom(code, { phase: "reveal", roundWinner: null });

  await pusherServer.trigger(`room-${code}`, "round-skipped", {
    track,
    players: room.players,
  });

  return NextResponse.json({ ok: true });
}
