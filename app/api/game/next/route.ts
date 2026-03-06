import { NextRequest, NextResponse } from "next/server";
import { getRoom, updateRoom } from "@/lib/rooms";
import { pusherServer } from "@/lib/pusher";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { code, playerId } = await req.json();

  const room = getRoom(code);
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });
  if (room.hostId !== playerId) return NextResponse.json({ error: "Not host" }, { status: 403 });

  const nextIndex = room.currentTrackIndex + 1;

  if (nextIndex >= room.tracks.length) {
    updateRoom(code, { phase: "finished" });

    // Write final scores and ranks to DB
    if (room.gameSessionId) {
      const sorted = [...room.players].sort((a, b) => b.score - a.score);

      await prisma.gameSession.update({
        where: { id: room.gameSessionId },
        data: { finishedAt: new Date() },
      });

      // Update each GamePlayer's score and rank by matching nickname
      const gamePlayers = await prisma.gamePlayer.findMany({
        where: { gameSessionId: room.gameSessionId },
      });

      await Promise.all(
        gamePlayers.map((gp) => {
          const player = room.players.find((p) => p.nickname === gp.nickname);
          const rank = player ? sorted.findIndex((p) => p.id === player.id) + 1 : null;
          return prisma.gamePlayer.update({
            where: { id: gp.id },
            data: {
              score: player?.score ?? gp.score,
              rank: rank,
            },
          });
        })
      );
    }

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
