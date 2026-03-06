import { Room, Player } from "@/types";

// In-memory store — resets on server restart, fine for demo
const rooms = new Map<string, Room>();

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function createRoom(hostId: string, playlistId: string): Room {
  let code = generateCode();
  while (rooms.has(code)) code = generateCode();

  const room: Room = {
    code,
    hostId,
    players: [],
    playlistId,
    tracks: [],
    currentTrackIndex: 0,
    phase: "lobby",
    roundWinner: null,
    titlePoints: null,
    artistGuesserPlayerId: null,
  };

  rooms.set(code, room);
  return room;
}

export function getRoom(code: string): Room | undefined {
  return rooms.get(code);
}

export function addPlayer(code: string, player: Player): Room | null {
  const room = rooms.get(code);
  if (!room) return null;
  if (!room.players.find((p) => p.id === player.id)) {
    room.players.push(player);
  }
  return room;
}

export function updateRoom(code: string, updates: Partial<Room>): Room | null {
  const room = rooms.get(code);
  if (!room) return null;
  Object.assign(room, updates);
  return room;
}
