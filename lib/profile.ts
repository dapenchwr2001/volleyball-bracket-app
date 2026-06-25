export interface CoachProfile {
  email: string;
  name: string;
  role: string;
  club: string;
  teamsCoaching: string;
  defaultOVRDivision: string;
  setupComplete: boolean;
  updatedAt: string;
}

export const ROLES = [
  "Head Coach",
  "Assistant Coach",
  "Club Director",
  "Tournament Director",
  "Other",
];

export function profileKey(email: string) {
  return `volleyball_profile_${email}`;
}

export function loadProfile(email: string): CoachProfile | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(profileKey(email));
  if (!raw) return null;
  try { return JSON.parse(raw) as CoachProfile; } catch { return null; }
}

export function saveProfile(profile: CoachProfile) {
  localStorage.setItem(profileKey(profile.email), JSON.stringify({ ...profile, updatedAt: new Date().toISOString() }));
}
