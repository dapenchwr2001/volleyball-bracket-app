"use client";

import { useState, useMemo } from "react";
import { Tournament, ScheduleEntry } from "@/lib/types";
import { generateMatchSlots, autoSchedule } from "@/lib/schedule-utils";

interface ScheduleViewProps {
  tournament: Tournament;
  onScheduleUpdated: (tournament: Tournament) => void;
}

export default function ScheduleView({ tournament, onScheduleUpdated }: ScheduleViewProps) {
  // Initialise from saved schedule or generate fresh slots
  const initialSlots = useMemo(() => {
    if (tournament.schedule && tournament.schedule.length > 0) return tournament.schedule;
    return generateMatchSlots(tournament.pools);
  }, [tournament]);

  const [entries, setEntries] = useState<ScheduleEntry[]>(initialSlots);

  // Auto-schedule controls
  const [startTime, setStartTime] = useState("08:00");
  const [duration, setDuration] = useState(50);
  const [courts, setCourts] = useState<string[]>(["Court 1", "Court 2"]);
  const [newCourt, setNewCourt] = useState("");
  const [showAutoSetup, setShowAutoSetup] = useState(true);
  const [saved, setSaved] = useState(false);

  // Group entries by time slot for display
  const grouped = useMemo(() => {
    const map = new Map<string, ScheduleEntry[]>();
    for (const e of entries) {
      const key = e.time || "Unscheduled";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    // Sort: unscheduled last, then by AM/PM and hour
    const sorted = [...map.entries()].sort(([a], [b]) => {
      if (a === "Unscheduled") return 1;
      if (b === "Unscheduled") return -1;
      return parseTime(a) - parseTime(b);
    });
    return sorted;
  }, [entries]);

  function parseTime(t: string): number {
    const m = t.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!m) return 9999;
    let h = parseInt(m[1]);
    const min = parseInt(m[2]);
    if (m[3].toUpperCase() === "PM" && h !== 12) h += 12;
    if (m[3].toUpperCase() === "AM" && h === 12) h = 0;
    return h * 60 + min;
  }

  const updateEntry = (matchId: string, field: "time" | "court", value: string) => {
    setEntries((prev) => prev.map((e) => e.matchId === matchId ? { ...e, [field]: value } : e));
  };

  const handleAutoSchedule = () => {
    const result = autoSchedule(tournament.pools, startTime, duration, courts);
    setEntries(result);
  };

  const handleSave = () => {
    onScheduleUpdated({ ...tournament, schedule: entries });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addCourt = () => {
    const name = newCourt.trim();
    if (name && !courts.includes(name)) { setCourts([...courts, name]); }
    setNewCourt("");
  };

  const removeCourt = (c: string) => setCourts(courts.filter((x) => x !== c));

  const totalMatches = entries.length;
  const scheduled = entries.filter((e) => e.time).length;

  return (
    <div className="space-y-5">

      {/* Auto-schedule panel */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <button
          onClick={() => setShowAutoSetup((v) => !v)}
          className="w-full flex justify-between items-center px-5 py-3.5 text-left hover:bg-gray-50 transition"
        >
          <span className="font-semibold text-gray-900">⚡ Auto-Schedule</span>
          <span className="text-gray-400 text-sm">{showAutoSetup ? "▲ Hide" : "▼ Show"}</span>
        </button>

        {showAutoSetup && (
          <div className="border-t px-5 py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Minutes per match</label>
                <input
                  type="number"
                  min={15}
                  max={180}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Courts</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {courts.map((c) => (
                  <span key={c} className="flex items-center gap-1 bg-blue-50 text-blue-800 text-sm px-2.5 py-1 rounded-full border border-blue-200">
                    {c}
                    <button onClick={() => removeCourt(c)} className="text-blue-400 hover:text-red-500 ml-0.5 font-bold">×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCourt}
                  onChange={(e) => setNewCourt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCourt()}
                  placeholder="e.g., Court 3"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-2 focus:ring-blue-500"
                />
                <button onClick={addCourt} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium">
                  + Add
                </button>
              </div>
            </div>

            <button
              onClick={handleAutoSchedule}
              className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition text-sm"
            >
              ⚡ Generate Schedule
            </button>
          </div>
        )}
      </div>

      {/* Progress + Save */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          {scheduled === totalMatches
            ? <span className="text-green-600 font-medium">✓ All {totalMatches} matches scheduled</span>
            : <span>{scheduled}/{totalMatches} matches scheduled</span>}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-medium transition"
          >
            🖨️ Print
          </button>
          <button
            onClick={handleSave}
            className={`text-sm px-4 py-1.5 rounded-lg font-semibold transition ${
              saved ? "bg-green-500 text-white" : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            {saved ? "✓ Saved!" : "Save Schedule"}
          </button>
        </div>
      </div>

      {/* Schedule table — grouped by time */}
      <div className="space-y-4">
        {grouped.map(([timeLabel, timeEntries]) => (
          <div key={timeLabel} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Time header */}
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center gap-2">
              <span className="text-sm font-bold text-gray-900">
                {timeLabel === "Unscheduled" ? "⏳ Unscheduled" : `🕐 ${timeLabel}`}
              </span>
              <span className="text-xs text-gray-400">{timeEntries.length} match{timeEntries.length !== 1 ? "es" : ""}</span>
            </div>

            {/* Matches in this time slot */}
            <div className="divide-y divide-gray-100">
              {timeEntries.map((entry) => (
                <div key={entry.matchId} className="flex items-center gap-3 px-4 py-3 flex-wrap sm:flex-nowrap">
                  {/* Pool badge */}
                  <span className="shrink-0 text-xs font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100 w-16 text-center">
                    {entry.poolName}
                  </span>

                  {/* Match teams */}
                  <span className="flex-1 text-sm font-medium text-gray-900 min-w-0">
                    {entry.team1Name}
                    <span className="text-gray-400 mx-1.5 font-normal">vs</span>
                    {entry.team2Name}
                  </span>

                  {/* Time input */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs text-gray-400 hidden sm:inline">Time</span>
                    <input
                      type="text"
                      value={entry.time}
                      onChange={(e) => updateEntry(entry.matchId, "time", e.target.value)}
                      placeholder="8:00 AM"
                      className="w-24 px-2 py-1 border border-gray-200 rounded-lg text-sm text-gray-900 text-center focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>

                  {/* Court input */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs text-gray-400 hidden sm:inline">Court</span>
                    {courts.length > 0 ? (
                      <select
                        value={entry.court}
                        onChange={(e) => updateEntry(entry.matchId, "court", e.target.value)}
                        className="w-28 px-2 py-1 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-400"
                      >
                        <option value="">— pick —</option>
                        {courts.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={entry.court}
                        onChange={(e) => updateEntry(entry.matchId, "court", e.target.value)}
                        placeholder="Court 1"
                        className="w-24 px-2 py-1 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-400"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Print-only view */}
      <style>{`
        @media print {
          @page { margin: 0.5in; size: letter; }
          body * { visibility: hidden !important; }
          #schedule-print { display: block !important; }
          #schedule-print, #schedule-print * { visibility: visible !important; }
          #schedule-print {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            background: white !important;
          }
        }
      `}</style>
      <div id="schedule-print" style={{ display: "none", fontFamily: "Arial, Helvetica, sans-serif" }}>

        {/* Page header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "3px solid #1e3a5f", paddingBottom: 12, marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: "#64748b", marginBottom: 4 }}>
              Match Schedule
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#1e3a5f", lineHeight: 1.1 }}>
              {tournament.name}
            </div>
          </div>
          <div style={{ textAlign: "right", fontSize: 11, color: "#94a3b8", lineHeight: 1.6 }}>
            <div>{entries.length} total matches</div>
            <div>{new Set(entries.map(e => e.court).filter(Boolean)).size} courts</div>
          </div>
        </div>

        {/* Time-grouped blocks */}
        {grouped.map(([timeLabel, timeEntries]) => {
          const POOL_CHIP: Record<number, { bg: string; fg: string }> = {
            0: { bg: "#dbeafe", fg: "#1d4ed8" },
            1: { bg: "#dcfce7", fg: "#15803d" },
            2: { bg: "#fef9c3", fg: "#a16207" },
            3: { bg: "#f3e8ff", fg: "#7e22ce" },
            4: { bg: "#ffedd5", fg: "#c2410c" },
          };
          return (
            <div key={timeLabel} style={{ marginBottom: 14, pageBreakInside: "avoid" }}>
              {/* Time slot header */}
              <div style={{ backgroundColor: "#1e3a5f", color: "white", padding: "5px 14px", borderRadius: "4px 4px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>
                  {timeLabel === "Unscheduled" ? "⏳ Unscheduled" : timeLabel}
                </span>
                <span style={{ fontSize: 11, opacity: 0.65, fontWeight: 400 }}>
                  {timeEntries.length} match{timeEntries.length !== 1 ? "es" : ""}
                </span>
              </div>
              {/* Match rows */}
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, border: "1px solid #cbd5e1", borderTop: "none" }}>
                <tbody>
                  {timeEntries.map((e, i) => {
                    const idx = e.poolName.charCodeAt(e.poolName.length - 1) - 65;
                    const pc = POOL_CHIP[idx % 5] ?? POOL_CHIP[0];
                    return (
                      <tr key={e.matchId} style={{ backgroundColor: i % 2 === 0 ? "#f8fafc" : "white", borderBottom: "1px solid #e2e8f0" }}>
                        <td style={{ padding: "7px 14px", width: 88, fontWeight: 700, color: "#1e3a5f", fontSize: 12 }}>
                          {e.court || "—"}
                        </td>
                        <td style={{ padding: "7px 8px", width: 68 }}>
                          <span style={{ display: "inline-block", backgroundColor: pc.bg, color: pc.fg, padding: "1px 7px", borderRadius: 3, fontSize: 10.5, fontWeight: 700 }}>
                            {e.poolName}
                          </span>
                        </td>
                        <td style={{ padding: "7px 8px", color: "#111827" }}>
                          <span style={{ fontWeight: 600 }}>{e.team1Name}</span>
                          <span style={{ color: "#94a3b8", margin: "0 8px", fontWeight: 400 }}>vs</span>
                          <span style={{ fontWeight: 600 }}>{e.team2Name}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}

        {/* Footer */}
        <div style={{ marginTop: 28, borderTop: "1px solid #e2e8f0", paddingTop: 8, textAlign: "center", fontSize: 10, color: "#94a3b8" }}>
          Volleyball Bracketeer · volleyball-bracket-app.vercel.app
        </div>
      </div>
    </div>
  );
}
