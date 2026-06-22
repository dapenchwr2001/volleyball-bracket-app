"use client";

import { Tournament } from "@/lib/types";
import { calculatePoolStandings } from "@/lib/seeding";

interface StandingsViewProps {
  tournament: Tournament;
}

export default function StandingsView({ tournament }: StandingsViewProps) {
  return (
    <div className="space-y-8">
      {tournament.pools.map((pool) => {
        const standings = calculatePoolStandings(pool);

        return (
          <div key={pool.id} className="overflow-x-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {pool.name} Standings
            </h3>

            {pool.matches.length === 0 ? (
              <p className="text-gray-600">
                No matches entered yet. Go to Match Entry to add results.
              </p>
            ) : (
              <table className="w-full border-collapse bg-white rounded-lg shadow overflow-hidden">
                <thead className="bg-gray-100 border-b-2 border-gray-300">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-900">
                      Place
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-900">
                      Team
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-900">
                      Points
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-900">
                      Sets
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-900">
                      Set Diff
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-900">
                      Pts Diff
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((standing, index) => (
                    <tr
                      key={standing.team.id}
                      className={`border-b ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-blue-50`}
                    >
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 text-gray-900">
                        {standing.team.name}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-blue-600">
                        {standing.fivbPoints}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-700">
                        {standing.setsWon}-{standing.setsLost}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-700">
                        {standing.setDifference > 0 ? "+" : ""}
                        {standing.setDifference}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-700">
                        {standing.pointDifference > 0 ? "+" : ""}
                        {standing.pointDifference}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Bracket Assignment Preview */}
            {standings.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Bracket Assignments:
                </p>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="font-semibold text-blue-900">Gold:</span>{" "}
                    {standings[0]?.team.name}
                  </div>
                  <div>
                    <span className="font-semibold text-blue-900">Silver:</span>{" "}
                    {standings[1]?.team.name}, {standings[2]?.team.name}
                  </div>
                  <div>
                    <span className="font-semibold text-blue-900">Bronze:</span>{" "}
                    {standings[3]?.team.name}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Legend */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-2">FIVB Points System:</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Win 3-0: <span className="font-semibold">3 points</span></li>
          <li>• Win 3-1: <span className="font-semibold">3 points</span></li>
          <li>• Win 3-2: <span className="font-semibold">1 point</span></li>
          <li>• Loss: <span className="font-semibold">0 points</span></li>
        </ul>
        <p className="text-xs text-gray-600 mt-2">
          Tiebreakers: Head-to-head → Set Difference → Point Difference
        </p>
      </div>
    </div>
  );
}
