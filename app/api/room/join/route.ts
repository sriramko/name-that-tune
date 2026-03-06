import { NextRequest, NextResponse } from "next/server";
import { getRoom, addPlayer } from "@/lib/rooms";
import { pusherServer } from "@/lib/pusher";

export async function POST(req: NextRequest) {
  const { code, nickname } = await req.json();

  if (!code || !nickname) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const room = getRoom(code.toUpperCase());
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }
  if (room.phase !== "lobby") {
    return NextResponse.json({ error: "Game already in progress" }, { status: 400 });
  }

  const playerId = crypto.randomUUID();
  addPlayer(room.code, { id: playerId, nickname, score: 0 });

  await pusherServer.trigger(`room-${room.code}`, "player-joined", {
    players: room.players,
  });

  return NextResponse.json({ code: room.code, playerId });
}
