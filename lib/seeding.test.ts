import { describe, it, expect } from "vitest";
import { calculatePoolStandings } from "./seeding";
import { Pool, Team, Match } from "./types";

function team(id: string): Team {
  return { id, name: id, poolId: "p1" };
}

function match(team1Id: string, team2Id: string, sets: [number, number][]): Match {
  return {
    id: `${team1Id}-${team2Id}`,
    poolId: "p1",
    team1Id,
    team2Id,
    sets: sets.map(([team1Points, team2Points]) => ({ team1Points, team2Points })),
  };
}

describe("calculatePoolStandings", () => {
  it("awards 3 points for a 3-0 win and 0 for the loss", () => {
    const pool: Pool = {
      id: "p1",
      name: "Pool A",
      teams: [team("a"), team("b")],
      matches: [match("a", "b", [[25, 10], [25, 15], [25, 20]])],
    };
    const [first, second] = calculatePoolStandings(pool);
    expect(first.team.id).toBe("a");
    expect(first.fivbPoints).toBe(3);
    expect(second.fivbPoints).toBe(0);
  });

  it("awards 3 points for a 3-1 win and 0 for the loss", () => {
    const pool: Pool = {
      id: "p1",
      name: "Pool A",
      teams: [team("a"), team("b")],
      matches: [match("a", "b", [[25, 10], [20, 25], [25, 15], [25, 20]])],
    };
    const standings = calculatePoolStandings(pool);
    const a = standings.find((s) => s.team.id === "a")!;
    const b = standings.find((s) => s.team.id === "b")!;
    expect(a.fivbPoints).toBe(3);
    expect(b.fivbPoints).toBe(0);
  });

  it("awards 1 point for a 3-2 win and 0 for the loss", () => {
    const pool: Pool = {
      id: "p1",
      name: "Pool A",
      teams: [team("a"), team("b")],
      matches: [
        match("a", "b", [
          [25, 20],
          [20, 25],
          [25, 20],
          [20, 25],
          [15, 10],
        ]),
      ],
    };
    const standings = calculatePoolStandings(pool);
    const a = standings.find((s) => s.team.id === "a")!;
    const b = standings.find((s) => s.team.id === "b")!;
    expect(a.fivbPoints).toBe(1);
    expect(b.fivbPoints).toBe(0);
  });

  it("ranks teams tied on points by set difference", () => {
    // Round robin where each team wins once and loses once -> all tied at 3 fivb points,
    // so the ranking must fall through to set difference.
    const pool: Pool = {
      id: "p1",
      name: "Pool A",
      teams: [team("a"), team("b"), team("c")],
      matches: [
        match("a", "b", [[25, 10], [25, 10], [25, 10]]), // a sweeps b: a setDiff +3
        match("b", "c", [[25, 10], [25, 10], [25, 10]]), // b sweeps c: b setDiff net 0 so far
        match("c", "a", [[25, 20], [20, 25], [25, 20], [25, 20]]), // c wins 3-1
      ],
    };
    const standings = calculatePoolStandings(pool);
    expect(standings.every((s) => s.fivbPoints === 3)).toBe(true);
    expect(standings.map((s) => s.team.id)).toEqual(["a", "b", "c"]);
    expect(standings.map((s) => s.setDifference)).toEqual([1, 0, -1]);
  });

  it("returns zeroed standings when no matches have been played", () => {
    const pool: Pool = {
      id: "p1",
      name: "Pool A",
      teams: [team("a"), team("b")],
      matches: [],
    };
    const standings = calculatePoolStandings(pool);
    expect(standings).toHaveLength(2);
    expect(standings.every((s) => s.fivbPoints === 0 && s.setDifference === 0)).toBe(true);
  });
});
