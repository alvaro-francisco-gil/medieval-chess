"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useTranslations } from "next-intl";
import { MedievalChess } from "@medieval-chess/engine";
import type { MedievalMove } from "@medieval-chess/engine";
import { ChessBoard } from "@/components/chess-board";
import { getPuzzle } from "@/lib/puzzles";
import type { Puzzle } from "@medieval-chess/shared/types";

type PuzzleStatus = "playing" | "correct" | "wrong" | "loading";

export default function PuzzlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations("puzzles.detail");
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [game, setGame] = useState<MedievalChess | null>(null);
  const [status, setStatus] = useState<PuzzleStatus>("loading");
  const [moveIndex, setMoveIndex] = useState(0);
  const [message, setMessage] = useState("");
  const [, setMoveCount] = useState(0);

  useEffect(() => {
    getPuzzle(id).then((p) => {
      if (p) {
        setPuzzle(p);
        const g = new MedievalChess({ fen: p.fen });
        setGame(g);
        setStatus("playing");
        setMessage(t(g.turn() === "w" ? "promptWhite" : "promptBlack"));
      }
    });
  }, [id, t]);

  const handleMove = useCallback(
    (move: MedievalMove) => {
      if (!puzzle || !game || status !== "playing") return;

      const expectedSan = puzzle.solution[moveIndex];

      if (move.san === expectedSan) {
        const nextIndex = moveIndex + 1;

        if (nextIndex >= puzzle.solution.length) {
          // Puzzle solved!
          setStatus("correct");
          setMessage(t("solved"));
          setMoveCount((c) => c + 1);
          return;
        }

        // Opponent's response (auto-play)
        const opponentMove = puzzle.solution[nextIndex];
        const result = game.move(opponentMove);
        if (result) {
          setMoveIndex(nextIndex + 1);
          setMessage(t("correct"));
          setMoveCount((c) => c + 1);
        }
      } else {
        // Wrong move — undo it
        game.undo();
        setStatus("wrong");
        setMessage(t("incorrect"));
        setMoveCount((c) => c + 1);
      }
    },
    [puzzle, game, status, moveIndex, t]
  );

  const handleRetry = useCallback(() => {
    if (!puzzle) return;
    const g = new MedievalChess({ fen: puzzle.fen });
    setGame(g);
    setMoveIndex(0);
    setStatus("playing");
    setMessage(t(g.turn() === "w" ? "promptWhite" : "promptBlack"));
    setMoveCount((c) => c + 1);
  }, [puzzle, t]);

  if (!puzzle || !game) {
    return (
      <main
        className="min-h-screen p-8 flex items-center justify-center"
        style={{ backgroundColor: "var(--color-parchment)" }}
      >
        <p style={{ color: "var(--color-ink-light)" }}>
          {status === "loading" ? t("loading") : t("notFound")}
        </p>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen p-4 md:p-8"
      style={{ backgroundColor: "var(--color-parchment)" }}
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 items-start">
        {/* Story / info panel */}
        <div className="order-2 lg:order-1 min-w-0">
          <div
            className="rounded-lg p-4"
            style={{
              backgroundColor: "rgba(255,255,255,0.5)",
              border: "1px solid rgba(139, 94, 60, 0.2)",
            }}
          >
            <h2
              className="text-xl font-bold mb-2"
              style={{ color: "var(--color-wood-dark)" }}
            >
              {puzzle.title}
            </h2>
            <p
              className="text-sm mb-3"
              style={{ color: "var(--color-ink-light)" }}
            >
              {puzzle.description}
            </p>
            {puzzle.story && (
              <p
                className="text-sm italic mb-3 leading-relaxed"
                style={{ color: "var(--color-ink-light)" }}
              >
                {puzzle.story}
              </p>
            )}
            <div className="flex items-center gap-2 text-xs" style={{ color: "var(--color-ink-light)" }}>
              <span>{t("difficultyLabel", { level: puzzle.difficulty })}</span>
              <span>&middot;</span>
              <span>{t("byAuthor", { author: puzzle.authorName })}</span>
            </div>
          </div>

          {/* Status message */}
          <div
            className="rounded-lg p-4 mt-4 text-sm font-medium"
            style={{
              backgroundColor:
                status === "correct"
                  ? "rgba(76, 175, 80, 0.15)"
                  : status === "wrong"
                    ? "rgba(244, 67, 54, 0.15)"
                    : "rgba(139, 94, 60, 0.1)",
              color:
                status === "correct"
                  ? "#2e7d32"
                  : status === "wrong"
                    ? "#c62828"
                    : "var(--color-wood-dark)",
              border: `1px solid ${
                status === "correct"
                  ? "rgba(76, 175, 80, 0.3)"
                  : status === "wrong"
                    ? "rgba(244, 67, 54, 0.3)"
                    : "rgba(139, 94, 60, 0.2)"
              }`,
            }}
          >
            {message}
          </div>

          {(status === "wrong" || status === "correct") && (
            <button
              onClick={handleRetry}
              className="mt-3 px-4 py-2 rounded text-sm font-medium cursor-pointer transition-colors"
              style={{
                backgroundColor: "rgba(139, 94, 60, 0.15)",
                color: "var(--color-wood-dark)",
                border: "1px solid rgba(139, 94, 60, 0.3)",
              }}
            >
              {status === "correct" ? t("playAgain") : t("retry")}
            </button>
          )}
        </div>

        {/* Chess board */}
        <div className="order-1 lg:order-2 flex justify-center">
          <ChessBoard
            game={game}
            onMove={handleMove}
            interactive={status === "playing"}
          />
        </div>

        {/* Solution progress */}
        <div className="order-3 min-w-0">
          <div
            className="rounded-lg p-4"
            style={{
              backgroundColor: "rgba(255,255,255,0.5)",
              border: "1px solid rgba(139, 94, 60, 0.2)",
            }}
          >
            <h3
              className="text-sm font-semibold mb-3 uppercase tracking-wide"
              style={{ color: "var(--color-wood-dark)" }}
            >
              {t("progress")}
            </h3>
            <div className="flex gap-2 flex-wrap">
              {puzzle.solution.map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded flex items-center justify-center text-xs font-mono"
                  style={{
                    backgroundColor:
                      i < moveIndex
                        ? "rgba(76, 175, 80, 0.2)"
                        : "rgba(139, 94, 60, 0.1)",
                    color:
                      i < moveIndex
                        ? "#2e7d32"
                        : "var(--color-ink-light)",
                    border: `1px solid ${
                      i < moveIndex
                        ? "rgba(76, 175, 80, 0.3)"
                        : "rgba(139, 94, 60, 0.2)"
                    }`,
                  }}
                >
                  {i < moveIndex ? puzzle.solution[i] : "?"}
                </div>
              ))}
            </div>
            <p
              className="text-xs mt-3"
              style={{ color: "var(--color-ink-light)" }}
            >
              {t("movesFound", { current: moveIndex, total: puzzle.solution.length })}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
