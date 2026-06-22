// Simulation test: 4 pools, 4 teams each
// Expected: Gold=4, Silver=8, Bronze=4

// ---- Simulate pool standings (sorted by FIVB points, best first) ----
const poolStandings = new Map([
  ["poolA", [
    { team: { id: "a1", name: "China" },    fivbPoints: 9, setDifference: 6 },
    { team: { id: "a2", name: "Japan" },    fivbPoints: 6, setDifference: 2 },
    { team: { id: "a3", name: "USA" },      fivbPoints: 3, setDifference: -2 },
    { team: { id: "a4", name: "Ghana" },    fivbPoints: 0, setDifference: -6 },
  ]],
  ["poolB", [
    { team: { id: "b1", name: "CapeVerde" },fivbPoints: 9, setDifference: 5 },
    { team: { id: "b2", name: "Uruguay" },  fivbPoints: 6, setDifference: 2 },
    { team: { id: "b3", name: "Alaska" },   fivbPoints: 3, setDifference: -1 },
    { team: { id: "b4", name: "Zambia" },   fivbPoints: 0, setDifference: -6 },
  ]],
  ["poolC", [
    { team: { id: "c1", name: "Panama" },   fivbPoints: 9, setDifference: 7 },
    { team: { id: "c2", name: "Ukraine" },  fivbPoints: 6, setDifference: 3 },
    { team: { id: "c3", name: "Paraguay" }, fivbPoints: 3, setDifference: -3 },
    { team: { id: "c4", name: "Russia" },   fivbPoints: 0, setDifference: -7 },
  ]],
  ["poolD", [
    { team: { id: "d1", name: "Canal" },    fivbPoints: 9, setDifference: 6 },
    { team: { id: "d2", name: "Morocco" },  fivbPoints: 6, setDifference: 1 },
    { team: { id: "d3", name: "Mexico" },   fivbPoints: 3, setDifference: -1 },
    { team: { id: "d4", name: "Hawaii" },   fivbPoints: 0, setDifference: -6 },
  ]],
]);

// ---- assignToBrackets (current code) ----
function assignToBrackets(poolStandings) {
  const brackets = new Map([
    ["Gold",   []],
    ["Silver", []],
    ["Bronze", []],
  ]);

  poolStandings.forEach((standings) => {
    standings.forEach((standing, placement) => {
      const bracketTeam = { seed: 0, team: standing.team, standing };
      if (placement === 0)                     brackets.get("Gold").push(bracketTeam);
      else if (placement === 1 || placement === 2) brackets.get("Silver").push(bracketTeam);
      else if (placement === 3)                brackets.get("Bronze").push(bracketTeam);
    });
  });

  return brackets;
}

// ---- reseedBrackets ----
function reseedBrackets(brackets) {
  const reseeded = new Map();
  brackets.forEach((teams, division) => {
    const sorted = [...teams].sort((a, b) => {
      if (a.standing.fivbPoints !== b.standing.fivbPoints)
        return b.standing.fivbPoints - a.standing.fivbPoints;
      return b.standing.setDifference - a.standing.setDifference;
    });
    sorted.forEach((team, index) => { team.seed = index + 1; });
    reseeded.set(division, sorted);
  });
  return reseeded;
}

// ---- Run the pipeline ----
const raw    = assignToBrackets(poolStandings);
const seeded = reseedBrackets(raw);

// ---- Print results ----
seeded.forEach((teams, division) => {
  console.log(`\n${division} Bracket (${teams.length} teams):`);
  teams.forEach(t => console.log(`  Seed ${t.seed}: ${t.team.name} (${t.standing.fivbPoints} pts)`));
});

// ---- Assertions ----
console.log("\n---- ASSERTIONS ----");
const gold   = seeded.get("Gold");
const silver = seeded.get("Silver");
const bronze = seeded.get("Bronze");

console.log(`Gold   has ${gold.length}   teams  → expected 4:  ${gold.length   === 4 ? "PASS ✓" : "FAIL ✗"}`);
console.log(`Silver has ${silver.length} teams  → expected 8:  ${silver.length === 8 ? "PASS ✓" : "FAIL ✗"}`);
console.log(`Bronze has ${bronze.length}   teams  → expected 4:  ${bronze.length === 4 ? "PASS ✓" : "FAIL ✗"}`);

const goldNames   = gold.map(t => t.team.name);
const silverNames = silver.map(t => t.team.name);
const bronzeNames = bronze.map(t => t.team.name);

const expectedGold   = ["China", "CapeVerde", "Panama", "Canal"];
const expectedSilver = ["Japan", "USA", "Uruguay", "Alaska", "Ukraine", "Paraguay", "Morocco", "Mexico"];
const expectedBronze = ["Ghana", "Zambia", "Russia", "Hawaii"];

const goldOK   = expectedGold.every(n => goldNames.includes(n));
const silverOK = expectedSilver.every(n => silverNames.includes(n));
const bronzeOK = expectedBronze.every(n => bronzeNames.includes(n));

console.log(`Gold   teams correct → ${goldOK   ? "PASS ✓" : "FAIL ✗"} (got: ${goldNames.join(", ")})`);
console.log(`Silver teams correct → ${silverOK ? "PASS ✓" : "FAIL ✗"} (got: ${silverNames.join(", ")})`);
console.log(`Bronze teams correct → ${bronzeOK ? "PASS ✓" : "FAIL ✗"} (got: ${bronzeNames.join(", ")})`);
