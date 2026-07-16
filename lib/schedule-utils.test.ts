import { describe, it, expect } from "vitest";
import { autoSchedule, generateMatchSlots } from "./schedule-utils";
import { Pool } from "./types";

function fourTeamPool(id: string, name: string): Pool {
  return {
    id,
    name,
    teams: [
      { id: `${id}-t0`, name: `${id} Team 1`, poolId: id },
      { id: `${id}-t1`, name: `${id} Team 2`, poolId: id },
      { id: `${id}-t2`, name: `${id} Team 3`, poolId: id },
      { id: `${id}-t3`, name: `${id} Team 4`, poolId: id },
    ],
    matches: [],
  };
}

describe("generateMatchSlots", () => {
  it("produces 3 rounds of 2 matches (6 total) per 4-team pool", () => {
    const slots = generateMatchSlots([fourTeamPool("p1", "Pool A")]);
    expect(slots).toHaveLength(6);
  });

  it("has every team play every other team exactly once", () => {
    const slots = generateMatchSlots([fourTeamPool("p1", "Pool A")]);
    const pairs = new Set(slots.map((s) => s.matchId));
    expect(pairs.size).toBe(6); // C(4,2) = 6 unique pairings
  });
});

describe("autoSchedule", () => {
  it("never books the same pool's teams on two courts in the same time slot", () => {
    const pools = [fourTeamPool("p1", "Pool A"), fourTeamPool("p2", "Pool B")];
    const entries = autoSchedule(pools, "08:00", 30, ["Court 1", "Court 2"]);

    const byTime = new Map<string, typeof entries>();
    for (const entry of entries) {
      const bucket = byTime.get(entry.time) ?? [];
      bucket.push(entry);
      byTime.set(entry.time, bucket);
    }

    for (const bucket of byTime.values()) {
      const poolIdsInSlot = bucket.map((e) => e.poolId);
      expect(new Set(poolIdsInSlot).size).toBe(poolIdsInSlot.length);
    }
  });

  it("fills all courts before advancing the clock", () => {
    const pools = [fourTeamPool("p1", "Pool A"), fourTeamPool("p2", "Pool B")];
    const entries = autoSchedule(pools, "08:00", 30, ["Court 1", "Court 2"]);
    // 2 pools x 6 matches = 12 entries, 2 courts -> first 2 entries share the first time slot
    expect(entries[0].time).toBe(entries[1].time);
    expect(entries[0].court).not.toBe(entries[1].court);
  });

  it("advances the clock by durationMinutes once courts are full", () => {
    const pools = [fourTeamPool("p1", "Pool A")];
    const entries = autoSchedule(pools, "08:00", 30, ["Court 1"]);
    expect(entries[0].time).toBe("8:00 AM");
    expect(entries[1].time).toBe("8:30 AM");
    expect(entries[2].time).toBe("9:00 AM");
  });

  it("falls back to generateMatchSlots when there are no courts", () => {
    const pools = [fourTeamPool("p1", "Pool A")];
    const entries = autoSchedule(pools, "08:00", 30, []);
    expect(entries).toEqual(generateMatchSlots(pools));
  });
});
