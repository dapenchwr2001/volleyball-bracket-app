"use client";

import { Tournament, BracketDivision } from "@/lib/types";
import { getAllPoolStandings } from "@/lib/seeding";
import { generateAllBrackets } from "@/lib/bracket-generator";

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
          <div
            key={division}
            className={`rounded-lg border-2 p-6 ${DIVISION_COLORS[division]}`}
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {DIVISION_EMOJI[division]} {division} Bracket ({bracket.teams.length} teams)
            </h3>

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
                        {bracketTeam.team.poolId.split("-")[0] ||
                          bracketTeam.team.poolId}
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

            {/* Bracket Structure Notes */}
            <div className="mt-4 p-3 bg-white rounded border border-gray-200 text-sm text-gray-700">
              <p className="font-medium mb-2">Single Elimination (Best of 3):</p>
              <p>
                {bracket.teams.length} teams will compete in {Math.ceil(Math.log2(bracket.teams.length))} rounds.
              </p>
            </div>
          </div>
        );
      })}

      {/* Export Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">
          📋 Next Steps:
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✓ Review the bracket assignments above</li>
          <li>✓ Print or screenshot each bracket for the coaches</li>
          <li>✓ Enter results as teams play their bracket matches</li>
          <li>✓ Determine champions from each division</li>
        </ul>
      </div>
    </div>
  );
}
