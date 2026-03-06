import { NextRequest, NextResponse } from "next/server";

interface ITunesResult {
  trackId: number;
  trackName: string;
  artistName: string;
  previewUrl: string;
  artworkUrl100: string;
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ results: [] });

  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=song&limit=8`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    const data = await res.json();

    const results = (data.results as ITunesResult[])
      .filter((r) => r.previewUrl)
      .map((r) => ({
        id: r.trackId,
        title: r.trackName,
        artist: r.artistName,
        previewUrl: r.previewUrl,
        artworkUrl: r.artworkUrl100?.replace("100x100bb", "600x600bb"),
      }));

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
