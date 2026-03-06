import { NextRequest, NextResponse } from "next/server";
import { getRoom, updateRoom } from "@/lib/rooms";
import { pusherServer } from "@/lib/pusher";
import { prisma } from "@/lib/prisma";
import { PLAYLISTS } from "@/lib/playlists";

export async function POST(req: NextRequest) {
  const { code, playerId } = await req.json();

  const room = getRoom(code);
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });
  if (room.hostId !== playerId) return NextResponse.json({ error: "Not host" }, { status: 403 });
  if (room.tracks.length === 0) return NextResponse.json({ error: "Tracks not loaded yet" }, { status: 400 });

  const playlist = PLAYLISTS.find((p) => p.id === room.playlistId);

  // Create a GameSession and GamePlayer records in the DB
  const gameSession = await prisma.gameSession.create({
    data: {
      roomCode: code,
      playlistId: room.playlistId,
      playlistName: playlist?.name ?? room.playlistId,
      players: {
        create: room.players.map((p) => ({
          userId: p.userId ?? null,
          nickname: p.nickname,
          avatar: p.avatar ?? null,
          score: 0,
        })),
      },
    },
  });

  updateRoom(code, {
    phase: "playing",
    currentTrackIndex: 0,
    roundWinner: null,
    gameSessionId: gameSession.id,
  });

  await pusherServer.trigger(`room-${code}`, "game-started", {
    previewUrl: room.tracks[0].previewUrl,
    trackIndex: 0,
    totalTracks: room.tracks.length,
  });

  return NextResponse.json({ ok: true });
}
