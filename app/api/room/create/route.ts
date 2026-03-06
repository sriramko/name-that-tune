import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createRoom, addPlayer } from "@/lib/rooms";
import { buildPlaylistTracks } from "@/lib/itunes";
import { PLAYLISTS } from "@/lib/playlists";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Must be signed in to create a room" }, { status: 401 });
  }

  const { playlistId } = await req.json();
  if (!playlistId) {
    return NextResponse.json({ error: "Missing playlist" }, { status: 400 });
  }

  const playlist = PLAYLISTS.find((p) => p.id === playlistId);
  if (!playlist) {
    return NextResponse.json({ error: "Invalid playlist" }, { status: 400 });
  }

  const hostId = crypto.randomUUID();
  const room = createRoom(hostId, playlistId);

  addPlayer(room.code, {
    id: hostId,
    userId: session.user.id,
    nickname: session.user.name ?? "Host",
    avatar: session.user.image ?? undefined,
    score: 0,
  });

  buildPlaylistTracks(playlist.seeds).then((tracks) => {
    room.tracks = tracks;
  });

  return NextResponse.json({ code: room.code, playerId: hostId });
}
