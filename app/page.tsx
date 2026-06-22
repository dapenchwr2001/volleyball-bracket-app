"use client";

import { useState, useEffect } from "react";
import TournamentSetup from "@/components/tournament-setup";
import TournamentView from "@/components/tournament-view";
import { Tournament } from "@/lib/types";

export default function Home() {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load tournament from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("volleyball_tournament");
    if (saved) {
      try {
        setTournament(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load saved tournament:", e);
      }
    }
    setIsLoading(false);
  }, []);

  // Save tournament to localStorage whenever it changes
  useEffect(() => {
    if (tournament) {
      localStorage.setItem("volleyball_tournament", JSON.stringify(tournament));
    }
  }, [tournament]);

  const handleTournamentCreated = (newTournament: Tournament) => {
    setTournament(newTournament);
  };

  const handleBack = () => {
    if (window.confirm("Start a new tournament? Your current data will remain saved.")) {
      setTournament(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-gray-700 font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              🏐 Volleyball Bracket Generator
            </h1>
            <p className="text-gray-600 mt-1">
              Automatic seeding and bracket creation for 17U tournaments
            </p>
          </div>
          {tournament && (
            <button
              onClick={() => {
                if (window.confirm("Clear all data and start fresh?")) {
                  localStorage.removeItem("volleyball_tournament");
                  setTournament(null);
                }
              }}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Reset All
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!tournament ? (
          <TournamentSetup onTournamentCreated={handleTournamentCreated} />
        ) : (
          <TournamentView tournament={tournament} onBack={handleBack} />
        )}
      </main>
    </div>
  );
}
