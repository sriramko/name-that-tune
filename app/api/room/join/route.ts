import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRoom, addPlayer } from "@/lib/rooms";
import { pusherServer } from "@/lib/pusher";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const { code, guestNickname } = await req.json();

  if (!code) {
    return NextResponse.json({ error: "Missing room code" }, { status: 400 });
  }

  // Guests must provide a nickname; signed-in users use their account name
  const nickname = session?.user?.name ?? guestNickname;
  if (!nickname?.trim()) {
    return NextResponse.json({ error: "Missing nickname" }, { status: 400 });
  }

  const room = getRoom(code.toUpperCase());
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }
  if (room.phase !== "lobby") {
    return NextResponse.json({ error: "Game already in progress" }, { status: 400 });
  }

  const playerId = crypto.randomUUID();
  addPlayer(room.code, {
    id: playerId,
    userId: session?.user?.id,
    nickname: nickname.trim(),
    avatar: session?.user?.image ?? undefined,
    score: 0,
  });

  await pusherServer.trigger(`room-${room.code}`, "player-joined", {
    players: room.players,
  });

  return NextResponse.json({ code: room.code, playerId });
}
