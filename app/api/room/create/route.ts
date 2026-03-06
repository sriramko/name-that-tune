import { NextRequest, NextResponse } from "next/server";
import { createRoom, addPlayer } from "@/lib/rooms";
import { buildPlaylistTracks } from "@/lib/itunes";
import { PLAYLISTS } from "@/lib/playlists";
import { pusherServer } from "@/lib/pusher";

export async function POST(req: NextRequest) {
  const { nickname, playlistId } = await req.json();

  if (!nickname || !playlistId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const playlist = PLAYLISTS.find((p) => p.id === playlistId);
  if (!playlist) {
    return NextResponse.json({ error: "Invalid playlist" }, { status: 400 });
  }

  const hostId = crypto.randomUUID();
  const room = createRoom(hostId, playlistId);

  addPlayer(room.code, { id: hostId, nickname, score: 0 });

  // Fetch iTunes previews in background — tracks will be ready before game starts
  buildPlaylistTracks(playlist.seeds).then((tracks) => {
    room.tracks = tracks;
  });

  return NextResponse.json({ code: room.code, playerId: hostId });
}
