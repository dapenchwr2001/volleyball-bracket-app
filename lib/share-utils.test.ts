import { describe, it, expect } from "vitest";
import { encodeShare, decodeShare } from "./share-utils";
import { Tournament } from "./types";

function buildTournament(): Tournament {
  return {
    id: "t1",
    name: "Summer Slam",
    pools: [
      {
        id: "pool-1",
        name: "Pool A",
        teams: [
          { id: "team-1", name: "Sparta", poolId: "pool-1" },
          { id: "team-2", name: "Athens", poolId: "pool-1" },
          { id: "team-3", name: "Corinth", poolId: "pool-1" },
        ],
        matches: [
          {
            id: "m1",
            poolId: "pool-1",
            team1Id: "team-1",
            team2Id: "team-2",
            sets: [
              { team1Points: 25, team2Points: 20 },
              { team1Points: 25, team2Points: 18 },
            ],
          },
          // team-1 vs team-3: not yet played
        ],
      },
    ],
  };
}

describe("encodeShare / decodeShare round trip", () => {
  it("preserves tournament name, pool/team names, and played match scores", () => {
    const tournament = buildTournament();
    const decoded = decodeShare(encodeShare(tournament))!;

    expect(decoded.name).toBe(tournament.name);
    expect(decoded.pools[0].name).toBe("Pool A");
    expect(decoded.pools[0].teams.map((t) => t.name)).toEqual(["Sparta", "Athens", "Corinth"]);

    const decodedMatch = decoded.pools[0].matches.find(
      (m) =>
        decoded.pools[0].teams.find((t) => t.id === m.team1Id)?.name === "Sparta" &&
        decoded.pools[0].teams.find((t) => t.id === m.team2Id)?.name === "Athens"
    )!;
    expect(decodedMatch.sets).toEqual([
      { team1Points: 25, team2Points: 20 },
      { team1Points: 25, team2Points: 18 },
    ]);
  });

  it("omits unplayed matches from the decoded pool", () => {
    const tournament = buildTournament();
    const decoded = decodeShare(encodeShare(tournament))!;
    // Only the Sparta/Athens match was played; Sparta/Corinth and Athens/Corinth should be absent.
    expect(decoded.pools[0].matches).toHaveLength(1);
  });

  it("produces a URL-safe string (no +, /, or = characters)", () => {
    const encoded = encodeShare(buildTournament());
    expect(encoded).not.toMatch(/[+/=]/);
  });

  it("returns null for malformed input instead of throwing", () => {
    expect(decodeShare("not-valid-base64!!!")).toBeNull();
  });
});
