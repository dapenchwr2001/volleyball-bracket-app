"use client";

import { useState } from "react";
import { Tournament } from "@/lib/types";

interface PoolEditorProps {
  tournament: Tournament;
  onSave: (tournament: Tournament) => void;
  onCancel: () => void;
}

export default function PoolEditor({ tournament, onSave, onCancel }: PoolEditorProps) {
  const [name, setName] = useState(tournament.name);
  const [pools, setPools] = useState(tournament.pools);

  const handleUpdateTeamName = (poolIdx: number, teamIdx: number, newName: string) => {
    const updated = [...pools];
    updated[poolIdx].teams[teamIdx].name = newName;
    setPools(updated);
  };

  const handleUpdatePoolName = (poolIdx: number, newName: string) => {
    const updated = [...pools];
    updated[poolIdx].name = newName;
    setPools(updated);
  };

  const handleSave = () => {
    const updated = {
      ...tournament,
      name,
      pools,
    };
    onSave(updated);
  };

  return (
    <div className="space-y-6">
      {/* Tournament Name */}
      <div className="bg-white rounded-lg shadow p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tournament Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Edit Pools */}
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <h2 className="text-xl font-semibold">Edit Pools & Teams</h2>

        {pools.map((pool, poolIdx) => (
          <div key={pool.id} className="border-t pt-6 first:border-t-0 first:pt-0">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pool Name
              </label>
              <input
                type="text"
                value={pool.name}
                onChange={(e) => handleUpdatePoolName(poolIdx, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pool.teams.map((team, teamIdx) => (
                <div key={team.id}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Team {teamIdx + 1}
                  </label>
                  <input
                    type="text"
                    value={team.name}
                    onChange={(e) =>
                      handleUpdateTeamName(poolIdx, teamIdx, e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 font-medium"
        >
          Save Changes
        </button>
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-300 text-gray-900 py-2 px-4 rounded-lg hover:bg-gray-400 font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
