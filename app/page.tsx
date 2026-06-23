"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import TournamentSetup from "@/components/tournament-setup";
import TournamentView from "@/components/tournament-view";
import AuthButton from "@/components/auth-button";
import { Tournament } from "@/lib/types";

interface SavedTournament {
  id: string;
  savedAt: string;
  data: Tournament;
}

function historyKey(email: string | null | undefined) {
  return email ? `volleyball_history_${email}` : "volleyball_history_guest";
}

export default function Home() {
  const { data: session } = useSession();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savedFeedback, setSavedFeedback] = useState(false);

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

  useEffect(() => {
    if (tournament) {
      localStorage.setItem("volleyball_tournament", JSON.stringify(tournament));
    }
  }, [tournament]);

  const handleSaveToHistory = () => {
    if (!tournament) return;
    const key = historyKey(session?.user?.email);
    const existing: SavedTournament[] = JSON.parse(localStorage.getItem(key) || "[]");
    const entry: SavedTournament = {
      id: `${Date.now()}`,
      savedAt: new Date().toISOString(),
      data: tournament,
    };
    localStorage.setItem(key, JSON.stringify([entry, ...existing].slice(0, 30)));
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                🏐 Volleyball Bracketeer
              </h1>
              <p className="text-gray-600 mt-0.5 text-sm">
                Automatic seeding and bracket creation for 17U tournaments
              </p>
            </div>

            {/* Right side controls */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              <AuthButton />
              <div className="flex items-center gap-3 text-sm">
                <Link
                  href="/history"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  📋 My History
                </Link>
                {tournament && (
                  <>
                    <button
                      onClick={handleSaveToHistory}
                      className={`font-medium transition-colors ${
                        savedFeedback
                          ? "text-green-600"
                          : "text-indigo-600 hover:text-indigo-800"
                      }`}
                    >
                      {savedFeedback ? "✓ Saved!" : "💾 Save"}
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm("Clear all data and start fresh?")) {
                          localStorage.removeItem("volleyball_tournament");
                          setTournament(null);
                        }
                      }}
                      className="text-red-500 hover:text-red-700 font-medium"
                    >
                      Reset
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
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
