// 30 seconds / 10 points = 1 point lost every 3 seconds
export function calculatePoints(timeElapsed: number): number {
  return Math.max(1, 10 - Math.floor(timeElapsed / 3));
}

const TIER_COLORS: { barColor: string; textColor: string }[] = [
  { barColor: "bg-green-400",   textColor: "text-green-400" },   // 10
  { barColor: "bg-lime-400",    textColor: "text-lime-400" },    // 9
  { barColor: "bg-lime-300",    textColor: "text-lime-300" },    // 8
  { barColor: "bg-yellow-400",  textColor: "text-yellow-400" },  // 7
  { barColor: "bg-yellow-300",  textColor: "text-yellow-300" },  // 6
  { barColor: "bg-orange-400",  textColor: "text-orange-400" },  // 5
  { barColor: "bg-orange-500",  textColor: "text-orange-500" },  // 4
  { barColor: "bg-red-400",     textColor: "text-red-400" },     // 3
  { barColor: "bg-red-500",     textColor: "text-red-500" },     // 2
  { barColor: "bg-red-700",     textColor: "text-red-700" },     // 1
];

export function getScoreColors(timeElapsed: number): { barColor: string; textColor: string } {
  const points = calculatePoints(timeElapsed);
  return TIER_COLORS[10 - points] ?? TIER_COLORS[9];
}
