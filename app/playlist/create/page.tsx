"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";

interface SearchResult {
  id: number;
  title: string;
  artist: string;
  previewUrl: string;
  artworkUrl?: string;
}

interface AddedTrack {
  title: string;
  artist: string;
  previewUrl: string;
  artworkUrl?: string;
}

export default function CreatePlaylistPage() {
  const router = useRouter();
  const { status } = useSession();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [tracks, setTracks] = useState<AddedTrack[]>([]);
  const [playlistName, setPlaylistName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Redirect if not signed in
  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`/api/itunes/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results ?? []);
    } finally {
      setSearching(false);
    }
  }, []);

  function handleQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 350);
  }

  function addTrack(r: SearchResult) {
    if (tracks.some((t) => t.previewUrl === r.previewUrl)) return;
    setTracks((prev) => [...prev, { title: r.title, artist: r.artist, previewUrl: r.previewUrl, artworkUrl: r.artworkUrl }]);
    setQuery("");
    setResults([]);
  }

  function removeTrack(index: number) {
    setTracks((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setError("");
    if (!playlistName.trim()) return setError("Give your playlist a name");
    if (tracks.length < 2) return setError("Add at least 2 songs");
    setSaving(true);
    const res = await fetch("/api/playlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: playlistName, tracks }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) return setError(data.error ?? "Failed to save");
    router.push("/");
  }

  if (status === "loading") return null;

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center p-6">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-300 transition text-sm">
            ← Back
          </button>
          <h1 className="text-2xl font-black text-yellow-400">Create Playlist</h1>
        </div>

        {/* Playlist name */}
        <div className="flex flex-col gap-2 mb-6">
          <label className="text-gray-400 text-sm">Playlist name</label>
          <input
            className="w-full bg-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            placeholder='e.g. "Office Party Bangers"'
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            maxLength={40}
          />
        </div>

        {/* Song search */}
        <div className="flex flex-col gap-2 mb-4">
          <label className="text-gray-400 text-sm">Search for songs</label>
          <div className="relative">
            <input
              className="w-full bg-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder='e.g. "Bohemian Rhapsody" or "Taylor Swift"'
              value={query}
              onChange={handleQueryChange}
              autoComplete="off"
            />
            {searching && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Searching...</span>
            )}
          </div>

          {/* Search results */}
          {results.length > 0 && (
            <div className="bg-gray-900 rounded-xl overflow-hidden divide-y divide-gray-800">
              {results.map((r) => {
                const alreadyAdded = tracks.some((t) => t.previewUrl === r.previewUrl);
                return (
                  <div key={r.id} className="flex items-center gap-3 px-4 py-3">
                    {r.artworkUrl ? (
                      <Image
                        src={r.artworkUrl.replace("600x600bb", "100x100bb")}
                        alt={r.title}
                        width={40}
                        height={40}
                        className="rounded-lg shrink-0"
                        unoptimized
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-700 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{r.title}</p>
                      <p className="text-gray-400 text-xs truncate">{r.artist}</p>
                    </div>
                    <button
                      onClick={() => addTrack(r)}
                      disabled={alreadyAdded}
                      className={`shrink-0 text-sm font-bold px-3 py-1.5 rounded-lg transition ${
                        alreadyAdded
                          ? "bg-gray-700 text-gray-500 cursor-default"
                          : "bg-yellow-400 text-gray-950 hover:bg-yellow-300"
                      }`}
                    >
                      {alreadyAdded ? "Added" : "+ Add"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Added tracks */}
        {tracks.length > 0 && (
          <div className="flex flex-col gap-2 mb-6">
            <p className="text-gray-400 text-sm">{tracks.length} song{tracks.length !== 1 ? "s" : ""} added</p>
            <div className="bg-gray-900 rounded-xl overflow-hidden divide-y divide-gray-800">
              {tracks.map((t, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  {t.artworkUrl ? (
                    <Image
                      src={t.artworkUrl.replace("600x600bb", "100x100bb")}
                      alt={t.title}
                      width={36}
                      height={36}
                      className="rounded-md shrink-0"
                      unoptimized
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-md bg-gray-700 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{t.title}</p>
                    <p className="text-gray-400 text-xs truncate">{t.artist}</p>
                  </div>
                  <button
                    onClick={() => removeTrack(i)}
                    className="shrink-0 text-gray-600 hover:text-red-400 transition text-lg leading-none"
                    aria-label="Remove"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-yellow-400 text-gray-950 font-bold py-4 rounded-xl text-lg hover:bg-yellow-300 transition disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Playlist"}
        </button>

        <p className="text-center text-gray-600 text-xs mt-3">
          Songs must have a 30-second preview available on iTunes
        </p>
      </div>
    </main>
  );
}
