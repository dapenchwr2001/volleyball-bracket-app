import { Pool, ScheduleEntry } from "./types";

// Circle-method round-robin for 4 teams → 3 rounds of 2 matches each
// Pairs are [teamIndex, teamIndex] with lower index first
const ROUNDS_4TEAM: [number, number][][] = [
  [[0, 3], [1, 2]],
  [[0, 2], [1, 3]],
  [[0, 1], [2, 3]],
];

export function generateMatchSlots(pools: Pool[]): ScheduleEntry[] {
  const entries: ScheduleEntry[] = [];
  for (const pool of pools) {
    for (const round of ROUNDS_4TEAM) {
      for (const [a, b] of round) {
        const i = Math.min(a, b);
        const j = Math.max(a, b);
        entries.push({
          matchId: `${pool.id}-${i}-${j}`,
          poolId: pool.id,
          poolName: pool.name,
          team1Name: pool.teams[i]?.name ?? `Team ${i + 1}`,
          team2Name: pool.teams[j]?.name ?? `Team ${j + 1}`,
          time: "",
          court: "",
        });
      }
    }
  }
  return entries;
}

function addMinutes(baseHour: number, baseMin: number, totalMinutesAdded: number) {
  const total = baseHour * 60 + baseMin + totalMinutesAdded;
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  const period = h >= 12 ? "PM" : "AM";
  const display = `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${period}`;
  return display;
}

// Interleaves rounds across pools so same-pool teams never clash in the same time slot.
// Then chunks by court count to assign time slots.
export function autoSchedule(
  pools: Pool[],
  startTime: string,        // "08:00"
  durationMinutes: number,
  courts: string[]
): ScheduleEntry[] {
  if (!courts.length) return generateMatchSlots(pools);

  const [h, m] = startTime.split(":").map(Number);

  // Build interleaved match sequence: for each round, iterate all pools then all matches in that round
  const sequence: ScheduleEntry[] = [];
  for (const round of ROUNDS_4TEAM) {
    for (const matchPair of round) {
      for (const pool of pools) {
        const [a, b] = matchPair;
        const i = Math.min(a, b);
        const j = Math.max(a, b);
        sequence.push({
          matchId: `${pool.id}-${i}-${j}`,
          poolId: pool.id,
          poolName: pool.name,
          team1Name: pool.teams[i]?.name ?? `Team ${i + 1}`,
          team2Name: pool.teams[j]?.name ?? `Team ${j + 1}`,
          time: "",
          court: "",
        });
      }
    }
  }

  // Assign time slots: fill all courts before advancing the clock
  return sequence.map((entry, idx) => ({
    ...entry,
    court: courts[idx % courts.length],
    time: addMinutes(h, m, Math.floor(idx / courts.length) * durationMinutes),
  }));
}
