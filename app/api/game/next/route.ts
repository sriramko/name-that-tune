import { NextRequest, NextResponse } from "next/server";
import { getRoom, updateRoom } from "@/lib/rooms";
import { pusherServer } from "@/lib/pusher";

export async function POST(req: NextRequest) {
  const { code, playerId } = await req.json();

  const room = getRoom(code);
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });
  if (room.hostId !== playerId) return NextResponse.json({ error: "Not host" }, { status: 403 });

  const nextIndex = room.currentTrackIndex + 1;

  if (nextIndex >= room.tracks.length) {
    updateRoom(code, { phase: "finished" });
    await pusherServer.trigger(`room-${code}`, "game-finished", {
      players: room.players,
    });
  } else {
    updateRoom(code, {
      phase: "playing",
      currentTrackIndex: nextIndex,
      roundWinner: null,
    });

    await pusherServer.trigger(`room-${code}`, "next-round", {
      previewUrl: room.tracks[nextIndex].previewUrl,
      trackIndex: nextIndex,
      totalTracks: room.tracks.length,
    });
  }

  return NextResponse.json({ ok: true });
}
