# Name That Tune!

Name That Tune! is a real-time multiplayer web game where players race to identify songs from 30-second audio previews. Guess the title fast for more points, then try to name the artist for a bonus point.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, TypeScript) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| Real-time | [Pusher Channels](https://pusher.com/channels) |
| Music | [iTunes Search API](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/) |
| Auth | [NextAuth.js v4](https://next-auth.js.org/) (GitHub OAuth) |
| Database | [Prisma 5](https://www.prisma.io/) + SQLite |
| Hosting | [Vercel](https://vercel.com/) |

---

## Features

- **Instant game rooms** — create a room and share the 4-letter code; no account required to join as a guest
- **Flexible sign-in** — sign in with GitHub OAuth or via email magic link (no password needed)
- **Cross-device multiplayer** — friends join from any browser using the room code
- **Real-time sync** — all game events (players joining, song starts, guesses, scores) broadcast live via Pusher WebSockets
- **5 curated playlists** — 90s Hits, 2000s Pop, Classic Rock, Taylor Swift, Today's Hits
- **Custom playlists** — signed-in users can build their own playlists by searching for any song; live iTunes fuzzy search shows results with album art as you type
- **iTunes previews** — 30-second audio clips fetched automatically, no API key required
- **Time-based scoring** — 10 points for an instant guess, dropping by 1 point every 3 seconds down to a minimum of 1; wrong guesses cost 1 point
- **Artist bonus round** — after a correct title guess, the winner has 10 seconds to name the artist(s) for +1 bonus point
- **Live color indicator** — progress bar and point counter shift from green to yellow to red as the song plays
- **Album art reveal** — the song's cover art is shown at full size when a round ends
- **Auto-skip** — if nobody guesses, the clip plays out and the round auto-advances
- **Host controls** — the room creator starts the game and advances between rounds
- **Medal scoreboard** — final results show gold/silver/bronze medals with ranked standings
- **Player stats** — signed-in users get a profile page with lifetime stats: games played, total points, win rate, best score, and a recent games history

---

## Getting Started

### Prerequisites

- Node.js 18+
- A free [Pusher Channels](https://pusher.com/) account
- A GitHub OAuth app (for account features)
- A free [Resend](https://resend.com/) account (for email magic link sign-in)

### Setup

```bash
git clone https://github.com/YOUR_USERNAME/name-that-tune.git
cd name-that-tune
npm install
```

Set up the database:

```bash
npx prisma migrate dev --name init
```

Create a `.env.local` file in the project root:

```env
# Pusher
PUSHER_APP_ID=your_app_id
PUSHER_KEY=your_key
PUSHER_SECRET=your_secret
PUSHER_CLUSTER=your_cluster
NEXT_PUBLIC_PUSHER_KEY=your_key
NEXT_PUBLIC_PUSHER_CLUSTER=your_cluster

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret

# GitHub OAuth (https://github.com/settings/developers)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Resend (https://resend.com/) — for email magic link sign-in
RESEND_API_KEY=your_resend_api_key
# Use "onboarding@resend.dev" for local testing, or "You <you@yourdomain.com>" in production
EMAIL_FROM="Name That Tune <onboarding@resend.dev>"

# Database
DATABASE_URL="file:./dev.db"
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## How to Play

1. Sign in with GitHub (optional — guests can join with just a nickname)
2. Create a room and pick a curated or custom playlist, or join with a friend's room code
3. Host hits **Start Game**
4. A 30-second song clip plays automatically — type the title and submit
5. First correct title guess wins the round points (faster = more points)
6. The winner has 10 seconds to guess the artist for a bonus point
7. Album art and the answer are revealed before the next round
8. After 10 rounds, the final scoreboard shows medals and standings

---

## Planned Features

- Invite links (no manual code entry)
- Spotify integration
