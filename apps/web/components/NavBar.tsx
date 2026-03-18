"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function NavBar() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();

  return (
    <nav
      className="border-b px-4 md:px-8 py-3 flex items-center justify-between"
      style={{
        borderColor: "rgba(139, 94, 60, 0.2)",
        backgroundColor: "rgba(255,255,255,0.3)",
      }}
    >
      <div className="flex items-center gap-6">
        <Link
          href="/"
          className="text-lg font-bold"
          style={{ color: "var(--color-wood-dark)" }}
        >
          Medieval Chess
        </Link>
        <div className="hidden sm:flex items-center gap-4 text-sm">
          <Link
            href="/rules"
            className="hover:underline"
            style={{ color: "var(--color-ink-light)" }}
          >
            Rules
          </Link>
          <Link
            href="/play"
            className="hover:underline"
            style={{ color: "var(--color-ink-light)" }}
          >
            Play
          </Link>
          <Link
            href="/puzzles"
            className="hover:underline"
            style={{ color: "var(--color-ink-light)" }}
          >
            Puzzles
          </Link>
        </div>
      </div>

      <div className="text-sm">
        {loading ? null : user ? (
          <div className="flex items-center gap-3">
            <span style={{ color: "var(--color-ink-light)" }}>
              {user.displayName || user.email}
            </span>
            <button
              onClick={signOut}
              className="px-3 py-1 rounded cursor-pointer transition-colors"
              style={{
                backgroundColor: "rgba(139, 94, 60, 0.15)",
                color: "var(--color-wood-dark)",
                border: "1px solid rgba(139, 94, 60, 0.3)",
              }}
            >
              Sign out
            </button>
          </div>
        ) : (
          <button
            onClick={signInWithGoogle}
            className="px-3 py-1 rounded cursor-pointer transition-colors"
            style={{
              backgroundColor: "var(--color-wood-dark)",
              color: "var(--color-parchment)",
            }}
          >
            Sign in with Google
          </button>
        )}
      </div>
    </nav>
  );
}
