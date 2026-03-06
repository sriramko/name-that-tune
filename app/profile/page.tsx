import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

function playlistHref(playlistId: string) {
  if (playlistId.startsWith("custom:")) return `/playlist/${playlistId.slice(7)}`;
  return `/playlist/${playlistId}`;
}

function rankLabel(rank: number | null) {
  if (rank === 1) return { label: "1st", color: "text-yellow-400" };
  if (rank === 2) return { label: "2nd", color: "text-gray-300" };
  if (rank === 3) return { label: "3rd", color: "text-orange-400" };
  if (rank) return { label: `${rank}th`, color: "text-gray-500" };
  return { label: "—", color: "text-gray-600" };
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/");

  const gamePlayers = await prisma.gamePlayer.findMany({
    where: { userId: session.user.id },
    include: { gameSession: true },
    orderBy: { gameSession: { startedAt: "desc" } },
  });

  const gamesPlayed = gamePlayers.length;
  const totalPoints = gamePlayers.reduce((sum, gp) => sum + gp.score, 0);
  const avgPoints = gamesPlayed > 0 ? (totalPoints / gamesPlayed).toFixed(1) : "0";
  const gamesWon = gamePlayers.filter((gp) => gp.rank === 1).length;
  const winRate = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;
  const bestScore = gamesPlayed > 0 ? Math.max(...gamePlayers.map((gp) => gp.score)) : 0;

  const recentGames = gamePlayers.slice(0, 10);

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-2xl mx-auto">

        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-300 text-sm mb-8 transition"
        >
          ← Back to Home
        </Link>

        {/* Profile header */}
        <div className="flex items-center gap-4 mb-8">
          {session.user.image && (
            <Image
              src={session.user.image}
              alt="avatar"
              width={72}
              height={72}
              className="rounded-full"
              unoptimized
            />
          )}
          <div>
            <h1 className="text-2xl font-black">{session.user.name}</h1>
            <p className="text-gray-500 text-sm">{session.user.email}</p>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          <StatCard label="Games Played" value={gamesPlayed} />
          <StatCard label="Total Points" value={totalPoints} highlight />
          <StatCard label="Avg Points" value={avgPoints} />
          <StatCard label="Games Won" value={gamesWon} />
          <StatCard label="Win Rate" value={`${winRate}%`} />
          <StatCard label="Best Score" value={bestScore} />
        </div>

        {/* Recent games */}
        <div className="bg-gray-900 rounded-2xl p-5">
          <h2 className="text-gray-400 text-xs uppercase tracking-wider mb-4">
            Recent Games
          </h2>

          {recentGames.length === 0 ? (
            <p className="text-gray-600 text-sm text-center py-6">
              No games played yet. Create or join a room to get started!
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-gray-800">
              {recentGames.map((gp) => {
                const { label, color } = rankLabel(gp.rank);
                return (
                  <li key={gp.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div className="flex flex-col">
                      <Link
                        href={playlistHref(gp.gameSession.playlistId)}
                        className="font-medium text-sm hover:text-yellow-400 transition"
                      >
                        {gp.gameSession.playlistName}
                      </Link>
                      <span className="text-gray-500 text-xs">
                        {formatDate(gp.gameSession.startedAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-yellow-400 font-bold text-sm">
                        {gp.score} pts
                      </span>
                      <span className={`text-sm font-semibold w-8 text-right ${color}`}>
                        {label}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

      </div>
    </main>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="bg-gray-900 rounded-xl p-4 flex flex-col gap-1">
      <span className="text-gray-500 text-xs uppercase tracking-wider">{label}</span>
      <span className={`text-3xl font-black ${highlight ? "text-yellow-400" : "text-white"}`}>
        {value}
      </span>
    </div>
  );
}
