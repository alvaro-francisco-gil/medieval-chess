"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listPuzzles } from "@/lib/puzzles";
import { useAuth } from "@/lib/auth-context";
import type { Puzzle } from "@medieval-chess/shared/types";

const DIFFICULTY_LABELS = ["", "Beginner", "Easy", "Medium", "Hard", "Master"];

export default function PuzzlesPage() {
  const { user } = useAuth();
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState<number | undefined>();

  useEffect(() => {
    setLoading(true);
    listPuzzles({ difficulty, maxResults: 50 })
      .then(setPuzzles)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [difficulty]);

  return (
    <main
      className="min-h-screen p-4 md:p-8"
      style={{ backgroundColor: "var(--color-parchment)" }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1
              className="text-3xl font-bold"
              style={{ color: "var(--color-wood-dark)" }}
            >
              Puzzles
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--color-ink-light)" }}>
              Solve historical chess problems and community-created challenges.
            </p>
          </div>
          {user && (
            <Link
              href="/puzzles/new"
              className="px-4 py-2 rounded text-sm font-medium transition-colors"
              style={{
                backgroundColor: "var(--color-wood-dark)",
                color: "var(--color-parchment)",
              }}
            >
              Create Puzzle
            </Link>
          )}
        </div>

        {/* Difficulty filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setDifficulty(undefined)}
            className="px-3 py-1 rounded text-sm cursor-pointer transition-colors"
            style={{
              backgroundColor: difficulty === undefined
                ? "var(--color-wood-dark)"
                : "rgba(139, 94, 60, 0.15)",
              color: difficulty === undefined
                ? "var(--color-parchment)"
                : "var(--color-wood-dark)",
              border: "1px solid rgba(139, 94, 60, 0.3)",
            }}
          >
            All
          </button>
          {[1, 2, 3, 4, 5].map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className="px-3 py-1 rounded text-sm cursor-pointer transition-colors"
              style={{
                backgroundColor: difficulty === d
                  ? "var(--color-wood-dark)"
                  : "rgba(139, 94, 60, 0.15)",
                color: difficulty === d
                  ? "var(--color-parchment)"
                  : "var(--color-wood-dark)",
                border: "1px solid rgba(139, 94, 60, 0.3)",
              }}
            >
              {DIFFICULTY_LABELS[d]}
            </button>
          ))}
        </div>

        {/* Puzzle grid */}
        {loading ? (
          <p style={{ color: "var(--color-ink-light)" }}>Loading puzzles...</p>
        ) : puzzles.length === 0 ? (
          <div
            className="rounded-lg p-8 text-center"
            style={{
              backgroundColor: "rgba(255,255,255,0.5)",
              border: "1px solid rgba(139, 94, 60, 0.2)",
            }}
          >
            <p
              className="text-lg mb-2"
              style={{ color: "var(--color-ink-light)" }}
            >
              No puzzles yet.
            </p>
            <p className="text-sm" style={{ color: "var(--color-ink-light)" }}>
              {user
                ? "Be the first to create one!"
                : "Sign in to create the first puzzle."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {puzzles.map((puzzle) => (
              <Link
                key={puzzle.id}
                href={`/puzzles/${puzzle.id}`}
                className="rounded-lg p-4 hover:shadow-md transition-shadow"
                style={{
                  backgroundColor: "rgba(255,255,255,0.5)",
                  border: "1px solid rgba(139, 94, 60, 0.2)",
                }}
              >
                <h3
                  className="font-semibold mb-1"
                  style={{ color: "var(--color-wood-dark)" }}
                >
                  {puzzle.title}
                </h3>
                <p
                  className="text-sm mb-2 line-clamp-2"
                  style={{ color: "var(--color-ink-light)" }}
                >
                  {puzzle.description}
                </p>
                <div className="flex items-center justify-between text-xs" style={{ color: "var(--color-ink-light)" }}>
                  <span>{DIFFICULTY_LABELS[puzzle.difficulty]}</span>
                  <span>by {puzzle.authorName}</span>
                </div>
                {puzzle.collection && (
                  <span
                    className="inline-block mt-2 px-2 py-0.5 rounded text-xs"
                    style={{
                      backgroundColor: "rgba(201, 168, 76, 0.2)",
                      color: "var(--color-wood-dark)",
                    }}
                  >
                    {puzzle.collection}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
