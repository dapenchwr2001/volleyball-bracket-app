"use client";

import { useState } from "react";
import TournamentSetup from "@/components/tournament-setup";
import TournamentView from "@/components/tournament-view";
import { Tournament } from "@/lib/types";

export default function Home() {
  const [tournament, setTournament] = useState<Tournament | null>(null);

  const handleTournamentCreated = (newTournament: Tournament) => {
    setTournament(newTournament);
  };

  const handleBack = () => {
    setTournament(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-gray-900">
            🏐 Volleyball Bracket Generator
          </h1>
          <p className="text-gray-600 mt-1">
            Automatic seeding and bracket creation for 17U tournaments
          </p>
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
