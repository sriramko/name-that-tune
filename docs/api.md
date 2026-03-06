# API Reference

All endpoints are Next.js App Router route handlers under `/app/api/`. Requests and responses use JSON. Endpoints that require authentication check for a NextAuth session server-side; unauthenticated requests receive `401`. Game state (rooms, players, scores) is held in server memory and resets on server restart. Persistent data (user accounts, game history, custom playlists) lives in SQLite via Prisma.

---

## Auth

### `GET /api/auth/[...nextauth]`
### `POST /api/auth/[...nextauth]`

Handled entirely by NextAuth.js. Manages GitHub OAuth sign-in, session creation, and sign-out. No manual interaction needed.

---

## Rooms

### `POST /api/room/create`

Creates a new game room and registers the creator as the host.

**Auth required:** Yes (GitHub session)

**Request body:**
```json
{ "playlistId": "90s-hits" }
```

`playlistId` is either a curated playlist ID (e.g. `"90s-hits"`, `"todays-hits"`) or a custom playlist in the form `"custom:{id}"`.

**Response:**
```json
{ "code": "ABCD", "playerId": "<uuid>" }
```

`playerId` should be stored in `sessionStorage` on the client for the duration of the session.

**Errors:**
| Status | Reason |
|--------|--------|
| 401 | Not signed in |
| 400 | Missing `playlistId` |
| 400 | Unrecognised curated playlist ID |
| 404 | Custom playlist not found or not owned by caller |

---

### `POST /api/room/join`

Joins an existing room in the lobby phase.

**Auth required:** No (guests provide a nickname; signed-in users use their account name)

**Request body:**
```json
{ "code": "ABCD", "guestNickname": "Alice" }
```

`guestNickname` is required when not signed in and ignored when signed in.

**Response:**
```json
{ "code": "ABCD", "playerId": "<uuid>" }
```

**Errors:**
| Status | Reason |
|--------|--------|
| 400 | Missing room code |
| 400 | Missing nickname (guest with no name) |
| 400 | Game already in progress |
| 404 | Room not found |

---

### `GET /api/room/state?code=ABCD`

Returns the current state of a room. Used on page load to sync a rejoining client.

**Auth required:** No

**Query params:** `code` — the 4-letter room code

**Response:** Full `Room` object. The current track's `title` and `artist` are replaced with `"???"` while the phase is `"playing"` to prevent cheating.

**Errors:**
| Status | Reason |
|--------|--------|
| 400 | Missing `code` |
| 404 | Room not found |

---

## Game

### `POST /api/game/start`

Starts the game. Creates a `GameSession` and `GamePlayer` records in the database, then emits `game-started` to all room members via Pusher.

**Auth required:** No (caller identified by `playerId`)

**Request body:**
```json
{ "code": "ABCD", "playerId": "<uuid>" }
```

**Response:** `{ "ok": true }`

**Errors:**
| Status | Reason |
|--------|--------|
| 403 | Caller is not the host |
| 400 | Tracks not loaded yet |
| 404 | Room not found |

**Pusher event emitted:** `game-started` → `{ previewUrl, trackIndex, totalTracks }`

---

### `POST /api/game/guess`

Submits a title guess for the current round. Scoring is time-based: 10 points at 0 s, decreasing by 1 every 3 seconds (minimum 1 point). Wrong guesses deduct 1 point.

**Auth required:** No

**Request body:**
```json
{ "code": "ABCD", "playerId": "<uuid>", "guess": "Bohemian Rhapsody", "timeElapsed": 4.2 }
```

`timeElapsed` is the number of seconds since the clip started playing.

**Matching logic:** Case-insensitive, punctuation-stripped substring match — the guess just needs to contain or be contained by the normalised title.

**Response (correct):**
```json
{ "correct": true, "points": 8 }
```

**Response (wrong):**
```json
{ "correct": false }
```

**Pusher events emitted:**
- On correct guess: `artist-bonus-start` → `{ guesserPlayerId, guesserNickname, titlePoints, players }`
- On wrong guess: `scores-updated` → `{ players }`

**Errors:**
| Status | Reason |
|--------|--------|
| 404 | Room not found |

Returns `{ correct: false }` (not an HTTP error) when the phase is not `"playing"` or a winner already exists for the round.

---

### `POST /api/game/artist-guess`

Submits an artist guess during the artist bonus phase. Only the player who guessed the title correctly may call this. Correct guess awards +1 point.

**Auth required:** No

**Request body:**
```json
{ "code": "ABCD", "playerId": "<uuid>", "guess": "Queen" }
```

Multiple artists can be guessed comma-separated (e.g. `"Drake, Future"`). The track's artist field is split on `ft.`, `feat.`, `&`, `x`, and `,` before matching. Matching is a lenient substring check.

**Response:**
```json
{ "correct": true }
```
or
```json
{ "correct": false }
```

**Pusher event emitted (on correct):** `artist-bonus-result` → `{ correct: true, bonusWinner, track, players }`

**Errors:**
| Status | Reason |
|--------|--------|
| 404 | Room not found |

Returns `{ correct: false }` when phase is not `"artist-bonus"` or caller is not the designated guesser.

---

### `POST /api/game/artist-timeout`

Called by the title-winner's client when the 10-second artist bonus timer expires without a correct guess. Transitions the room to the `"reveal"` phase.

**Auth required:** No

**Request body:**
```json
{ "code": "ABCD", "playerId": "<uuid>" }
```

No-ops silently if the caller is not the designated artist guesser, or if the phase is no longer `"artist-bonus"`.

**Response:** `{ "ok": true }`

**Pusher event emitted:** `artist-bonus-result` → `{ correct: false, bonusWinner: null, track, players }`

---

### `POST /api/game/skip`

Called by the host's client when the audio clip ends with no correct title guess. Transitions the room to `"reveal"`.

**Auth required:** No (host verified by `playerId`)

**Request body:**
```json
{ "code": "ABCD", "playerId": "<uuid>" }
```

**Response:** `{ "ok": true }`

**Errors:**
| Status | Reason |
|--------|--------|
| 403 | Caller is not the host |
| 404 | Room not found |

**Pusher event emitted:** `round-skipped` → `{ track, players }`

---

### `POST /api/game/next`

Advances to the next round, or ends the game if all tracks have been played. On game end, writes final scores and ranks to the database.

**Auth required:** No (host verified by `playerId`)

**Request body:**
```json
{ "code": "ABCD", "playerId": "<uuid>" }
```

**Response:** `{ "ok": true }`

**Errors:**
| Status | Reason |
|--------|--------|
| 403 | Caller is not the host |
| 404 | Room not found |

**Pusher events emitted:**
- More rounds remaining: `next-round` → `{ previewUrl, trackIndex, totalTracks }`
- All rounds done: `game-finished` → `{ players }`

---

## iTunes

### `GET /api/itunes/search?q=`

Proxies the iTunes Search API and returns songs that have a 30-second preview URL. Used by the playlist builder.

**Auth required:** No

**Query params:** `q` — search query (any text; fuzzy match)

**Response:**
```json
{
  "results": [
    {
      "id": 123456,
      "title": "Bohemian Rhapsody",
      "artist": "Queen",
      "previewUrl": "https://...",
      "artworkUrl": "https://...600x600bb.jpg"
    }
  ]
}
```

Returns up to 8 results, all guaranteed to have a preview URL. Returns `{ "results": [] }` on network error or empty query.

---

## Playlists

### `GET /api/playlist`

Lists all custom playlists belonging to the signed-in user, including their tracks.

**Auth required:** Yes

**Response:**
```json
{
  "playlists": [
    {
      "id": "clxxx",
      "name": "Office Party Bangers",
      "createdAt": "2026-03-06T00:00:00.000Z",
      "tracks": [
        {
          "id": "clyyy",
          "title": "Uptown Funk",
          "artist": "Mark Ronson",
          "previewUrl": "https://...",
          "artworkUrl": "https://...",
          "position": 0
        }
      ]
    }
  ]
}
```

**Errors:**
| Status | Reason |
|--------|--------|
| 401 | Not signed in |

---

### `POST /api/playlist`

Creates a new custom playlist for the signed-in user.

**Auth required:** Yes

**Request body:**
```json
{
  "name": "Office Party Bangers",
  "tracks": [
    {
      "title": "Uptown Funk",
      "artist": "Mark Ronson",
      "previewUrl": "https://...",
      "artworkUrl": "https://..."
    }
  ]
}
```

Tracks are stored in the order provided (position assigned by index). Minimum 2 tracks required.

**Response:**
```json
{ "id": "clxxx" }
```

**Errors:**
| Status | Reason |
|--------|--------|
| 401 | Not signed in |
| 400 | Missing or empty `name` |
| 400 | Fewer than 2 tracks |

---

### `GET /api/playlist/[id]`

Loads a single custom playlist. Only accessible by the owner.

**Auth required:** Yes

**Response:**
```json
{
  "name": "Office Party Bangers",
  "tracks": [
    {
      "id": "clyyy",
      "title": "Uptown Funk",
      "artist": "Mark Ronson",
      "previewUrl": "https://...",
      "artworkUrl": "https://...",
      "position": 0
    }
  ]
}
```

**Errors:**
| Status | Reason |
|--------|--------|
| 401 | Not signed in |
| 404 | Playlist not found or not owned by caller |

---

### `PUT /api/playlist/[id]`

Replaces the name and full track list of an existing custom playlist. All previous tracks are deleted and replaced with the new list.

**Auth required:** Yes (must be the playlist owner)

**Request body:** Same shape as `POST /api/playlist`.

**Response:** `{ "ok": true }`

**Errors:**
| Status | Reason |
|--------|--------|
| 401 | Not signed in |
| 400 | Missing or empty `name` |
| 400 | Fewer than 2 tracks |
| 404 | Playlist not found or not owned by caller |

---

## Pusher Events Reference

Events are broadcast on the channel `room-{CODE}`. Clients subscribe on mount and unsubscribe on unmount.

| Event | Trigger | Payload |
|---|---|---|
| `player-joined` | Player joins lobby | `{ players }` |
| `game-started` | Host starts game | `{ previewUrl, trackIndex, totalTracks }` |
| `scores-updated` | Wrong title guess | `{ players }` |
| `artist-bonus-start` | Correct title guess | `{ guesserPlayerId, guesserNickname, titlePoints, players }` |
| `artist-bonus-result` | Artist guessed or timed out | `{ correct, bonusWinner, track, players }` |
| `round-skipped` | Clip ends, no correct guess | `{ track, players }` |
| `next-round` | Host advances round | `{ previewUrl, trackIndex, totalTracks }` |
| `game-finished` | Final round ends | `{ players }` |
