"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();
      setSession(currentSession);
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const navItems = session
    ? [
    { href: "/", label: "Home" },
    { href: "/history", label: "History" },
      ]
    : [{ href: "/login", label: "Login" }];

  return (
    <header className="sticky top-2 z-20 mt-2">
      <div className="glass-card flex items-center justify-between rounded-xl px-3 py-2.5 sm:px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-white">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <rect x="9" y="2.5" width="6" height="12" rx="3" />
              <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0" />
              <path d="M12 18v3.5" />
              <path d="M9 21.5h6" />
            </svg>
          </span>
          <div>
            <p className="text-xs text-slate-500">Speech Workspace</p>
            <p className="text-sm font-semibold text-slate-900">VoiceScript AI</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 sm:flex">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-teal-700 text-white"
                    : "text-slate-600 hover:bg-teal-50 hover:text-teal-800"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {session ? (
            <button
              onClick={handleSignOut}
              className="btn-muted hidden rounded-lg px-3 py-1.5 text-xs font-medium sm:inline-flex"
            >
              Sign Out
            </button>
          ) : null}
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-xs font-semibold text-teal-800">
            {session?.user?.email?.[0]?.toUpperCase() || "VS"}
          </div>
        </div>
      </div>
    </header>
  );
}
