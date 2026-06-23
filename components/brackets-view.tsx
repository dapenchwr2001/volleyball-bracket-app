"use client";

import { Tournament, BracketDivision } from "@/lib/types";
import { getAllPoolStandings } from "@/lib/seeding";
import { generateAllBrackets } from "@/lib/bracket-generator";
import BracketVisualization from "./bracket-visualization";

interface BracketsViewProps {
  tournament: Tournament;
}

const DIVISION_COLORS: Record<BracketDivision, string> = {
  Gold: "bg-yellow-100 border-yellow-300",
  Silver: "bg-gray-100 border-gray-300",
  Bronze: "bg-orange-100 border-orange-300",
  Iron: "bg-blue-100 border-blue-300",
  Wood: "bg-green-100 border-green-300",
};

const DIVISION_EMOJI: Record<BracketDivision, string> = {
  Gold: "🥇",
  Silver: "🥈",
  Bronze: "🥉",
  Iron: "⚙️",
  Wood: "🪵",
};

export default function BracketsView({ tournament }: BracketsViewProps) {
  // Check if all pools have matches
  const allPoolsHaveMatches = tournament.pools.every((p) => p.matches.length > 0);

  if (!allPoolsHaveMatches) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
        <p className="font-medium">
          ⚠️ All pools must have match results to generate brackets.
        </p>
        <p className="text-sm mt-2">Go to Match Entry to add set scores.</p>
      </div>
    );
  }

  const poolStandings = getAllPoolStandings(tournament.pools);
  const brackets = generateAllBrackets(poolStandings);
  const poolNameById = new Map(tournament.pools.map((p) => [p.id, p.name]));

  const activeDivisions: BracketDivision[] = [
    "Gold",
    "Silver",
    "Bronze",
  ];

  return (
    <div className="space-y-8">
      {activeDivisions.map((division) => {
        const bracket = brackets.get(division);

        if (!bracket || bracket.teams.length === 0) {
          return null;
        }

        return (
          <div key={division} className="space-y-6">
            {/* Visual Bracket for Printing */}
            <BracketVisualization division={division} teams={bracket.teams} />

            {/* Seeding Details Table */}
            <div className={`rounded-lg border-2 p-6 ${DIVISION_COLORS[division]}`}>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Seeding Details
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-lg shadow">
                  <thead className="bg-gray-200 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-gray-900">
                        Seed
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-900">
                        Team
                      </th>
                      <th className="text-center px-4 py-3 font-semibold text-gray-900">
                        Pool
                      </th>
                      <th className="text-center px-4 py-3 font-semibold text-gray-900">
                        Points
                      </th>
                      <th className="text-center px-4 py-3 font-semibold text-gray-900">
                        Set Diff
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bracket.teams.map((bracketTeam, index) => (
                      <tr
                        key={bracketTeam.team.id}
                        className={`border-b ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td className="px-4 py-3 font-bold text-lg text-gray-900 w-12">
                          {bracketTeam.seed}
                        </td>
                        <td className="px-4 py-3 text-gray-900">
                          {bracketTeam.team.name}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-700">
                          {poolNameById.get(bracketTeam.team.poolId) ?? bracketTeam.team.poolId}
                        </td>
                        <td className="px-4 py-3 text-center font-semibold text-blue-600">
                          {bracketTeam.standing.fivbPoints}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-700">
                          {bracketTeam.standing.setDifference > 0 ? "+" : ""}
                          {bracketTeam.standing.setDifference}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })}

      {/* Bracket Info */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-purple-900 mb-2">
          🎯 Bracket Format:
        </h4>
        <ul className="text-sm text-purple-800 space-y-1">
          <li>• <strong>Semifinals:</strong> Seed 1 vs 4 • Seed 2 vs 3</li>
          <li>• <strong>Finals:</strong> Winner of Match 1 vs Winner of Match 2</li>
          <li>• <strong>3rd Place:</strong> Loser of Match 1 vs Loser of Match 2 (optional)</li>
          <li>• Teams are seeded by FIVB points and set differential from pools</li>
        </ul>
      </div>

      {/* Print + Next Steps */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex justify-between items-start gap-4 mb-3">
          <h4 className="font-semibold text-blue-900">📋 Next Steps:</h4>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-blue-700 transition shrink-0"
          >
            🖨️ Print Brackets
          </button>
        </div>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✓ Review bracket assignments above</li>
          <li>✓ Hit <strong>Print Brackets</strong> to print for the tournament</li>
          <li>✓ Fill in match winners by hand during play</li>
          <li>✓ Use 3rd place match to settle final standings</li>
        </ul>
      </div>
    </div>
  );
}
