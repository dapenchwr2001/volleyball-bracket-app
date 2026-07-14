"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { decodeShare } from "@/lib/share-utils";
import { Tournament } from "@/lib/types";
import StandingsView from "@/components/standings-view";
import BracketsView from "@/components/brackets-view";

type Tab = "standings" | "brackets";

export default function ViewPage() {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("brackets");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const d = new URLSearchParams(window.location.search).get("d");
    if (!d) { setError("No tournament data in this link."); return; }
    const t = decodeShare(d);
    if (!t) { setError("This link appears to be invalid or corrupted."); return; }
    setTournament(t);
  }, []);

  const hasScores = useMemo(
    () => tournament?.pools.every(p => p.matches.length > 0) ?? false,
    [tournament]
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  /* ── Loading / error states ── */
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
          <div className="text-4xl mb-3">🔗</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid link</h2>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <Link href="/" className="inline-block bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition">
            Create your own bracket →
          </Link>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <p className="text-gray-400 text-sm animate-pulse">Loading bracket…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex justify-between items-start gap-3 flex-wrap">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  🔗 Shared bracket
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight truncate">
                🏐 {tournament.name}
              </h1>
              <p className="text-gray-500 text-xs mt-0.5">
                {tournament.pools.length} pool{tournament.pools.length !== 1 ? "s" : ""} ·{" "}
                {tournament.pools.reduce((s, p) => s + p.teams.length, 0)} teams
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopy}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg transition ${
                  copied
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                }`}
              >
                {copied ? "✓ Copied!" : "📋 Copy link"}
              </button>
              <Link
                href="/"
                className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                + Create yours
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {/* Pool standings quick summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b">
            {(["brackets", "standings"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-3 text-sm font-medium transition-colors capitalize ${
                  tab === t
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {t === "brackets" ? "🏆 Brackets" : "📊 Standings"}
              </button>
            ))}
          </div>

          <div className="p-4 sm:p-6">
            {tab === "standings" && <StandingsView tournament={tournament} />}
            {tab === "brackets" && <BracketsView tournament={tournament} />}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-gray-900">Run your own tournament?</p>
            <p className="text-sm text-gray-500 mt-0.5">
              Volleyball Bracketeer is free — import OVR rankings, auto-seed pools, and share brackets in seconds.
            </p>
          </div>
          <Link
            href="/"
            className="shrink-0 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition shadow-sm"
          >
            🏐 Create free bracket →
          </Link>
        </div>
      </main>
    </div>
  );
}
