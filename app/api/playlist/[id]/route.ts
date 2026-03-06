import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/playlist/[id] — load a playlist (owner only)
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const playlist = await prisma.customPlaylist.findUnique({
    where: { id },
    include: { tracks: { orderBy: { position: "asc" } } },
  });

  if (!playlist || playlist.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ name: playlist.name, tracks: playlist.tracks });
}

// PUT /api/playlist/[id] — replace name and all tracks
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { name, tracks } = await req.json();

  if (!name?.trim()) return NextResponse.json({ error: "Playlist name is required" }, { status: 400 });
  if (!Array.isArray(tracks) || tracks.length < 2) {
    return NextResponse.json({ error: "Add at least 2 songs" }, { status: 400 });
  }

  const existing = await prisma.customPlaylist.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Delete existing tracks and replace with new ones
  await prisma.customPlaylistTrack.deleteMany({ where: { customPlaylistId: id } });
  await prisma.customPlaylist.update({
    where: { id },
    data: {
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

  return NextResponse.json({ ok: true });
}
