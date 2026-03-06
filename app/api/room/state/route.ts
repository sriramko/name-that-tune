import { NextRequest, NextResponse } from "next/server";
import { getRoom } from "@/lib/rooms";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 });

  const room = getRoom(code.toUpperCase());
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

  // Don't expose the answer — strip preview URLs when playing
  const safeRoom = {
    ...room,
    tracks: room.tracks.map((t, i) =>
      i === room.currentTrackIndex && room.phase === "playing"
        ? { ...t, title: "???", artist: "???" }
        : t
    ),
  };

  return NextResponse.json(safeRoom);
}
