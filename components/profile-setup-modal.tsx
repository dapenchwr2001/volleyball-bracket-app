"use client";

import { useState } from "react";
import { CoachProfile, ROLES, saveProfile } from "@/lib/profile";

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

interface Props {
  email: string;
  googleName: string;
  onComplete: (profile: CoachProfile) => void;
}

export default function ProfileSetupModal({ email, googleName, onComplete }: Props) {
  const [name, setName] = useState(googleName);
  const [role, setRole] = useState("Head Coach");
  const [club, setClub] = useState("");
  const [teamsCoaching, setTeamsCoaching] = useState("");
  const [defaultOVRDivision, setDefaultOVRDivision] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    const profile: CoachProfile = {
      email,
      name: name.trim() || googleName,
      role,
      club: club.trim(),
      teamsCoaching: teamsCoaching.trim(),
      defaultOVRDivision,
      setupComplete: true,
      updatedAt: new Date().toISOString(),
    };
    saveProfile(profile);
    onComplete(profile);
  };

  const handleSkip = () => {
    const profile: CoachProfile = {
      email,
      name: googleName,
      role: "",
      club: "",
      teamsCoaching: "",
      defaultOVRDivision: "",
      setupComplete: true,
      updatedAt: new Date().toISOString(),
    };
    saveProfile(profile);
    onComplete(profile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl px-6 py-5 text-white">
          <h2 className="text-xl font-bold">Welcome to Volleyball Bracketeer! 🏐</h2>
          <p className="text-blue-100 text-sm mt-1">Set up your coaching profile to get started.</p>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-4">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Role */}
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

          {/* Club */}
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

          {/* Teams */}
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

          {/* Default OVR Division */}
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
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex flex-col gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Profile"}
          </button>
          <button
            onClick={handleSkip}
            className="w-full text-sm text-gray-400 hover:text-gray-600 py-1 transition"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
