import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/playlist — list the signed-in user's custom playlists
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const playlists = await prisma.customPlaylist.findMany({
    where: { userId: session.user.id },
    include: { tracks: { orderBy: { position: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ playlists });
}

// POST /api/playlist — create a custom playlist
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, tracks } = await req.json();

  if (!name?.trim()) return NextResponse.json({ error: "Playlist name is required" }, { status: 400 });
  if (!Array.isArray(tracks) || tracks.length < 2) {
    return NextResponse.json({ error: "Add at least 2 songs" }, { status: 400 });
  }

  const playlist = await prisma.customPlaylist.create({
    data: {
      userId: session.user.id,
      name: name.trim(),
      tracks: {
        create: tracks.map((t: { title: string; artist: string; previewUrl: string; artworkUrl?: string }, i: number) => ({
          title: t.title,
          artist: t.artist,
          previewUrl: t.previewUrl,
          artworkUrl: t.artworkUrl ?? null,
          position: i,
        })),
      },
    },
  });

  return NextResponse.json({ id: playlist.id });
}
