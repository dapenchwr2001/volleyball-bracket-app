"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { loadProfile, CoachProfile } from "@/lib/profile";

interface AuthButtonProps {
  profile?: CoachProfile | null;
}

export default function AuthButton({ profile }: AuthButtonProps) {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (status === "loading") {
    return <div className="h-9 w-24 bg-gray-100 animate-pulse rounded-lg" />;
  }

  if (session?.user) {
    const displayName = profile?.name || session.user.name || "";
    const club = profile?.club || "";
    const role = profile?.role || "";

    return (
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 hover:opacity-80 transition"
          aria-label="Profile menu"
        >
          {session.user.image ? (
            <Image
              src={session.user.image}
              alt=""
              width={36}
              height={36}
              className="rounded-full border-2 border-white shadow"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-gray-900 leading-tight">{displayName}</p>
            {club && <p className="text-xs text-gray-500 leading-tight truncate max-w-[120px]">{club}</p>}
          </div>
          <svg className="w-3.5 h-3.5 text-gray-400 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
            {/* Profile summary */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <p className="font-semibold text-gray-900 text-sm truncate">{displayName}</p>
              {role && <p className="text-xs text-gray-500">{role}{club ? ` · ${club}` : ""}</p>}
              <p className="text-xs text-gray-400 truncate mt-0.5">{session.user.email}</p>
            </div>

            {/* Links */}
            <div className="py-1">
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                <span>✏️</span> Edit Profile
              </Link>
              <Link
                href="/history"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                <span>📋</span> My History
              </Link>
            </div>

            <div className="border-t border-gray-100 py-1">
              <button
                onClick={() => { setOpen(false); signOut(); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition text-left"
              >
                <span>🚪</span> Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("google")}
      className="flex items-center gap-2 bg-white border border-gray-200 shadow-sm px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
    >
      <GoogleIcon />
      <span className="hidden sm:inline">Sign in with Google</span>
      <span className="sm:hidden">Sign in</span>
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}
