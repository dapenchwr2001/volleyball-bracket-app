"use client";

import { BracketTeam, BracketDivision } from "@/lib/types";

interface BracketVisualizationProps {
  division: BracketDivision;
  teams: BracketTeam[];
}

const DIVISION_COLORS: Record<BracketDivision, string> = {
  Gold:   "border-yellow-400 bg-yellow-50",
  Silver: "border-gray-400 bg-gray-50",
  Bronze: "border-orange-400 bg-orange-50",
  Iron:   "border-blue-400 bg-blue-50",
  Wood:   "border-green-400 bg-green-50",
};

const DIVISION_EMOJI: Record<BracketDivision, string> = {
  Gold: "🥇", Silver: "🥈", Bronze: "🥉", Iron: "⚙️", Wood: "🪵",
};

// Returns next power of 2 >= n
function nextPow2(n: number): number {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

// Round name labels depending on total rounds
function roundLabel(roundIndex: number, totalRounds: number): string {
  const fromEnd = totalRounds - 1 - roundIndex;
  if (fromEnd === 0) return "Finals";
  if (fromEnd === 1) return totalRounds > 2 ? "Semifinals" : "Semifinals";
  if (fromEnd === 2) return "Quarterfinals";
  return `Round ${roundIndex + 1}`;
}

// Build first-round matchups with byes (null = bye/auto-advance)
function buildRound1(teams: BracketTeam[]): Array<{ top: BracketTeam | null; bottom: BracketTeam | null }> {
  const slots = nextPow2(teams.length);
  // Pad with nulls for byes
  const seeded: (BracketTeam | null)[] = [
    ...teams,
    ...Array(slots - teams.length).fill(null),
  ];

  const matches = [];
  for (let i = 0; i < slots / 2; i++) {
    matches.push({
      top: seeded[i],            // Seed 1, 2, 3 ...
      bottom: seeded[slots - 1 - i], // Seed N, N-1, N-2 ...
    });
  }
  return matches;
}

// A single match card
function MatchCard({
  top,
  bottom,
  label,
}: {
  top: BracketTeam | null;
  bottom: BracketTeam | null;
  label?: string;
}) {
  const isBye = top !== null && bottom === null;
  return (
    <div className="bg-white border border-gray-300 rounded min-w-[160px] text-sm">
      <div className="border-b px-3 py-2 font-semibold text-gray-800 truncate">
        {top
          ? `${top.seed}. ${top.team.name.substring(0, 18)}${top.team.name.length > 18 ? "…" : ""}`
          : <span className="text-gray-400 italic">TBD</span>}
      </div>
      <div className="px-3 py-2 font-semibold text-gray-800 truncate">
        {isBye
          ? <span className="text-gray-400 italic">— BYE —</span>
          : bottom
          ? `${bottom.seed}. ${bottom.team.name.substring(0, 18)}${bottom.team.name.length > 18 ? "…" : ""}`
          : <span className="text-gray-400 italic">TBD</span>}
      </div>
      {label && (
        <div className="bg-gray-50 px-3 py-1 text-xs text-gray-500 text-center border-t">
          {label}
        </div>
      )}
    </div>
  );
}

export default function BracketVisualization({ division, teams }: BracketVisualizationProps) {
  if (teams.length === 0) return null;

  const slots = nextPow2(teams.length);
  const totalRounds = Math.log2(slots); // e.g. 4 teams → 2 rounds, 8 teams → 3 rounds
  const round1 = buildRound1(teams);

  // Build subsequent round placeholders
  // Each round halves the previous match count
  const subsequentRounds: string[][] = [];
  let prevCount = round1.length;
  for (let r = 1; r < totalRounds; r++) {
    prevCount = Math.ceil(prevCount / 2);
    const matches: string[] = [];
    for (let i = 0; i < prevCount; i++) {
      matches.push(`Match ${i + 1}`);
    }
    subsequentRounds.push(matches);
  }

  const allRoundLabels = Array.from({ length: totalRounds }, (_, i) =>
    roundLabel(i, totalRounds)
  );

  return (
    <div className={`border-2 rounded-lg p-6 ${DIVISION_COLORS[division]}`}>
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-bold">
          {DIVISION_EMOJI[division]} {division} Bracket
        </h2>
        <span className="text-sm text-gray-500">{teams.length} teams</span>
      </div>

      {/* Bracket rounds */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-8 items-start" style={{ minWidth: `${totalRounds * 220}px` }}>

          {/* Round 1 — real matchups */}
          <div className="flex flex-col gap-3 flex-shrink-0">
            <h3 className="text-xs font-bold uppercase text-gray-500 mb-1">
              {allRoundLabels[0]}
            </h3>
            {round1.map((match, i) => (
              <MatchCard
                key={i}
                top={match.top}
                bottom={match.bottom}
                label={match.top && !match.bottom ? "Auto-advance" : `Winner →`}
              />
            ))}
          </div>

          {/* Subsequent rounds — TBD placeholders */}
          {subsequentRounds.map((matches, roundIdx) => {
            const label = allRoundLabels[roundIdx + 1];
            const isFinal = roundIdx === subsequentRounds.length - 1;
            return (
              <div
                key={roundIdx}
                className="flex flex-col flex-shrink-0"
                style={{
                  // Vertically center each match to sit between its two feeders
                  paddingTop: `${(Math.pow(2, roundIdx + 1) - 1) * 28}px`,
                  gap: `${Math.pow(2, roundIdx + 1) * 58}px`,
                }}
              >
                <h3 className="text-xs font-bold uppercase text-gray-500 mb-1 -mt-6">
                  {label}
                </h3>
                {matches.map((_, i) => (
                  <div
                    key={i}
                    className={`bg-white border-2 rounded min-w-[160px] text-sm ${
                      isFinal ? "border-green-400" : "border-gray-300"
                    }`}
                  >
                    <div className="border-b px-3 py-2 text-gray-400 italic">TBD</div>
                    <div className="px-3 py-2 text-gray-400 italic">TBD</div>
                    {isFinal && (
                      <div className="bg-green-100 px-3 py-2 text-center font-bold text-green-900 text-xs rounded-b border-t">
                        Champion: ________________
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })}

          {/* 3rd Place match */}
          <div className="flex flex-col flex-shrink-0" style={{ paddingTop: "24px" }}>
            <h3 className="text-xs font-bold uppercase text-gray-500 mb-1">3rd Place</h3>
            <div className="bg-white border border-orange-300 rounded min-w-[160px] text-sm">
              <div className="border-b px-3 py-2 text-gray-400 italic">Loser SF1</div>
              <div className="px-3 py-2 text-gray-400 italic">Loser SF2</div>
              <div className="bg-orange-100 px-3 py-2 text-center font-bold text-orange-900 text-xs rounded-b border-t">
                3rd Place: ________________
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seeded team list */}
      <div className="mt-6 pt-5 border-t border-gray-300">
        <h4 className="text-sm font-bold text-gray-700 mb-3">All Seeded Teams:</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
          {teams.map((team) => (
            <div key={team.team.id} className="flex items-center gap-2">
              <span className="font-bold text-gray-600 w-6 text-right">{team.seed}.</span>
              <span className="text-gray-900 truncate">{team.team.name}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media print {
          .border-2 { page-break-inside: avoid; break-inside: avoid; }
        }
      `}</style>
    </div>
  );
}
