import { Pool, TeamStanding, Team, Match, SetScore } from "./types";

// Calculate how many sets a team won in a match
function getSetsWon(
  team1Id: string,
  team2Id: string,
  sets: SetScore[]
): { team1: number; team2: number } {
  let team1SetsWon = 0;
  let team2SetsWon = 0;

  for (const set of sets) {
    if (set.team1Points > set.team2Points) {
      team1SetsWon++;
    } else {
      team2SetsWon++;
    }
  }

  return { team1: team1SetsWon, team2: team2SetsWon };
}

// Get FIVB points for a match result (3-2-1-0 system)
function getFivbPoints(setsWon: number, setsLost: number): number {
  if (setsWon === 3) {
    if (setsLost === 0) return 3; // 3-0
    if (setsLost === 1) return 3; // 3-1
    if (setsLost === 2) return 1; // 3-2
  }
  return 0; // Loss
}

// Calculate standings for a pool
export function calculatePoolStandings(pool: Pool): TeamStanding[] {
  const teamStats = new Map<string, TeamStanding>();

  // Initialize all teams
  pool.teams.forEach((team) => {
    teamStats.set(team.id, {
      team,
      fivbPoints: 0,
      setsWon: 0,
      setsLost: 0,
      pointsWon: 0,
      pointsLost: 0,
      setDifference: 0,
      pointDifference: 0,
    });
  });

  // Process each match
  pool.matches.forEach((match) => {
    const setsWon = getSetsWon(match.team1Id, match.team2Id, match.sets);

    const team1Stats = teamStats.get(match.team1Id)!;
    const team2Stats = teamStats.get(match.team2Id)!;

    // Add FIVB points
    team1Stats.fivbPoints += getFivbPoints(setsWon.team1, setsWon.team2);
    team2Stats.fivbPoints += getFivbPoints(setsWon.team2, setsWon.team1);

    // Add set wins/losses
    team1Stats.setsWon += setsWon.team1;
    team1Stats.setsLost += setsWon.team2;
    team2Stats.setsWon += setsWon.team2;
    team2Stats.setsLost += setsWon.team1;

    // Add point wins/losses
    match.sets.forEach((set) => {
      team1Stats.pointsWon += set.team1Points;
      team1Stats.pointsLost += set.team2Points;
      team2Stats.pointsWon += set.team2Points;
      team2Stats.pointsLost += set.team1Points;
    });
  });

  // Calculate differentials
  const standings = Array.from(teamStats.values());
  standings.forEach((standing) => {
    standing.setDifference = standing.setsWon - standing.setsLost;
    standing.pointDifference = standing.pointsWon - standing.pointsLost;
  });

  // Sort by FIVB points first, then tiebreakers
  return standings.sort((a, b) => {
    // Primary: FIVB points
    if (a.fivbPoints !== b.fivbPoints) {
      return b.fivbPoints - a.fivbPoints;
    }

    // Tiebreaker 1: Set difference
    if (a.setDifference !== b.setDifference) {
      return b.setDifference - a.setDifference;
    }

    // Tiebreaker 2: Point difference
    if (a.pointDifference !== b.pointDifference) {
      return b.pointDifference - a.pointDifference;
    }

    // Tiebreaker 3: Head-to-head (if needed, would require more complex logic)
    // For now, maintain stable sort
    return 0;
  });
}

// Get all standings across all pools
export function getAllPoolStandings(pools: Pool[]): Map<string, TeamStanding[]> {
  const allStandings = new Map<string, TeamStanding[]>();
  pools.forEach((pool) => {
    allStandings.set(pool.id, calculatePoolStandings(pool));
  });
  return allStandings;
}
