"use client";

import { useState } from "react";
import { Tournament, SetScore, Match } from "@/lib/types";

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
    value: string
  ) => {
    // Validate input: must be integer, no negatives or decimals
    let points = parseInt(value) || 0;

    // Enforce constraints
    if (points < 0) points = 0;
    if (points > 30) points = 30; // Allow deuce scoring (up to 30)
    if (!Number.isInteger(points)) points = Math.floor(points);

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

  // Validate volleyball scoring: winner must have ≥25 points AND lead by ≥2
  const isValidSet = (team1Points: number, team2Points: number): boolean => {
    if (team1Points === 0 && team2Points === 0) return true; // Empty set is valid

    const maxPoints = Math.max(team1Points, team2Points);
    const minPoints = Math.min(team1Points, team2Points);
    const diff = maxPoints - minPoints;

    // Must have at least 25 points to win
    if (maxPoints < 25) return false;
    // Must win by at least 2 points
    if (diff < 2) return false;

    return true;
  };

  // Count how many sets each team has won in a match
  const getSetsWon = (matchId: string): { team1: number; team2: number } => {
    const scores = setScores.get(matchId) || [];
    let team1Won = 0;
    let team2Won = 0;

    scores.forEach(({ team1Points, team2Points }) => {
      if (team1Points === 0 && team2Points === 0) return; // Skip empty sets
      if (isValidSet(team1Points, team2Points)) {
        if (team1Points > team2Points) team1Won++;
        else if (team2Points > team1Points) team2Won++;
      }
    });

    return { team1: team1Won, team2: team2Won };
  };

  // Generate realistic volleyball scores
  // Rule: Game ends when a team reaches 25+ points WITH a 2-point lead
  const generateRandomScore = (): SetScore => {
    // 70% close matches, 30% blowouts
    const isClose = Math.random() < 0.7;

    if (isClose) {
      // Close/deuce match: winner wins by EXACTLY 2 points at 25+
      // Examples: 25-23, 26-24, 27-25, 28-26, 29-27, 30-28
      const winnerScore = 25 + Math.floor(Math.random() * 4); // 25-28
      const loserScore = winnerScore - 2; // Always exactly 2 point margin
      return Math.random() < 0.5
        ? { team1Points: winnerScore, team2Points: loserScore }
        : { team1Points: loserScore, team2Points: winnerScore };
    } else {
      // Blowout: winner reaches 25+ quickly, loser stays low (0-18)
      // Game ends at 25+ with 2+ point lead
      const winnerScore = 25 + Math.floor(Math.random() * 3); // 25-27
      const loserScore = Math.floor(Math.random() * 18); // 0-17
      return Math.random() < 0.5
        ? { team1Points: winnerScore, team2Points: loserScore }
        : { team1Points: loserScore, team2Points: winnerScore };
    }
  };

  const handleGenerateAllScores = () => {
    const newScores = new Map(setScores);

    matches.forEach((match) => {
      const scores: SetScore[] = [];

      // Generate a full match (best of 5)
      let team1SetsWon = 0;
      let team2SetsWon = 0;

      for (let setIdx = 0; setIdx < 5; setIdx++) {
        if (team1SetsWon === 3 || team2SetsWon === 3) {
          // Match is over, no more sets needed
          scores.push({ team1Points: 0, team2Points: 0 });
        } else {
          const setScore = generateRandomScore();
          scores.push(setScore);

          // Count set wins
          if (setScore.team1Points > setScore.team2Points) {
            team1SetsWon++;
          } else {
            team2SetsWon++;
          }
        }
      }

      newScores.set(match.id, scores);
    });

    setSetScores(newScores);
    alert("✓ Random scores generated for all matches!");
  };

  const handleSaveMatches = () => {
    // Validate all matches before saving
    const errors: string[] = [];

    matches.forEach((match, index) => {
      const scores = setScores.get(match.id) || [];
      const team1 = selectedPool.teams[match.team1Index];
      const team2 = selectedPool.teams[match.team2Index];

      // Check if match is empty (all scores 0)
      const allEmpty = scores.every((s) => s.team1Points === 0 && s.team2Points === 0);
      if (allEmpty || scores.length === 0) {
        errors.push(
          `Match ${index + 1} (${team1.name} vs ${team2.name}): All scores are empty`
        );
        return;
      }

      // Check if at least one set is completed
      const hasSets = scores.some(
        (s) => s.team1Points > 0 || s.team2Points > 0
      );
      if (!hasSets) {
        errors.push(
          `Match ${index + 1} (${team1.name} vs ${team2.name}): No completed sets`
        );
        return;
      }

      // Check if all filled sets are valid
      scores.forEach((score, setIdx) => {
        if ((score.team1Points > 0 || score.team2Points > 0) && !isValidSet(score.team1Points, score.team2Points)) {
          errors.push(
            `Match ${index + 1}, Set ${setIdx + 1}: Invalid score (${score.team1Points}-${score.team2Points}). Winner must have ≥25 and lead by ≥2`
          );
        }
      });
    });

    if (errors.length > 0) {
      alert("Cannot save matches:\n\n" + errors.join("\n\n"));
      return;
    }

    const updatedTournament = { ...tournament };
    const updatedPool = { ...selectedPool, matches: [] as Match[] };

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
    alert("✓ Matches saved successfully!");
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
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
        >
          {tournament.pools.map((pool) => {
            const hasScores = pool.matches.length > 0;
            return (
              <option key={pool.id} value={pool.id}>
                {hasScores ? "✓ " : ""}{pool.name}
              </option>
            );
          })}
        </select>
      </div>

      {/* Matches */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-900">
            Enter Match Results (Best of 5)
          </h3>
          <button
            onClick={handleGenerateAllScores}
            className="text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 font-medium"
            title="Generate random realistic scores for testing"
          >
            🎲 Auto-Generate Scores
          </button>
        </div>

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
                  <div key={setIdx} className="space-y-1">
                    <div className="flex gap-2 items-center">
                      <span className="text-sm text-gray-600 w-12">
                        Set {setIdx + 1}:
                      </span>
                      <input
                        type="number"
                        min="0"
                        max="30"
                        value={matchScores[setIdx]?.team1Points || ""}
                        onChange={(e) =>
                          handleSetScoreChange(
                            match.id,
                            setIdx,
                            "team1",
                            e.target.value
                          )
                        }
                        placeholder="—"
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-gray-900"
                      />
                      <span className="text-gray-600">-</span>
                      <input
                        type="number"
                        min="0"
                        max="30"
                        value={matchScores[setIdx]?.team2Points || ""}
                        onChange={(e) =>
                          handleSetScoreChange(
                            match.id,
                            setIdx,
                            "team2",
                            e.target.value
                          )
                        }
                        placeholder="—"
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-gray-900"
                      />
                      {matchScores[setIdx]?.team1Points !== 0 &&
                        matchScores[setIdx]?.team2Points !== 0 && (
                          <span
                            className={`text-xs font-semibold ${
                              isValidSet(
                                matchScores[setIdx].team1Points,
                                matchScores[setIdx].team2Points
                              )
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {isValidSet(
                              matchScores[setIdx].team1Points,
                              matchScores[setIdx].team2Points
                            )
                              ? "✓ Valid"
                              : "✗ Invalid"}
                          </span>
                        )}
                    </div>
                    {matchScores[setIdx]?.team1Points !== 0 &&
                      matchScores[setIdx]?.team2Points !== 0 &&
                      !isValidSet(
                        matchScores[setIdx].team1Points,
                        matchScores[setIdx].team2Points
                      ) && (
                        <div className="text-xs text-red-600">
                          Winner must have ≥25 points and lead by ≥2
                        </div>
                      )}
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
