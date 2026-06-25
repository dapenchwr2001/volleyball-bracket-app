"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import TournamentSetup from "@/components/tournament-setup";
import TournamentView from "@/components/tournament-view";
import AuthButton from "@/components/auth-button";
import ProfileSetupModal from "@/components/profile-setup-modal";
import { Tournament } from "@/lib/types";
import { CoachProfile, loadProfile } from "@/lib/profile";

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
  const [profile, setProfile] = useState<CoachProfile | null>(null);
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  // Load tournament from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("volleyball_tournament");
    if (saved) {
      try { setTournament(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
    setIsLoading(false);
  }, []);

  // Persist tournament to localStorage
  useEffect(() => {
    if (tournament) localStorage.setItem("volleyball_tournament", JSON.stringify(tournament));
  }, [tournament]);

  // Load or prompt profile setup when session arrives
  useEffect(() => {
    if (!session?.user?.email) return;
    const existing = loadProfile(session.user.email);
    if (existing) {
      setProfile(existing);
    } else {
      // First login — show setup modal
      setShowProfileSetup(true);
    }
  }, [session?.user?.email]);

  const handleSaveToHistory = () => {
    if (!tournament) return;
    const key = historyKey(session?.user?.email);
    const existing: SavedTournament[] = JSON.parse(localStorage.getItem(key) || "[]");
    const entry: SavedTournament = { id: `${Date.now()}`, savedAt: new Date().toISOString(), data: tournament };
    localStorage.setItem(key, JSON.stringify([entry, ...existing].slice(0, 30)));
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
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
      {/* Profile setup modal — first login only */}
      {showProfileSetup && session?.user?.email && (
        <ProfileSetupModal
          email={session.user.email}
          googleName={session.user.name || ""}
          onComplete={(p) => { setProfile(p); setShowProfileSetup(false); }}
        />
      )}

      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          {/* Top row: brand + auth */}
          <div className="flex justify-between items-center gap-3">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                🏐 Volleyball Bracketeer
              </h1>
              <p className="text-gray-500 text-xs hidden sm:block mt-0.5">
                Automatic seeding and bracket creation for 17U tournaments
              </p>
            </div>
            <AuthButton profile={profile} />
          </div>

          {/* Bottom row: nav actions */}
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
            <Link
              href="/history"
              className="flex items-center gap-1 text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              📋 <span className="hidden xs:inline">My </span>History
            </Link>
            {tournament && (
              <>
                <span className="text-gray-300">|</span>
                <button
                  onClick={handleSaveToHistory}
                  className={`text-xs sm:text-sm font-semibold px-3 py-1 rounded-full transition-all ${
                    savedFeedback
                      ? "bg-green-100 text-green-700"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
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
                  className="text-xs sm:text-sm text-red-500 hover:text-red-700 font-medium ml-1"
                >
                  Reset
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {!tournament ? (
          <TournamentSetup
            onTournamentCreated={(t) => setTournament(t)}
            defaultOVRDivision={profile?.defaultOVRDivision || ""}
          />
        ) : (
          <TournamentView
            tournament={tournament}
            onBack={() => {
              if (window.confirm("Start a new tournament? Your current data will remain saved.")) {
                setTournament(null);
              }
            }}
          />
        )}
      </main>
    </div>
  );
}
