import {
  BracketTeam,
  BracketDivision,
  Bracket,
  BracketMatch,
  TeamStanding,
  Pool,
} from "./types";

// Assign teams to brackets with exactly 4 teams per division
export function assignToBrackets(
  poolStandings: Map<string, TeamStanding[]>
): Map<BracketDivision, BracketTeam[]> {
  // Collect all teams and sort by FIVB points globally
  const allTeams: BracketTeam[] = [];

  poolStandings.forEach((standings) => {
    standings.forEach((standing) => {
      allTeams.push({
        seed: 0, // Will be re-seeded
        team: standing.team,
        standing: standing,
      });
    });
  });

  // Sort by FIVB points (descending), then by set difference
  allTeams.sort((a, b) => {
    if (a.standing.fivbPoints !== b.standing.fivbPoints) {
      return b.standing.fivbPoints - a.standing.fivbPoints;
    }
    return b.standing.setDifference - a.standing.setDifference;
  });

  // Distribute teams round-robin across brackets (4 teams per bracket)
  const brackets = new Map<BracketDivision, BracketTeam[]>([
    ["Gold", []],
    ["Silver", []],
    ["Bronze", []],
  ]);

  const divisions: BracketDivision[] = ["Gold", "Silver", "Bronze"];

  allTeams.forEach((team, index) => {
    const divisionIndex = index % 3;
    brackets.get(divisions[divisionIndex])!.push(team);
  });

  return brackets;
}

// Re-seed within each bracket (sort by FIVB points)
export function reseedBrackets(
  brackets: Map<BracketDivision, BracketTeam[]>
): Map<BracketDivision, BracketTeam[]> {
  const reseeded = new Map<BracketDivision, BracketTeam[]>();

  brackets.forEach((teams, division) => {
    // Sort by FIVB points (descending)
    const sorted = [...teams].sort((a, b) => {
      if (a.standing.fivbPoints !== b.standing.fivbPoints) {
        return b.standing.fivbPoints - a.standing.fivbPoints;
      }
      // Use set difference as secondary sort
      return (
        b.standing.setDifference - a.standing.setDifference
      );
    });

    // Assign seeds
    sorted.forEach((team, index) => {
      team.seed = index + 1;
    });

    reseeded.set(division, sorted);
  });

  return reseeded;
}

// Generate single-elimination bracket structure
export function generateBracketStructure(
  teams: BracketTeam[]
): BracketMatch[][] {
  if (teams.length === 0) return [];

  // Calculate number of rounds needed
  let numTeams = teams.length;
  let numRounds = 0;
  let temp = numTeams;
  while (temp > 1) {
    temp = Math.ceil(temp / 2);
    numRounds++;
  }

  const rounds: BracketMatch[][] = [];
  let currentRoundTeams = [...teams];

  // First round
  const firstRound: BracketMatch[] = [];
  for (let i = 0; i < currentRoundTeams.length; i += 2) {
    const match: BracketMatch = {
      id: `match-1-${Math.floor(i / 2)}`,
      seed1: currentRoundTeams[i]?.seed,
      seed2: currentRoundTeams[i + 1]?.seed,
      team1: currentRoundTeams[i],
      team2: currentRoundTeams[i + 1],
      round: 1,
      position: Math.floor(i / 2),
    };
    firstRound.push(match);
  }
  rounds.push(firstRound);

  // Subsequent rounds (structure only, no teams assigned yet)
  for (let round = 2; round <= numRounds; round++) {
    const roundMatches: BracketMatch[] = [];
    const matchesInRound = Math.pow(2, numRounds - round);

    for (let i = 0; i < matchesInRound; i++) {
      const match: BracketMatch = {
        id: `match-${round}-${i}`,
        round,
        position: i,
      };
      roundMatches.push(match);
    }
    rounds.push(roundMatches);
  }

  return rounds;
}

// Create complete bracket for a division
export function createBracket(
  division: BracketDivision,
  teams: BracketTeam[]
): Bracket {
  return {
    division,
    teams,
  };
}

// Main function to generate all brackets based on pool placement
export function generateAllBrackets(
  poolStandings: Map<string, TeamStanding[]>
): Map<BracketDivision, Bracket> {
  // Assign teams to brackets based on their pool placement
  const unassignedBrackets = assignToBrackets(poolStandings);

  // Re-seed teams within each bracket by FIVB points
  const reseedBracket = reseedBrackets(unassignedBrackets);

  const brackets = new Map<BracketDivision, Bracket>();

  reseedBracket.forEach((teams, division) => {
    if (teams.length > 0) {
      brackets.set(division, createBracket(division, teams));
    }
  });

  return brackets;
}
