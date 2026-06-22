"use client";

import { useState } from "react";
import { Tournament } from "@/lib/types";
import PoolMatchEntry from "./pool-match-entry";
import StandingsView from "./standings-view";
import BracketsView from "./brackets-view";
import PoolEditor from "./pool-editor";

interface TournamentViewProps {
  tournament: Tournament;
  onBack: () => void;
  onTournamentUpdate?: (tournament: Tournament) => void;
}

type ViewMode = "entry" | "standings" | "brackets" | "edit-pools";

export default function TournamentView({
  tournament,
  onBack,
}: TournamentViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("entry");
  const [updatedTournament, setUpdatedTournament] = useState(tournament);

  const handleMatchesUpdated = (updatedTourney: Tournament) => {
    setUpdatedTournament(updatedTourney);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {updatedTournament.name}
            </h2>
            <p className="text-gray-600 mt-1">
              {updatedTournament.pools.length} pools • {updatedTournament.pools.reduce((sum, p) => sum + p.teams.length, 0)} teams
            </p>
          </div>
          <div className="flex gap-2">
            {viewMode !== "entry" && (
              <button
                onClick={() => setViewMode("edit-pools")}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                ✎ Edit Pools
              </button>
            )}
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900 font-medium text-sm"
            >
              ← New Tournament
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="flex flex-wrap border-b">
          <button
            onClick={() => setViewMode("entry")}
            className={`flex-1 px-4 py-3 font-medium text-center ${
              viewMode === "entry"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Match Entry
          </button>
          <button
            onClick={() => setViewMode("standings")}
            className={`flex-1 px-4 py-3 font-medium text-center ${
              viewMode === "standings"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Standings
          </button>
          <button
            onClick={() => setViewMode("brackets")}
            className={`flex-1 px-4 py-3 font-medium text-center ${
              viewMode === "brackets"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Brackets
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {viewMode === "entry" && (
            <PoolMatchEntry
              tournament={updatedTournament}
              onMatchesUpdated={handleMatchesUpdated}
            />
          )}
          {viewMode === "standings" && (
            <StandingsView tournament={updatedTournament} />
          )}
          {viewMode === "brackets" && (
            <BracketsView tournament={updatedTournament} />
          )}
          {viewMode === "edit-pools" && (
            <PoolEditor
              tournament={updatedTournament}
              onSave={(updated) => {
                setUpdatedTournament(updated);
                setViewMode("entry");
              }}
              onCancel={() => setViewMode("entry")}
            />
          )}
        </div>
      </div>
    </div>
  );
}
