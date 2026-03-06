import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { PLAYLISTS } from "@/lib/playlists";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PlaylistPage({ params }: Props) {
  const { id } = await params;

  // Check curated playlists first
  const curated = PLAYLISTS.find((p) => p.id === id);
  if (curated) {
    return (
      <main className="min-h-screen bg-gray-950 text-white p-6">
        <div className="max-w-lg mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-300 text-sm mb-8 transition">
            ← Back to Home
          </Link>

          <div className="mb-6">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Curated Playlist</p>
            <h1 className="text-3xl font-black text-yellow-400">{curated.name}</h1>
            <p className="text-gray-400 text-sm mt-1">{curated.description}</p>
          </div>

          <div className="bg-gray-900 rounded-2xl overflow-hidden divide-y divide-gray-800">
            {curated.seeds.map((track, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <span className="text-gray-600 text-sm tabular-nums w-5 shrink-0">{i + 1}</span>
                <div className="w-10 h-10 rounded-md bg-gray-700 shrink-0 flex items-center justify-center text-gray-500 text-xs">
                  ♪
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">{track.title}</p>
                  <p className="text-gray-400 text-xs truncate">{track.artist}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-gray-600 text-xs mt-4">
            {curated.seeds.length} songs · previews loaded from iTunes when a game starts
          </p>
        </div>
      </main>
    );
  }

  // Try custom playlist
  const playlist = await prisma.customPlaylist.findUnique({
    where: { id },
    include: {
      tracks: { orderBy: { position: "asc" } },
      user: { select: { name: true, image: true } },
    },
  });

  if (!playlist) notFound();

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-lg mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-300 text-sm mb-8 transition">
          ← Back to Home
        </Link>

        <div className="mb-6">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Custom Playlist</p>
          <h1 className="text-3xl font-black text-yellow-400">{playlist.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            {playlist.user.image && (
              <Image
                src={playlist.user.image}
                alt={playlist.user.name ?? ""}
                width={20}
                height={20}
                className="rounded-full"
                unoptimized
              />
            )}
            <p className="text-gray-400 text-sm">by {playlist.user.name ?? "Unknown"}</p>
          </div>
        </div>

        <div className="bg-gray-900 rounded-2xl overflow-hidden divide-y divide-gray-800">
          {playlist.tracks.map((track, i) => (
            <div key={track.id} className="flex items-center gap-4 px-5 py-4">
              <span className="text-gray-600 text-sm tabular-nums w-5 shrink-0">{i + 1}</span>
              {track.artworkUrl ? (
                <Image
                  src={track.artworkUrl.replace("600x600bb", "100x100bb")}
                  alt={track.title}
                  width={40}
                  height={40}
                  className="rounded-md shrink-0"
                  unoptimized
                />
              ) : (
                <div className="w-10 h-10 rounded-md bg-gray-700 shrink-0 flex items-center justify-center text-gray-500 text-xs">
                  ♪
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{track.title}</p>
                <p className="text-gray-400 text-xs truncate">{track.artist}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-600 text-xs mt-4">
          {playlist.tracks.length} songs
        </p>
      </div>
    </main>
  );
}
