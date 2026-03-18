"use client";

import { useState, useCallback } from "react";
import { MedievalChess } from "@medieval-chess/engine";
import type { MedievalMove } from "@medieval-chess/engine";
import { ChessBoard } from "@/components/chess-board";
import MoveList from "@/components/MoveList";
import StoryPanel from "@/components/StoryPanel";

export default function PlayPage() {
  const [game] = useState(() => new MedievalChess());
  const [moves, setMoves] = useState<string[]>([]);
  const [, setMoveCount] = useState(0);

  const handleMove = useCallback((move: MedievalMove) => {
    setMoves((prev) => [...prev, move.san]);
    setMoveCount((c) => c + 1);
  }, []);

  const handleReset = useCallback(() => {
    game.reset();
    setMoves([]);
    setMoveCount((c) => c + 1);
  }, [game]);

  const handleUndo = useCallback(() => {
    const undone = game.undo();
    if (undone) {
      setMoves((prev) => prev.slice(0, -1));
      setMoveCount((c) => c + 1);
    }
  }, [game]);

  return (
    <main
      className="min-h-screen p-4 md:p-8"
      style={{ backgroundColor: "var(--color-parchment)" }}
    >
      <div className="max-w-6xl mx-auto mb-6">
        <h1
          className="text-3xl font-bold"
          style={{ color: "var(--color-wood-dark)" }}
        >
          Medieval Chess
        </h1>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 items-start">
        <div className="order-2 lg:order-1 min-w-0">
          <StoryPanel
            title="Free Play"
            story="Set up positions and explore medieval chess variants. The queen starts as a Grace Jump piece — it can jump 2 squares diagonally or orthogonally, or capture 1 square diagonally. After its first move, it becomes a regular queen (1 square diagonal only). Bishops jump 2 squares diagonally. Pawns can only advance 2 squares if no capture has occurred."
            turn={game.turn()}
            isGameOver={game.isGameOver()}
            isCheckmate={game.isCheckmate()}
          />

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleUndo}
              className="px-4 py-2 rounded text-sm font-medium cursor-pointer transition-colors"
              style={{
                backgroundColor: "rgba(139, 94, 60, 0.15)",
                color: "var(--color-wood-dark)",
                border: "1px solid rgba(139, 94, 60, 0.3)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "rgba(139, 94, 60, 0.25)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "rgba(139, 94, 60, 0.15)")
              }
            >
              Undo
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded text-sm font-medium cursor-pointer transition-colors"
              style={{
                backgroundColor: "rgba(139, 94, 60, 0.15)",
                color: "var(--color-wood-dark)",
                border: "1px solid rgba(139, 94, 60, 0.3)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "rgba(139, 94, 60, 0.25)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "rgba(139, 94, 60, 0.15)")
              }
            >
              Reset
            </button>
          </div>
        </div>

        <div className="order-1 lg:order-2 flex justify-center">
          <ChessBoard game={game} onMove={handleMove} />
        </div>

        <div className="order-3 min-w-0">
          <MoveList moves={moves} />
        </div>
      </div>
    </main>
  );
}
