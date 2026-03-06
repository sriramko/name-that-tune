-- CreateTable
CREATE TABLE "CustomPlaylist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CustomPlaylist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CustomPlaylistTrack" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customPlaylistId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "previewUrl" TEXT NOT NULL,
    "artworkUrl" TEXT,
    "position" INTEGER NOT NULL,
    CONSTRAINT "CustomPlaylistTrack_customPlaylistId_fkey" FOREIGN KEY ("customPlaylistId") REFERENCES "CustomPlaylist" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
