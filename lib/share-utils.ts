import { Tournament, Pool, Team, Match, SetScore } from "./types";

/* ──────────────────────────────────────────────
   Compact wire format — keeps URLs short
   ──────────────────────────────────────────────
   {
     n: string,           // tournament name
     p: Array<{
       n: string,         // pool name
       t: string[],       // team names (index = team "id")
       m: Array<         // matches in canonical pair order
         Array<[number, number]>  // set scores: [t1pts, t2pts]
       >
     }>
   }
   Match order: all C(teamCount, 2) pairs sorted as (i<j): (0,1),(0,2),...
   Empty match (not yet played): []
────────────────────────────────────────────── */

interface CompactPool {
  n: string;
  t: string[];
  m: Array<Array<[number, number]>>;
}

interface CompactTournament {
  n: string;
  p: CompactPool[];
}

function canonicalPairs(teamCount: number): [number, number][] {
  const pairs: [number, number][] = [];
  for (let i = 0; i < teamCount; i++)
    for (let j = i + 1; j < teamCount; j++)
      pairs.push([i, j]);
  return pairs;
}

// ── Encode ──────────────────────────────────

function poolToCompact(pool: Pool): CompactPool {
  const teams = pool.teams;
  const idxOf = new Map(teams.map((t, i) => [t.id, i]));
  const pairs = canonicalPairs(teams.length);

  // Index matches by (i,j) pair
  const matchByPair = new Map<string, Match>();
  for (const m of pool.matches) {
    const a = idxOf.get(m.team1Id) ?? -1;
    const b = idxOf.get(m.team2Id) ?? -1;
    if (a >= 0 && b >= 0) {
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;
      matchByPair.set(key, m);
    }
  }

  const matchData = pairs.map(([i, j]) => {
    const m = matchByPair.get(`${i}-${j}`);
    if (!m || m.sets.length === 0) return [] as [number, number][];
    return m.sets.map(s => [s.team1Points, s.team2Points] as [number, number]);
  });

  return { n: pool.name, t: teams.map(t => t.name), m: matchData };
}

export function encodeShare(tournament: Tournament): string {
  const compact: CompactTournament = {
    n: tournament.name,
    p: tournament.pools.map(poolToCompact),
  };
  const json = JSON.stringify(compact);
  // UTF-8 safe base64url
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  bytes.forEach(b => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

// ── Decode ──────────────────────────────────

function poolFromCompact(cp: CompactPool, poolIndex: number): Pool {
  const poolId = `sh-p${poolIndex}`;
  const teams: Team[] = cp.t.map((name, ti) => ({
    id: `${poolId}-t${ti}`,
    name,
    poolId,
  }));

  const pairs = canonicalPairs(teams.length);

  const matches: Match[] = cp.m
    .map((sets, mi) => {
      if (!sets || sets.length === 0) return null;
      const [i, j] = pairs[mi] ?? [0, 1];
      return {
        id: `${poolId}-${i}-${j}`,
        poolId,
        team1Id: teams[i]?.id ?? "",
        team2Id: teams[j]?.id ?? "",
        sets: sets.map(([t1, t2]) => ({ team1Points: t1, team2Points: t2 } as SetScore)),
      } as Match;
    })
    .filter((m): m is Match => m !== null);

  return { id: poolId, name: cp.n, teams, matches };
}

export function decodeShare(data: string): Tournament | null {
  try {
    // base64url → base64
    const base64 = data.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const json = new TextDecoder().decode(bytes);
    const compact = JSON.parse(json) as CompactTournament;

    return {
      id: "shared",
      name: compact.n,
      pools: compact.p.map(poolFromCompact),
    };
  } catch {
    return null;
  }
}

// Build the full share URL (works in both browser and SSR)
export function buildShareUrl(tournament: Tournament, origin?: string): string {
  const base = origin ?? (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/view?d=${encodeShare(tournament)}`;
}
