// Team and tournament data types

export interface Team {
  id: string;
  name: string;
  poolId: string;
}

export interface SetScore {
  team1Points: number;
  team2Points: number;
}

export interface Match {
  id: string;
  poolId: string;
  team1Id: string;
  team2Id: string;
  sets: SetScore[];
}

export interface Pool {
  id: string;
  name: string;
  teams: Team[];
  matches: Match[];
}

export interface Tournament {
  id: string;
  name: string;
  pools: Pool[];
}

// Tournament results after seeding
export interface TeamStanding {
  team: Team;
  fivbPoints: number; // 3-2-1-0 points
  setsWon: number;
  setsLost: number;
  pointsWon: number;
  pointsLost: number;
  setDifference: number;
  pointDifference: number;
}

export interface BracketTeam {
  seed: number;
  team: Team;
  standing: TeamStanding;
}

export type BracketDivision = "Gold" | "Silver" | "Bronze" | "Iron" | "Wood";

export interface Bracket {
  division: BracketDivision;
  teams: BracketTeam[];
}

export interface BracketMatch {
  id: string;
  seed1?: number;
  seed2?: number;
  team1?: BracketTeam;
  team2?: BracketTeam;
  round: number;
  position: number;
}
