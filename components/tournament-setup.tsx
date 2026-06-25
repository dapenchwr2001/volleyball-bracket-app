"use client";

import { useState } from "react";
import { Tournament, Pool } from "@/lib/types";

interface OVRTeam {
  rank: number;
  teamCode: string;
  teamName: string;
  tournaments: number;
  avgPoints: number;
}

interface TournamentSetupProps {
  onTournamentCreated: (tournament: Tournament) => void;
  defaultOVRDivision?: string;
}

const OVR_DIVISIONS = [
  { label: "Girls 18 National",  value: "G18N" },
  { label: "Girls 18 Regional",  value: "G18R" },
  { label: "Girls 18 American",  value: "G18A" },
  { label: "Girls 17 National",  value: "G17N" },
  { label: "Girls 17 Regional",  value: "G17R" },
  { label: "Girls 17 American",  value: "G17A" },
  { label: "Girls 16 National",  value: "G16N" },
  { label: "Girls 16 Regional",  value: "G16R" },
  { label: "Girls 16 American",  value: "G16A" },
  { label: "Girls 15 National",  value: "G15N" },
  { label: "Girls 15 Regional",  value: "G15R" },
  { label: "Girls 15 American",  value: "G15A" },
  { label: "Girls 14 National",  value: "G14N" },
  { label: "Girls 14 Regional",  value: "G14R" },
  { label: "Girls 14 American",  value: "G14A" },
  { label: "Girls 13 National",  value: "G13N" },
  { label: "Girls 13 Regional",  value: "G13R" },
  { label: "Girls 12 National",  value: "G12N" },
  { label: "Girls 12 Regional",  value: "G12R" },
  { label: "Boys 18 National",   value: "B18N" },
  { label: "Boys 18 Regional",   value: "B18R" },
  { label: "Boys 17 National",   value: "B17N" },
  { label: "Boys 17 Regional",   value: "B17R" },
  { label: "Boys 16 National",   value: "B16N" },
  { label: "Boys 16 Regional",   value: "B16R" },
  { label: "Boys 15 National",   value: "B15N" },
  { label: "Boys 15 Regional",   value: "B15R" },
  { label: "Boys 14 National",   value: "B14N" },
  { label: "Boys 14 Regional",   value: "B14R" },
];

function snakeSeed(teams: OVRTeam[], numPools: number): OVRTeam[][] {
  const pools: OVRTeam[][] = Array.from({ length: numPools }, () => []);
  let dir = 1;
  let idx = 0;
  for (const team of teams) {
    pools[idx].push(team);
    idx += dir;
    if (idx >= numPools) { idx = numPools - 1; dir = -1; }
    else if (idx < 0)    { idx = 0;            dir =  1; }
  }
  return pools;
}

export default function TournamentSetup({ onTournamentCreated, defaultOVRDivision = "" }: TournamentSetupProps) {
  const [tournamentName, setTournamentName] = useState("");
  const [pools, setPools] = useState<Pool[]>([]);
  const [currentPoolName, setCurrentPoolName] = useState("");
  const [currentPoolTeams, setCurrentPoolTeams] = useState<string[]>(["", "", "", ""]);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  // OVR import state
  const [showOVR, setShowOVR] = useState(false);
  const [ovrDiv, setOvrDiv] = useState(defaultOVRDivision || "G17N");
  const [ovrLoading, setOvrLoading] = useState(false);
  const [ovrError, setOvrError] = useState("");
  const [ovrTeams, setOvrTeams] = useState<OVRTeam[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [numPools, setNumPools] = useState(2);

  // ── OVR helpers ──────────────────────────────────────────────

  const loadOVRRankings = async () => {
    setOvrLoading(true);
    setOvrError("");
    setOvrTeams([]);
    setSelected(new Set());
    try {
      const res = await fetch(`/api/ovr-rankings?div=${ovrDiv}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setOvrTeams(data.teams as OVRTeam[]);
    } catch (e) {
      setOvrError(e instanceof Error ? e.message : "Failed to load rankings");
    } finally {
      setOvrLoading(false);
    }
  };

  const toggleTeam = (code: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const selectedTeams = ovrTeams.filter((t) => selected.has(t.teamCode));
  const poolSize = 4;
  const canGenerate = selectedTeams.length === numPools * poolSize;

  const generatePoolsFromOVR = () => {
    if (!canGenerate) return;
    const seeded = snakeSeed(selectedTeams, numPools);
    const newPools: Pool[] = seeded.map((group, pi) => {
      const poolId = `pool-${Date.now()}-${pi}`;
      return {
        id: poolId,
        name: `Pool ${String.fromCharCode(65 + pi)}`,
        teams: group.map((t, ti) => ({ id: `${poolId}-t${ti}`, name: t.teamName, poolId })),
        matches: [],
      };
    });
    setPools(newPools);
    setShowOVR(false);
    alert(`✓ ${numPools} pools generated with snake seeding from OVR rankings!`);
  };

  // ── Manual pool helpers ───────────────────────────────────────

  const addPool = () => {
    if (!currentPoolName.trim()) { alert("Please enter a pool name"); return; }
    if (currentPoolTeams.some((t) => !t.trim())) { alert("Please enter all 4 team names"); return; }

    const lowerNames = currentPoolTeams.map((t) => t.trim().toLowerCase());
    const dup = lowerNames.find((n, i) => lowerNames.indexOf(n) !== i);
    if (dup) { alert(`Duplicate team name in pool: "${dup}"`); return; }

    const allNames = pools.flatMap((p) => p.teams.map((t) => t.name.toLowerCase()));
    const globalDup = currentPoolTeams.find((t) => t.trim() && allNames.includes(t.trim().toLowerCase()));
    if (globalDup) { alert(`Team name already exists in another pool: "${globalDup}"`); return; }

    const poolId = `pool-${Date.now()}`;
    setPools([...pools, {
      id: poolId,
      name: currentPoolName,
      teams: currentPoolTeams.map((name, i) => ({ id: `${Date.now()}-${i}`, name: name.trim(), poolId })),
      matches: [],
    }]);
    setCurrentPoolName("");
    setCurrentPoolTeams(["", "", "", ""]);
  };

  const removePool = (index: number) => setPools(pools.filter((_, i) => i !== index));

  const updateTeamName = (index: number, value: string) => {
    const updated = [...currentPoolTeams];
    updated[index] = value;
    setCurrentPoolTeams(updated);
  };

  const handleCreateTournament = () => {
    if (!tournamentName.trim()) { alert("Please enter a tournament name"); return; }
    if (pools.length === 0) { alert("Please create at least one pool"); return; }
    onTournamentCreated({
      id: `tournament-${Date.now()}`,
      name: tournamentName,
      pools: pools.map((pool) => ({
        ...pool,
        teams: pool.teams.map((team) => ({ ...team, poolId: pool.id })),
      })),
    });
  };

  // ── Render ────────────────────────────────────────────────────

  return (
    <div className="space-y-8">

      {/* How It Works */}
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
        <label className="block text-sm font-medium text-gray-700 mb-2">Tournament Name</label>
        <input
          type="text"
          value={tournamentName}
          onChange={(e) => setTournamentName(e.target.value)}
          placeholder="e.g., Spring 17U Championship"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
        />
      </div>

      {/* OVR Rankings Import */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <button
          onClick={() => setShowOVR((v) => !v)}
          className="w-full flex justify-between items-center px-6 py-4 text-left hover:bg-gray-50 transition"
        >
          <div>
            <span className="font-semibold text-gray-900">🏆 Import from OVR Rankings</span>
            <span className="text-gray-500 text-sm ml-2">(optional)</span>
          </div>
          <span className="text-gray-400 text-sm">{showOVR ? "▲ Hide" : "▼ Show"}</span>
        </button>

        {showOVR && (
          <div className="px-6 pb-6 border-t space-y-4 pt-4">
            <p className="text-sm text-gray-600">
              Load live OVR standings, pick attending teams, and auto-seed pools using snake seeding.
            </p>

            {/* Division picker + load */}
            <div className="flex gap-2 flex-wrap">
              <select
                value={ovrDiv}
                onChange={(e) => setOvrDiv(e.target.value)}
                className="flex-1 min-w-[180px] px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm"
              >
                {OVR_DIVISIONS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
              <button
                onClick={loadOVRRankings}
                disabled={ovrLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {ovrLoading ? "Loading…" : "Load Rankings"}
              </button>
            </div>

            {ovrError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                ⚠️ {ovrError}
              </p>
            )}

            {/* Team list */}
            {ovrTeams.length > 0 && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium text-gray-700">
                    Select attending teams ({selected.size} selected)
                  </p>
                  <button onClick={() => setSelected(new Set())} className="text-xs text-gray-400 hover:text-gray-700">
                    Clear all
                  </button>
                </div>

                <div className="border rounded-lg overflow-hidden max-h-72 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 w-8"></th>
                        <th className="px-3 py-2 text-left text-gray-600 font-medium w-12">Rank</th>
                        <th className="px-3 py-2 text-left text-gray-600 font-medium">Team</th>
                        <th className="px-3 py-2 text-right text-gray-600 font-medium w-16">Avg</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ovrTeams.map((team) => (
                        <tr
                          key={team.teamCode}
                          onClick={() => toggleTeam(team.teamCode)}
                          className={`cursor-pointer border-t transition-colors ${
                            selected.has(team.teamCode) ? "bg-blue-50 hover:bg-blue-100" : "hover:bg-gray-50"
                          }`}
                        >
                          <td className="px-3 py-2">
                            <input type="checkbox" readOnly checked={selected.has(team.teamCode)} className="accent-blue-600" />
                          </td>
                          <td className="px-3 py-2 font-bold text-gray-500">{team.rank}</td>
                          <td className="px-3 py-2 text-gray-900">{team.teamName}</td>
                          <td className="px-3 py-2 text-right text-gray-500">{team.avgPoints.toFixed(3)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pool count + generate */}
                {selected.size > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700 shrink-0">Number of pools:</label>
                      <select
                        value={numPools}
                        onChange={(e) => setNumPools(Number(e.target.value))}
                        className="px-3 py-1.5 border border-gray-300 rounded text-gray-900 text-sm"
                      >
                        {[2, 3, 4, 5, 6, 7, 8].map((n) => (
                          <option key={n} value={n}>{n} pools ({n * poolSize} teams needed)</option>
                        ))}
                      </select>
                    </div>

                    {!canGenerate && (
                      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                        Need exactly {numPools * poolSize} teams for {numPools} pools of 4. Currently {selected.size} selected.
                      </p>
                    )}

                    <button
                      onClick={generatePoolsFromOVR}
                      disabled={!canGenerate}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                    >
                      ✓ Generate {numPools} Pools with Snake Seeding
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Manual Pool Setup */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Add Pools</h2>

        <div className="space-y-4 mb-6 pb-6 border-b">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pool Name</label>
            <input
              type="text"
              value={currentPoolName}
              onChange={(e) => setCurrentPoolName(e.target.value)}
              placeholder="e.g., Pool A"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Teams (4 teams per pool)</label>
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

          <button onClick={addPool} className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-medium">
            Add Pool
          </button>
        </div>

        {pools.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Added Pools:</h3>
            {pools.map((pool, index) => (
              <div key={pool.id} className="flex justify-between items-start bg-gray-50 p-3 rounded">
                <div>
                  <p className="font-medium text-gray-900">{pool.name}</p>
                  <p className="text-sm text-gray-600">{pool.teams.map((t) => t.name).join(", ")}</p>
                </div>
                <button onClick={() => removePool(index)} className="text-red-600 hover:text-red-800 text-sm font-medium">
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
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
