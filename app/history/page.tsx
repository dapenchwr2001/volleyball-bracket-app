"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Tournament } from "@/lib/types";
import AuthButton from "@/components/auth-button";

interface SavedTournament {
  id: string;
  savedAt: string;
  data: Tournament;
}

function historyKey(email: string | null | undefined) {
  return email ? `volleyball_history_${email}` : "volleyball_history_guest";
}

export default function HistoryPage() {
  const { data: session } = useSession();
  const [history, setHistory] = useState<SavedTournament[]>([]);
  const router = useRouter();

  const key = historyKey(session?.user?.email);

  useEffect(() => {
    const raw = localStorage.getItem(key);
    setHistory(raw ? JSON.parse(raw) : []);
  }, [key]);

  const handleLoad = (tournament: Tournament) => {
    localStorage.setItem("volleyball_tournament", JSON.stringify(tournament));
    router.push("/");
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Delete this tournament from history?")) return;
    const updated = history.filter((t) => t.id !== id);
    setHistory(updated);
    localStorage.setItem(key, JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium text-sm">
              ← Back
            </Link>
            <h1 className="text-xl font-bold text-gray-900">📋 My Tournaments</h1>
          </div>
          <AuthButton />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        {!session?.user && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
            <p className="font-medium">Sign in to keep history tied to your account.</p>
            <p className="text-sm mt-1">
              Without signing in, history is saved only in this browser. Different organizers on the same device will share the same list.
            </p>
          </div>
        )}

        {history.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-10 text-center">
            <p className="text-4xl mb-3">🏐</p>
            <p className="text-gray-600 font-medium">No saved tournaments yet.</p>
            <p className="text-sm text-gray-400 mt-1">
              Create a tournament and hit <strong>Save to History</strong> to archive it here.
            </p>
            <Link
              href="/"
              className="mt-4 inline-block bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Create Tournament
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-lg shadow px-5 py-4 flex justify-between items-center gap-4"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{t.data.name}</p>
                  <p className="text-sm text-gray-500">
                    {t.data.pools.length} pool{t.data.pools.length !== 1 ? "s" : ""} ·{" "}
                    {new Date(t.savedAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleLoad(t.data)}
                    className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                  >
                    Load
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="text-red-500 hover:text-red-700 px-2 py-1.5 text-sm font-medium transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
