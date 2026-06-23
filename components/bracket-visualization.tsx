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

function nextPow2(n: number): number {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

function roundLabel(roundIndex: number, totalRounds: number): string {
  const fromEnd = totalRounds - 1 - roundIndex;
  if (fromEnd === 0) return "Finals";
  if (fromEnd === 1) return "Semifinals";
  if (fromEnd === 2) return "Quarterfinals";
  return `Round ${roundIndex + 1}`;
}

function buildRound1(teams: BracketTeam[]): Array<{ top: BracketTeam | null; bottom: BracketTeam | null }> {
  const slots = nextPow2(teams.length);
  const seeded: (BracketTeam | null)[] = [...teams, ...Array(slots - teams.length).fill(null)];
  const matches = [];
  for (let i = 0; i < slots / 2; i++) {
    matches.push({ top: seeded[i], bottom: seeded[slots - 1 - i] });
  }
  return matches;
}

/* ── Mobile: vertical stacked rounds ── */
function MobileBracket({ teams }: { teams: BracketTeam[] }) {
  const slots = nextPow2(teams.length);
  const totalRounds = Math.log2(slots);
  const round1 = buildRound1(teams);
  const has3rdPlace = totalRounds >= 2;

  return (
    <div className="space-y-4">
      <section>
        <h4 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
          {roundLabel(0, totalRounds)}
        </h4>
        <div className="grid gap-2">
          {round1.map((match, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="font-semibold text-gray-800 text-sm">
                {match.top ? `${match.top.seed}. ${match.top.team.name}` : "TBD"}
              </div>
              <div className="text-xs text-gray-400 my-1 ml-1">vs</div>
              <div className="font-semibold text-gray-800 text-sm">
                {match.top && !match.bottom
                  ? "— BYE —"
                  : match.bottom
                  ? `${match.bottom.seed}. ${match.bottom.team.name}`
                  : "TBD"}
              </div>
            </div>
          ))}
        </div>
      </section>

      {Array.from({ length: totalRounds - 1 }, (_, roundIdx) => {
        const label = roundLabel(roundIdx + 1, totalRounds);
        const matchCount = Math.pow(2, totalRounds - roundIdx - 2);
        const isFinal = roundIdx === totalRounds - 2;
        return (
          <section key={roundIdx}>
            <h4 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">{label}</h4>
            <div className="grid gap-2">
              {Array.from({ length: matchCount }, (_, i) => (
                <div key={i} className={`border rounded-lg p-3 ${isFinal ? "border-green-400 bg-green-50" : "bg-white border-gray-200"}`}>
                  <div className="text-gray-400 italic text-sm">TBD</div>
                  <div className="text-xs text-gray-400 my-1 ml-1">vs</div>
                  <div className="text-gray-400 italic text-sm">TBD</div>
                  {isFinal && (
                    <div className="mt-2 pt-2 border-t border-green-200 text-xs font-bold text-green-800">
                      Champion: _______________
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {has3rdPlace && (
        <section>
          <h4 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">3rd Place</h4>
          <div className="bg-white border border-orange-300 rounded-lg p-3">
            <div className="text-gray-400 italic text-sm">Semifinal 1 loser</div>
            <div className="text-xs text-gray-400 my-1 ml-1">vs</div>
            <div className="text-gray-400 italic text-sm">Semifinal 2 loser</div>
            <div className="mt-2 pt-2 border-t border-orange-200 text-xs font-bold text-orange-800">
              3rd Place: _______________
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

/* ── Desktop: horizontal bracket tree ── */
function DesktopBracket({ teams }: { teams: BracketTeam[] }) {
  const slots = nextPow2(teams.length);
  const totalRounds = Math.log2(slots);
  const round1 = buildRound1(teams);

  const subsequentRounds: string[][] = [];
  let prevCount = round1.length;
  for (let r = 1; r < totalRounds; r++) {
    prevCount = Math.ceil(prevCount / 2);
    subsequentRounds.push(Array(prevCount).fill(""));
  }

  const allRoundLabels = Array.from({ length: totalRounds }, (_, i) => roundLabel(i, totalRounds));

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-8 items-start" style={{ minWidth: `${(totalRounds + 1) * 210}px` }}>

        {/* Round 1 */}
        <div className="flex flex-col gap-3 flex-shrink-0">
          <h3 className="text-xs font-bold uppercase text-gray-500 mb-1">{allRoundLabels[0]}</h3>
          {round1.map((match, i) => (
            <div key={i} className="bg-white border border-gray-300 rounded min-w-[170px] text-sm">
              <div className="border-b px-3 py-2 font-semibold text-gray-800 truncate">
                {match.top ? `${match.top.seed}. ${match.top.team.name}` : <span className="text-gray-400 italic">TBD</span>}
              </div>
              <div className="px-3 py-2 font-semibold text-gray-800 truncate">
                {match.top && !match.bottom
                  ? <span className="text-gray-400 italic">— BYE —</span>
                  : match.bottom
                  ? `${match.bottom.seed}. ${match.bottom.team.name}`
                  : <span className="text-gray-400 italic">TBD</span>}
              </div>
              <div className="bg-gray-50 px-3 py-1 text-xs text-gray-400 text-center border-t">
                {match.top && !match.bottom ? "Auto-advance" : "Winner →"}
              </div>
            </div>
          ))}
        </div>

        {/* Later rounds */}
        {subsequentRounds.map((matches, roundIdx) => {
          const label = allRoundLabels[roundIdx + 1];
          const isFinal = roundIdx === subsequentRounds.length - 1;
          return (
            <div
              key={roundIdx}
              className="flex flex-col flex-shrink-0"
              style={{
                paddingTop: `${(Math.pow(2, roundIdx + 1) - 1) * 28}px`,
                gap: `${Math.pow(2, roundIdx + 1) * 58}px`,
              }}
            >
              <h3 className="text-xs font-bold uppercase text-gray-500 mb-1 -mt-6">{label}</h3>
              {matches.map((_, i) => (
                <div key={i} className={`bg-white border-2 rounded min-w-[170px] text-sm ${isFinal ? "border-green-400" : "border-gray-300"}`}>
                  <div className="border-b px-3 py-2 text-gray-400 italic">TBD</div>
                  <div className="px-3 py-2 text-gray-400 italic">TBD</div>
                  {isFinal && (
                    <div className="bg-green-100 px-3 py-2 text-center font-bold text-green-900 text-xs rounded-b border-t">
                      Champion: _______________
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })}

        {/* 3rd Place */}
        {totalRounds >= 2 && (
          <div className="flex flex-col flex-shrink-0" style={{ paddingTop: "24px" }}>
            <h3 className="text-xs font-bold uppercase text-gray-500 mb-1">3rd Place</h3>
            <div className="bg-white border border-orange-300 rounded min-w-[170px] text-sm">
              <div className="border-b px-3 py-2 text-gray-400 italic">Semifinal 1 loser</div>
              <div className="px-3 py-2 text-gray-400 italic">Semifinal 2 loser</div>
              <div className="bg-orange-100 px-3 py-2 text-center font-bold text-orange-900 text-xs rounded-b border-t">
                3rd Place: _______________
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main export ── */
export default function BracketVisualization({ division, teams }: BracketVisualizationProps) {
  if (teams.length === 0) return null;

  return (
    <div className={`border-2 rounded-lg p-4 sm:p-6 ${DIVISION_COLORS[division]}`}>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl sm:text-2xl font-bold">
          {DIVISION_EMOJI[division]} {division} Bracket
        </h2>
        <span className="text-sm text-gray-500">{teams.length} teams</span>
      </div>

      <div className="sm:hidden"><MobileBracket teams={teams} /></div>
      <div className="hidden sm:block"><DesktopBracket teams={teams} /></div>

      <div className="mt-5 pt-4 border-t border-gray-300">
        <h4 className="text-sm font-bold text-gray-700 mb-2">Seeded Teams:</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-sm">
          {teams.map((team) => (
            <div key={team.team.id} className="flex items-center gap-1.5">
              <span className="font-bold text-gray-500 w-5 text-right shrink-0">{team.seed}.</span>
              <span className="text-gray-900 truncate">{team.team.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
