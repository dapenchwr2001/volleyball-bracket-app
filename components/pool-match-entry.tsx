"use client";

import { useState } from "react";
import { Tournament, SetScore } from "@/lib/types";

interface PoolMatchEntryProps {
  tournament: Tournament;
  onMatchesUpdated: (tournament: Tournament) => void;
}

export default function PoolMatchEntry({
  tournament,
  onMatchesUpdated,
}: PoolMatchEntryProps) {
  const [selectedPoolId, setSelectedPoolId] = useState(
    tournament.pools[0]?.id || ""
  );
  const [setScores, setSetScores] = useState<
    Map<string, SetScore[]>
  >(new Map());

  const selectedPool = tournament.pools.find((p) => p.id === selectedPoolId);

  if (!selectedPool) {
    return <div>No pools available</div>;
  }

  // Generate all possible matches for the pool
  const generateMatches = () => {
    const matches: Array<{
      id: string;
      team1Index: number;
      team2Index: number;
    }> = [];
    for (let i = 0; i < selectedPool.teams.length; i++) {
      for (let j = i + 1; j < selectedPool.teams.length; j++) {
        matches.push({
          id: `${selectedPool.id}-${i}-${j}`,
          team1Index: i,
          team2Index: j,
        });
      }
    }
    return matches;
  };

  const matches = generateMatches();

  const handleSetScoreChange = (
    matchId: string,
    setIndex: number,
    team: "team1" | "team2",
    points: number
  ) => {
    const matchScores = setScores.get(matchId) || [
      { team1Points: 0, team2Points: 0 },
      { team1Points: 0, team2Points: 0 },
      { team1Points: 0, team2Points: 0 },
    ];

    const updated = [...matchScores];
    if (team === "team1") {
      updated[setIndex].team1Points = points;
    } else {
      updated[setIndex].team2Points = points;
    }

    setSetScores(new Map(setScores.set(matchId, updated)));
  };

  const handleSaveMatches = () => {
    const updatedTournament = { ...tournament };
    const updatedPool = { ...selectedPool, matches: [] };

    matches.forEach((match) => {
      const scores = setScores.get(match.id) || [];
      const team1 = selectedPool.teams[match.team1Index];
      const team2 = selectedPool.teams[match.team2Index];

      updatedPool.matches.push({
        id: match.id,
        poolId: selectedPool.id,
        team1Id: team1.id,
        team2Id: team2.id,
        sets: scores,
      });
    });

    updatedTournament.pools = updatedTournament.pools.map((p) =>
      p.id === selectedPool.id ? updatedPool : p
    );

    onMatchesUpdated(updatedTournament);
    alert("Matches saved!");
  };

  return (
    <div className="space-y-6">
      {/* Pool Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Pool
        </label>
        <select
          value={selectedPoolId}
          onChange={(e) => {
            setSelectedPoolId(e.target.value);
            setSetScores(new Map());
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          {tournament.pools.map((pool) => (
            <option key={pool.id} value={pool.id}>
              {pool.name}
            </option>
          ))}
        </select>
      </div>

      {/* Matches */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">
          Enter Match Results (Best of 5)
        </h3>

        {matches.map((match, index) => {
          const team1 = selectedPool.teams[match.team1Index];
          const team2 = selectedPool.teams[match.team2Index];
          const matchScores = setScores.get(match.id) || [
            { team1Points: 0, team2Points: 0 },
            { team1Points: 0, team2Points: 0 },
            { team1Points: 0, team2Points: 0 },
          ];

          return (
            <div
              key={match.id}
              className="bg-gray-50 p-4 rounded-lg border border-gray-200"
            >
              <p className="font-medium text-gray-900 mb-3">
                {index + 1}. {team1.name} vs {team2.name}
              </p>

              <div className="space-y-2">
                {[0, 1, 2].map((setIdx) => (
                  <div key={setIdx} className="flex gap-2 items-center">
                    <span className="text-sm text-gray-600 w-12">
                      Set {setIdx + 1}:
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={matchScores[setIdx]?.team1Points || ""}
                      onChange={(e) =>
                        handleSetScoreChange(
                          match.id,
                          setIdx,
                          "team1",
                          parseInt(e.target.value) || 0
                        )
                      }
                      placeholder="0"
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                    />
                    <span className="text-gray-600">-</span>
                    <input
                      type="number"
                      min="0"
                      value={matchScores[setIdx]?.team2Points || ""}
                      onChange={(e) =>
                        handleSetScoreChange(
                          match.id,
                          setIdx,
                          "team2",
                          parseInt(e.target.value) || 0
                        )
                      }
                      placeholder="0"
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Save Button */}
      <button
        onClick={handleSaveMatches}
        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 font-medium"
      >
        Save Matches & Generate Standings
      </button>
    </div>
  );
}
