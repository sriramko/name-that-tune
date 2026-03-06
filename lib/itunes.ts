import { Track } from "@/types";

interface ITunesResult {
  trackName: string;
  artistName: string;
  previewUrl: string;
  artworkUrl100: string;
}

interface ITunesResponse {
  results: ITunesResult[];
}

export async function searchITunesPreview(
  title: string,
  artist: string
): Promise<Track | null> {
  const query = encodeURIComponent(`${title} ${artist}`);
  const url = `https://itunes.apple.com/search?term=${query}&entity=song&limit=5`;

  try {
    const res = await fetch(url);
    const data: ITunesResponse = await res.json();

    const match = data.results.find((r) => r.previewUrl);
    if (!match) return null;

    // Replace 100x100 with 600x600 for a larger artwork image
    const artworkUrl = match.artworkUrl100?.replace("100x100bb", "600x600bb");

    return {
      title: match.trackName,
      artist: match.artistName,
      previewUrl: match.previewUrl,
      artworkUrl,
    };
  } catch {
    return null;
  }
}

export async function buildPlaylistTracks(
  seeds: { title: string; artist: string }[]
): Promise<Track[]> {
  const results = await Promise.all(
    seeds.map((s) => searchITunesPreview(s.title, s.artist))
  );
  return results.filter((t): t is Track => t !== null);
}
