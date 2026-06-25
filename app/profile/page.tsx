"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CoachProfile, ROLES, loadProfile, saveProfile } from "@/lib/profile";

const OVR_DIVISIONS = [
  { label: "None / Not applicable", value: "" },
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

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [role, setRole] = useState("Head Coach");
  const [club, setClub] = useState("");
  const [teamsCoaching, setTeamsCoaching] = useState("");
  const [defaultOVRDivision, setDefaultOVRDivision] = useState("");
  const [saved, setSaved] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/"); return; }
    if (status === "authenticated" && session?.user?.email) {
      const profile = loadProfile(session.user.email);
      setName(profile?.name || session.user.name || "");
      setRole(profile?.role || "Head Coach");
      setClub(profile?.club || "");
      setTeamsCoaching(profile?.teamsCoaching || "");
      setDefaultOVRDivision(profile?.defaultOVRDivision || "");
      setLoaded(true);
    }
  }, [status, session, router]);

  const handleSave = () => {
    if (!session?.user?.email) return;
    const profile: CoachProfile = {
      email: session.user.email,
      name: name.trim() || session.user.name || "",
      role,
      club: club.trim(),
      teamsCoaching: teamsCoaching.trim(),
      defaultOVRDivision,
      setupComplete: true,
      updatedAt: new Date().toISOString(),
    };
    saveProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (status === "loading" || !loaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-gray-500">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Link href="/" className="text-gray-400 hover:text-gray-700 text-sm font-medium transition">
            ← Back
          </Link>
          <h1 className="text-lg font-bold text-gray-900">My Profile</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Avatar + google info banner */}
        {session?.user?.image && (
          <div className="bg-white rounded-xl shadow p-4 mb-6 flex items-center gap-4">
            <img src={session.user.image} alt="" className="w-14 h-14 rounded-full border-2 border-blue-100" />
            <div>
              <p className="font-semibold text-gray-900">{session.user.name}</p>
              <p className="text-sm text-gray-500">{session.user.email}</p>
              <p className="text-xs text-gray-400 mt-0.5">Signed in with Google</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow p-6 space-y-5">
          <h2 className="font-semibold text-gray-900 text-lg">Coaching Info</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
            >
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Club / Organization</label>
            <input
              type="text"
              value={club}
              onChange={(e) => setClub(e.target.value)}
              placeholder="e.g., AVC Volleyball Club"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teams Coaching</label>
            <textarea
              value={teamsCoaching}
              onChange={(e) => setTeamsCoaching(e.target.value)}
              placeholder="e.g., 17U Girls National, 15U Girls Regional"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default OVR Division
              <span className="text-gray-400 font-normal ml-1">(pre-selects in import)</span>
            </label>
            <select
              value={defaultOVRDivision}
              onChange={(e) => setDefaultOVRDivision(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500"
            >
              {OVR_DIVISIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>

          <button
            onClick={handleSave}
            className={`w-full py-2.5 rounded-xl font-semibold transition ${
              saved ? "bg-green-500 text-white" : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {saved ? "✓ Saved!" : "Save Changes"}
          </button>
        </div>
      </main>
    </div>
  );
}
