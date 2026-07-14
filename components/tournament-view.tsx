"use client";

import { useState } from "react";
import { Tournament } from "@/lib/types";
import PoolMatchEntry from "./pool-match-entry";
import StandingsView from "./standings-view";
import BracketsView from "./brackets-view";
import PoolEditor from "./pool-editor";
import ScheduleView from "./schedule-view";

interface TournamentViewProps {
  tournament: Tournament;
  onBack: () => void;
  onTournamentUpdated?: (t: Tournament) => void;
}

type ViewMode = "entry" | "standings" | "brackets" | "schedule" | "edit-pools";

const TABS: { id: ViewMode; label: string; short: string }[] = [
  { id: "entry",     label: "Match Entry", short: "Entry"    },
  { id: "standings", label: "Standings",   short: "Stndgs"  },
  { id: "brackets",  label: "Brackets",    short: "Brkts"   },
  { id: "schedule",  label: "Schedule",    short: "Sched"   },
];

export default function TournamentView({ tournament, onBack, onTournamentUpdated }: TournamentViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("entry");
  const [updatedTournament, setUpdatedTournament] = useState(tournament);

  const handleTournamentUpdate = (t: Tournament) => {
    setUpdatedTournament(t);
    onTournamentUpdated?.(t);
  };

  const poolsWithMatches = updatedTournament.pools.filter((p) => p.matches.length > 0).length;
  const totalPools = updatedTournament.pools.length;
  const allDone = poolsWithMatches === totalPools;

  return (
    <div className="space-y-4">
      {/* Tournament header card */}
      <div className="bg-white rounded-lg shadow px-4 py-4 sm:px-6">
        <div className="flex justify-between items-start gap-3">
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
              {updatedTournament.name}
            </h2>
            <p className="text-gray-500 text-sm mt-0.5">
              {totalPools} pool{totalPools !== 1 ? "s" : ""} · {updatedTournament.pools.reduce((s, p) => s + p.teams.length, 0)} teams
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setViewMode("edit-pools")}
              className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1.5 rounded-lg font-medium transition"
            >
              ✎ Edit Pools
            </button>
            <button
              onClick={onBack}
              className="text-xs text-gray-500 hover:text-gray-800 font-medium px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition"
            >
              ← New
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${totalPools > 0 ? (poolsWithMatches / totalPools) * 100 : 0}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 shrink-0">
            {allDone ? "✓ All pools scored" : `${poolsWithMatches}/${totalPools} pools scored`}
          </span>
        </div>
      </div>

      {/* Tabs + content */}
      <div className="bg-white rounded-lg shadow">
        <div className="flex border-b overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id)}
              className={`flex-1 px-3 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                viewMode === tab.id
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <span className="sm:hidden">{tab.short}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-6">
          {viewMode === "entry" && (
            <PoolMatchEntry tournament={updatedTournament} onMatchesUpdated={setUpdatedTournament} />
          )}
          {viewMode === "standings" && <StandingsView tournament={updatedTournament} />}
          {viewMode === "brackets" && <BracketsView tournament={updatedTournament} />}
          {viewMode === "schedule" && (
            <ScheduleView tournament={updatedTournament} onScheduleUpdated={handleTournamentUpdate} />
          )}
          {viewMode === "edit-pools" && (
            <PoolEditor
              tournament={updatedTournament}
              onSave={(updated) => { setUpdatedTournament(updated); setViewMode("entry"); }}
              onCancel={() => setViewMode("entry")}
            />
          )}
        </div>
      </div>
    </div>
  );
}
