import { Tournament, Pool, Team, Match, SetScore } from "./types";
import { v4 as uuidv4 } from "crypto";

// Simple UUID-like generator (crypto module might not be available in browser)
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export class TournamentManager {
  tournament: Tournament;

  constructor(name: string) {
    this.tournament = {
      id: generateId(),
      name,
      pools: [],
    };
  }

  addPool(poolName: string): Pool {
    const pool: Pool = {
      id: generateId(),
      name: poolName,
      teams: [],
      matches: [],
    };
    this.tournament.pools.push(pool);
    return pool;
  }

  addTeamToPool(poolId: string, teamName: string): Team {
    const pool = this.tournament.pools.find((p) => p.id === poolId);
    if (!pool) throw new Error(`Pool ${poolId} not found`);

    const team: Team = {
      id: generateId(),
      name: teamName,
      poolId,
    };
    pool.teams.push(team);
    return team;
  }

  addMatch(
    poolId: string,
    team1Id: string,
    team2Id: string,
    sets: SetScore[]
  ): Match {
    const pool = this.tournament.pools.find((p) => p.id === poolId);
    if (!pool) throw new Error(`Pool ${poolId} not found`);

    const match: Match = {
      id: generateId(),
      poolId,
      team1Id,
      team2Id,
      sets,
    };
    pool.matches.push(match);
    return match;
  }

  // Serialize to JSON for localStorage
  toJSON(): string {
    return JSON.stringify(this.tournament);
  }

  // Deserialize from JSON
  static fromJSON(json: string): TournamentManager {
    const tournament = JSON.parse(json) as Tournament;
    const manager = new TournamentManager(tournament.name);
    manager.tournament = tournament;
    return manager;
  }

  // Export tournament data
  exportData() {
    return this.tournament;
  }
}
