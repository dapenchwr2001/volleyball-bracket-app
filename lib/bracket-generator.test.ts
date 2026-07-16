import { describe, it, expect } from "vitest";
import {
  assignToBrackets,
  reseedBrackets,
  generateBracketStructure,
} from "./bracket-generator";
import { Team, TeamStanding, BracketTeam } from "./types";

function standing(id: string, fivbPoints: number, setDifference = 0): TeamStanding {
  const team: Team = { id, name: id, poolId: "p1" };
  return {
    team,
    fivbPoints,
    setsWon: 0,
    setsLost: 0,
    pointsWon: 0,
    pointsLost: 0,
    setDifference,
    pointDifference: 0,
  };
}

function bracketTeam(id: string, fivbPoints: number, setDifference = 0): BracketTeam {
  return { seed: 0, team: { id, name: id, poolId: "p1" }, standing: standing(id, fivbPoints, setDifference) };
}

describe("assignToBrackets", () => {
  it("sends 1st place to Gold, 2nd/3rd to Silver, 4th to Bronze", () => {
    const poolStandings = new Map([
      ["poolA", [standing("a1", 9), standing("a2", 6), standing("a3", 3), standing("a4", 0)]],
    ]);
    const brackets = assignToBrackets(poolStandings);
    expect(brackets.get("Gold")!.map((t) => t.team.id)).toEqual(["a1"]);
    expect(brackets.get("Silver")!.map((t) => t.team.id)).toEqual(["a2", "a3"]);
    expect(brackets.get("Bronze")!.map((t) => t.team.id)).toEqual(["a4"]);
  });

  it("combines placements across multiple pools", () => {
    const poolStandings = new Map([
      ["poolA", [standing("a1", 9), standing("a2", 6), standing("a3", 3), standing("a4", 0)]],
      ["poolB", [standing("b1", 9), standing("b2", 6), standing("b3", 3), standing("b4", 0)]],
    ]);
    const brackets = assignToBrackets(poolStandings);
    expect(brackets.get("Gold")!.map((t) => t.team.id)).toEqual(["a1", "b1"]);
    expect(brackets.get("Silver")!.map((t) => t.team.id)).toEqual(["a2", "a3", "b2", "b3"]);
    expect(brackets.get("Bronze")!.map((t) => t.team.id)).toEqual(["a4", "b4"]);
  });

  it("sends 5th place to Iron and 6th place to Wood", () => {
    const poolStandings = new Map([
      [
        "poolA",
        [
          standing("a1", 15),
          standing("a2", 12),
          standing("a3", 9),
          standing("a4", 6),
          standing("a5", 3),
          standing("a6", 0),
        ],
      ],
    ]);
    const brackets = assignToBrackets(poolStandings);
    expect(brackets.get("Iron")!.map((t) => t.team.id)).toEqual(["a5"]);
    expect(brackets.get("Wood")!.map((t) => t.team.id)).toEqual(["a6"]);
  });

  it("drops teams placed 7th or lower in a pool (no division exists beyond Wood)", () => {
    const poolStandings = new Map([
      [
        "poolA",
        [
          standing("a1", 18),
          standing("a2", 15),
          standing("a3", 12),
          standing("a4", 9),
          standing("a5", 6),
          standing("a6", 3),
          standing("a7", 0),
        ],
      ],
    ]);
    const brackets = assignToBrackets(poolStandings);
    const assigned = [
      ...brackets.get("Gold")!,
      ...brackets.get("Silver")!,
      ...brackets.get("Bronze")!,
      ...brackets.get("Iron")!,
      ...brackets.get("Wood")!,
    ].map((t) => t.team.id);
    expect(assigned).not.toContain("a7");
  });
});

describe("reseedBrackets", () => {
  it("sorts teams within a bracket by fivbPoints descending and assigns seeds", () => {
    const brackets = new Map([
      ["Silver" as const, [bracketTeam("low", 3), bracketTeam("high", 9), bracketTeam("mid", 6)]],
    ]);
    const reseeded = reseedBrackets(brackets);
    const silver = reseeded.get("Silver")!;
    expect(silver.map((t) => t.team.id)).toEqual(["high", "mid", "low"]);
    expect(silver.map((t) => t.seed)).toEqual([1, 2, 3]);
  });

  it("breaks ties in fivbPoints using set difference", () => {
    const brackets = new Map([
      [
        "Silver" as const,
        [bracketTeam("tiedLow", 6, -2), bracketTeam("tiedHigh", 6, 4)],
      ],
    ]);
    const reseeded = reseedBrackets(brackets);
    expect(reseeded.get("Silver")!.map((t) => t.team.id)).toEqual(["tiedHigh", "tiedLow"]);
  });
});

describe("generateBracketStructure", () => {
  function bracketTeams(count: number): BracketTeam[] {
    return Array.from({ length: count }, (_, i) => ({
      seed: i + 1,
      team: { id: `t${i + 1}`, name: `t${i + 1}`, poolId: "p1" },
      standing: standing(`t${i + 1}`, 0),
    }));
  }

  it("returns no rounds for an empty bracket", () => {
    expect(generateBracketStructure([])).toEqual([]);
  });

  it("builds 2 rounds for 4 teams", () => {
    const rounds = generateBracketStructure(bracketTeams(4));
    expect(rounds).toHaveLength(2);
    expect(rounds[0]).toHaveLength(2); // semifinals
    expect(rounds[1]).toHaveLength(1); // final
  });

  it("builds 3 rounds for 5, 6, 7, or 8 teams (with byes for non-powers-of-2)", () => {
    for (const count of [5, 6, 7, 8]) {
      const rounds = generateBracketStructure(bracketTeams(count));
      expect(rounds).toHaveLength(3);
      expect(rounds[0]).toHaveLength(Math.ceil(count / 2));
      expect(rounds[1]).toHaveLength(2);
      expect(rounds[2]).toHaveLength(1);
    }
  });

  it("leaves an odd team out of round 1 as a bye (undefined team2)", () => {
    const rounds = generateBracketStructure(bracketTeams(5));
    const lastFirstRoundMatch = rounds[0][rounds[0].length - 1];
    expect(lastFirstRoundMatch.team2).toBeUndefined();
    expect(lastFirstRoundMatch.team1).toBeDefined();
  });
});
