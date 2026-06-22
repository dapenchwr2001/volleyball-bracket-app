"use client";

import { BracketTeam, BracketDivision } from "@/lib/types";

interface BracketVisualizationProps {
  division: BracketDivision;
  teams: BracketTeam[];
}

const DIVISION_COLORS: Record<BracketDivision, string> = {
  Gold: "border-yellow-400 bg-yellow-50",
  Silver: "border-gray-400 bg-gray-50",
  Bronze: "border-orange-400 bg-orange-50",
  Iron: "border-blue-400 bg-blue-50",
  Wood: "border-green-400 bg-green-50",
};

const DIVISION_EMOJI: Record<BracketDivision, string> = {
  Gold: "🥇",
  Silver: "🥈",
  Bronze: "🥉",
  Iron: "⚙️",
  Wood: "🪵",
};

export default function BracketVisualization({
  division,
  teams,
}: BracketVisualizationProps) {
  if (teams.length === 0) return null;

  // Create bracket matchups
  const semifinalists = teams.slice(0, 4);
  const finalists = [
    { seed: 0, name: "Winner 1 vs 4" },
    { seed: 0, name: "Winner 2 vs 3" },
  ];

  return (
    <div className={`border-2 rounded-lg p-6 ${DIVISION_COLORS[division]} page-break`}>
      <h2 className="text-2xl font-bold mb-6">
        {DIVISION_EMOJI[division]} {division} Bracket
      </h2>

      <div className="flex justify-between gap-8 overflow-x-auto pb-4">
        {/* Semifinals */}
        <div className="flex-shrink-0 min-w-max">
          <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase">
            Semifinals
          </h3>
          <div className="space-y-8">
            {/* Match 1: Seed 1 vs Seed 4 */}
            <div className="bg-white border border-gray-300 rounded min-w-[180px]">
              <div className="border-b p-3">
                <div className="font-semibold text-sm truncate" title={`${semifinalists[0]?.seed}. ${semifinalists[0]?.team.name}`}>
                  {semifinalists[0]?.seed}. {semifinalists[0]?.team.name?.substring(0, 20)}
                  {semifinalists[0]?.team.name && semifinalists[0].team.name.length > 20 ? "..." : ""}
                </div>
              </div>
              <div className="p-3">
                <div className="font-semibold text-sm truncate" title={`${semifinalists[3]?.seed}. ${semifinalists[3]?.team.name}`}>
                  {semifinalists[3]?.seed}. {semifinalists[3]?.team.name?.substring(0, 20)}
                  {semifinalists[3]?.team.name && semifinalists[3].team.name.length > 20 ? "..." : ""}
                </div>
              </div>
              <div className="bg-gray-50 p-2 text-center text-xs text-gray-600">
                Winner: ________
              </div>
            </div>

            {/* Match 2: Seed 2 vs Seed 3 */}
            <div className="bg-white border border-gray-300 rounded min-w-[180px]">
              <div className="border-b p-3">
                <div className="font-semibold text-sm truncate" title={`${semifinalists[1]?.seed}. ${semifinalists[1]?.team.name}`}>
                  {semifinalists[1]?.seed}. {semifinalists[1]?.team.name?.substring(0, 20)}
                  {semifinalists[1]?.team.name && semifinalists[1].team.name.length > 20 ? "..." : ""}
                </div>
              </div>
              <div className="p-3">
                <div className="font-semibold text-sm truncate" title={`${semifinalists[2]?.seed}. ${semifinalists[2]?.team.name}`}>
                  {semifinalists[2]?.seed}. {semifinalists[2]?.team.name?.substring(0, 20)}
                  {semifinalists[2]?.team.name && semifinalists[2].team.name.length > 20 ? "..." : ""}
                </div>
              </div>
              <div className="bg-gray-50 p-2 text-center text-xs text-gray-600">
                Winner: ________
              </div>
            </div>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-shrink-0 w-12" />

        {/* Finals */}
        <div className="flex-shrink-0 min-w-max">
          <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase">
            Finals
          </h3>
          <div className="flex flex-col justify-center h-full">
            <div className="bg-white border-2 border-gray-400 rounded">
              <div className="border-b p-3 min-w-[200px]">
                <div className="font-semibold text-sm">
                  Winner of Match 1
                </div>
              </div>
              <div className="p-3">
                <div className="font-semibold text-sm">
                  Winner of Match 2
                </div>
              </div>
              <div className="bg-green-100 p-3 text-center font-bold text-green-900 rounded-b">
                Champion: ________
              </div>
            </div>
          </div>
        </div>

        {/* 3rd Place */}
        <div className="flex-shrink-0 min-w-max">
          <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase">
            3rd Place
          </h3>
          <div className="flex flex-col justify-center h-full">
            <div className="bg-white border border-gray-300 rounded">
              <div className="border-b p-3 min-w-[200px]">
                <div className="font-semibold text-sm text-gray-700">
                  Loser of Match 1
                </div>
              </div>
              <div className="p-3">
                <div className="font-semibold text-sm text-gray-700">
                  Loser of Match 2
                </div>
              </div>
              <div className="bg-orange-100 p-3 text-center font-bold text-orange-900 rounded-b">
                3rd Place: ________
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Teams Legend */}
      <div className="mt-8 pt-6 border-t border-gray-300">
        <h4 className="text-sm font-bold text-gray-700 mb-3">Seeded Teams:</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {semifinalists.map((team) => (
            <div key={team.team.id} className="flex items-start gap-2">
              <span className="font-bold text-gray-700 w-6">{team.seed}.</span>
              <span className="text-gray-900 truncate">{team.team.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .page-break {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
