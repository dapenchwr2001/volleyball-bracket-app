"use client";

import { useState } from "react";
import { Tournament, Pool, Team } from "@/lib/types";

interface TournamentSetupProps {
  onTournamentCreated: (tournament: Tournament) => void;
}

export default function TournamentSetup({
  onTournamentCreated,
}: TournamentSetupProps) {
  const [tournamentName, setTournamentName] = useState("");
  const [pools, setPools] = useState<Pool[]>([]);
  const [currentPoolName, setCurrentPoolName] = useState("");
  const [currentPoolTeams, setCurrentPoolTeams] = useState<string[]>(["", "", "", ""]);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const addPool = () => {
    if (!currentPoolName.trim()) {
      alert("Please enter a pool name");
      return;
    }

    if (currentPoolTeams.some((team) => !team.trim())) {
      alert("Please enter all 4 team names");
      return;
    }

    // Check for duplicate team names within this pool
    const teamNamesInPool = currentPoolTeams.map((t) => t.trim().toLowerCase());
    const duplicatesInPool = teamNamesInPool.filter(
      (name, index) => teamNamesInPool.indexOf(name) !== index
    );
    if (duplicatesInPool.length > 0) {
      alert(`Duplicate team name in pool: "${duplicatesInPool[0]}"`);
      return;
    }

    // Check for duplicate team names globally (across all pools)
    const allTeamNames = pools.flatMap((p) =>
      p.teams.map((t) => t.name.toLowerCase())
    );
    const duplicatesGlobal = currentPoolTeams.filter(
      (team) =>
        team.trim().length > 0 &&
        allTeamNames.includes(team.trim().toLowerCase())
    );
    if (duplicatesGlobal.length > 0) {
      alert(
        `Team name already exists in another pool: "${duplicatesGlobal[0]}"\n\nTeam names must be unique across all pools.`
      );
      return;
    }

    const newPool: Pool = {
      id: `pool-${Date.now()}`,
      name: currentPoolName,
      teams: currentPoolTeams.map((name, index) => ({
        id: `${Date.now()}-${index}`,
        name: name.trim(),
        poolId: `pool-${Date.now()}`,
      })),
      matches: [],
    };

    setPools([...pools, newPool]);
    setCurrentPoolName("");
    setCurrentPoolTeams(["", "", "", ""]);
  };

  const removePool = (index: number) => {
    setPools(pools.filter((_, i) => i !== index));
  };

  const updateTeamName = (index: number, value: string) => {
    const updated = [...currentPoolTeams];
    updated[index] = value;
    setCurrentPoolTeams(updated);
  };

  const handleCreateTournament = () => {
    if (!tournamentName.trim()) {
      alert("Please enter a tournament name");
      return;
    }

    if (pools.length === 0) {
      alert("Please create at least one pool");
      return;
    }

    const tournament: Tournament = {
      id: `tournament-${Date.now()}`,
      name: tournamentName,
      pools: pools.map((pool) => ({
        ...pool,
        teams: pool.teams.map((team) => ({
          ...team,
          poolId: pool.id,
        })),
      })),
    };

    onTournamentCreated(tournament);
  };

  return (
    <div className="space-y-8">
      {/* Collapsible How It Works */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg overflow-hidden">
        <button
          onClick={() => setShowHowItWorks((v) => !v)}
          className="w-full flex justify-between items-center px-4 py-3 text-left"
        >
          <span className="font-semibold text-blue-900">📋 How It Works</span>
          <span className="text-blue-600 text-sm">{showHowItWorks ? "▲ Hide" : "▼ Show"}</span>
        </button>
        {showHowItWorks && (
          <ul className="text-sm text-blue-800 space-y-1 px-4 pb-4">
            <li>✓ Create pools with exactly 4 teams each</li>
            <li>✓ Each team plays every other team in their pool once</li>
            <li>✓ Scores use FIVB system: Win 3-0/3-1 = 3 pts, Win 3-2 = 1 pt, Loss = 0 pts</li>
            <li>✓ Seeding is automatic based on pool standings</li>
            <li>✓ 1st place → Gold · 2nd/3rd → Silver · 4th → Bronze</li>
          </ul>
        )}
      </div>
      {/* Tournament Name */}
      <div className="bg-white rounded-lg shadow p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tournament Name
        </label>
        <input
          type="text"
          value={tournamentName}
          onChange={(e) => setTournamentName(e.target.value)}
          placeholder="e.g., Spring 17U Championship"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
        />
      </div>

      {/* Pool Setup */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Add Pools</h2>

        {/* Current Pool Input */}
        <div className="space-y-4 mb-6 pb-6 border-b">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pool Name
            </label>
            <input
              type="text"
              value={currentPoolName}
              onChange={(e) => setCurrentPoolName(e.target.value)}
              placeholder="e.g., Pool A"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teams (4 teams per pool)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentPoolTeams.map((teamName, index) => (
                <input
                  key={index}
                  type="text"
                  value={teamName}
                  onChange={(e) => updateTeamName(index, e.target.value)}
                  placeholder={`Team ${index + 1}`}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              ))}
            </div>
          </div>

          <button
            onClick={addPool}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-medium"
          >
            Add Pool
          </button>
        </div>

        {/* Display Added Pools */}
        {pools.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Added Pools:</h3>
            {pools.map((pool, index) => (
              <div key={pool.id} className="flex justify-between items-start bg-gray-50 p-3 rounded">
                <div>
                  <p className="font-medium text-gray-900">{pool.name}</p>
                  <p className="text-sm text-gray-600">
                    {pool.teams.map((t) => t.name).join(", ")}
                  </p>
                </div>
                <button
                  onClick={() => removePool(index)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        onClick={handleCreateTournament}
        disabled={!tournamentName || pools.length === 0}
        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed text-lg"
      >
        Create Tournament & Enter Match Results
      </button>
    </div>
  );
}
