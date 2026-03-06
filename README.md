# Name That Tune!

Name That Tune Multiplayer is a real-time web game where players compete
to identify songs as quickly as possible. The system uses a WebSocket
server to synchronize gameplay between players and manages lobbies,
round timers, and scoring logic on the backend.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, TypeScript) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| Real-time | [Pusher Channels](https://pusher.com/channels) |
| Music | [iTunes Search API](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/) |
| Hosting | [Vercel](https://vercel.com/) (planned) |

No database — game state is held in server memory, making setup completely dependency-free beyond a Pusher account.

---

## Features

- **Instant game rooms** — create a room and get a shareable 4-letter code; no accounts needed
- **Cross-device multiplayer** — friends join from any browser using the room code
- **Real-time sync** — all game events (players joining, song starts, guesses, scores) are broadcast live via Pusher WebSockets
- **5 curated playlists** — 90s Hits, 2000s Pop, Classic Rock, Taylor Swift, Today's Hits
- **iTunes previews** — 30-second audio clips fetched automatically, no API key required
- **Time-based scoring** — 10 points for guessing in the first 3 seconds, dropping by 1 point every 3 seconds down to 1 point; wrong guesses cost 1 point
- **Live color indicator** — the progress bar and point counter shift from green to yellow to red as the song plays
- **Album art reveal** — the song's cover art is shown at full size when a round ends
- **Auto-skip** — if nobody guesses, the song plays out and the round auto-advances
- **Host controls** — the room creator starts the game and advances between rounds

---

## Getting Started

### Prerequisites

- Node.js 18+
- A free [Pusher Channels](https://pusher.com/) account

### Setup

```bash
git clone https://github.com/YOUR_USERNAME/name-that-tune.git
cd name-that-tune
npm install
```

Create a `.env.local` file in the project root:

```env
PUSHER_APP_ID=your_app_id
PUSHER_KEY=your_key
PUSHER_SECRET=your_secret
PUSHER_CLUSTER=your_cluster
NEXT_PUBLIC_PUSHER_KEY=your_key
NEXT_PUBLIC_PUSHER_CLUSTER=your_cluster
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## How to Play

1. One player creates a room and picks a playlist
2. Share the 4-letter room code with friends
3. Everyone joins from their own device
4. Host hits **Start Game**
5. A 30-second song clip plays automatically — type your guess and submit
6. First correct title match wins the round and earns points
7. After 10 rounds, the final scoreboard is shown

---

## Planned Features

- Player accounts and persistent stats
- Invite links (no manual code entry)
- Custom user-created playlists
- Spotify integration
