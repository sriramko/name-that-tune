export interface Track {
  title: string;
  artist: string;
  previewUrl: string;
  artworkUrl?: string;
}

export interface Player {
  id: string;
  userId?: string;
  nickname: string;
  avatar?: string;
  score: number;
}

export interface Room {
  code: string;
  hostId: string;
  players: Player[];
  playlistId: string;
  tracks: Track[];
  currentTrackIndex: number;
  phase: "lobby" | "playing" | "artist-bonus" | "reveal" | "finished";
  roundWinner: string | null;
  titlePoints: number | null;
  artistGuesserPlayerId: string | null;
  gameSessionId?: string;
}
