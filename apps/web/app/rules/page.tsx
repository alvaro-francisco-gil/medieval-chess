"use client";

import Link from "next/link";
import MiniBoard from "@/components/chess-board/MiniBoard";

interface RuleSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
  note?: string;
}

function RuleSection({ title, description, children, note }: RuleSectionProps) {
  return (
    <div
      className="rounded-lg p-6"
      style={{
        backgroundColor: "rgba(255,255,255,0.5)",
        border: "1px solid rgba(139, 94, 60, 0.2)",
      }}
    >
      <h2
        className="text-xl font-bold mb-2"
        style={{ color: "var(--color-wood-dark)" }}
      >
        {title}
      </h2>
      <p
        className="text-sm mb-4 leading-relaxed"
        style={{ color: "var(--color-ink-light)" }}
      >
        {description}
      </p>
      <div className="flex flex-wrap gap-6 items-start">{children}</div>
      {note && (
        <p
          className="text-xs mt-4 italic"
          style={{ color: "var(--color-ink-light)" }}
        >
          {note}
        </p>
      )}
    </div>
  );
}

function Legend() {
  return (
    <div className="flex gap-4 flex-wrap text-xs" style={{ color: "var(--color-ink-light)" }}>
      <div className="flex items-center gap-1.5">
        <div
          className="w-4 h-4 rounded"
          style={{ backgroundColor: "rgba(201, 168, 76, 0.6)" }}
        />
        <span>Piece position</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-4 h-4 rounded flex items-center justify-center" style={{ backgroundColor: "rgba(201, 168, 76, 0.5)" }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "rgba(201, 168, 76, 0.7)" }} />
        </div>
        <span>Can move here</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div
          className="w-4 h-4 rounded"
          style={{ backgroundColor: "rgba(180, 60, 60, 0.45)" }}
        />
        <span>Can capture here</span>
      </div>
    </div>
  );
}

export default function RulesPage() {
  return (
    <main
      className="min-h-screen p-4 md:p-8"
      style={{ backgroundColor: "var(--color-parchment)" }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm mb-4 inline-block"
            style={{ color: "var(--color-wood)" }}
          >
            &larr; Back to home
          </Link>
          <h1
            className="text-4xl font-bold mb-2"
            style={{ color: "var(--color-wood-dark)" }}
          >
            Rules of Medieval Chess
          </h1>
          <p
            className="text-lg mb-4"
            style={{ color: "var(--color-ink-light)" }}
          >
            Medieval chess differs from modern chess in several key ways.
            The queen and bishop move very differently, and pawn movement
            changes as the game progresses.
          </p>
          <Legend />
        </div>

        <div className="space-y-8">
          {/* Queen Grace Jump */}
          <RuleSection
            title="The Queen (Alferza) — Grace Jump"
            description="At the start of the game, queens are 'Grace Jump' pieces. On their very first move, they have special jumping abilities. After moving once, they become regular queens with limited movement."
          >
            <div>
              <p className="text-xs mb-2 font-medium" style={{ color: "var(--color-wood-dark)" }}>
                First move — Grace Jump options:
              </p>
              <MiniBoard
                size={7}
                squareSize={48}
                pieces={[{ type: "g", color: "w", row: 3, col: 3 }]}
                highlights={[
                  // Origin
                  { row: 3, col: 3, type: "origin" },
                  // 1-square diagonal (can capture)
                  { row: 2, col: 2, type: "capture" },
                  { row: 2, col: 4, type: "capture" },
                  { row: 4, col: 2, type: "capture" },
                  { row: 4, col: 4, type: "capture" },
                  // 2-square diagonal jump (move only)
                  { row: 1, col: 1, type: "move" },
                  { row: 1, col: 5, type: "move" },
                  { row: 5, col: 1, type: "move" },
                  { row: 5, col: 5, type: "move" },
                  // 2-square orthogonal jump (move only)
                  { row: 1, col: 3, type: "move" },
                  { row: 5, col: 3, type: "move" },
                  { row: 3, col: 1, type: "move" },
                  { row: 3, col: 5, type: "move" },
                ]}
              />
              <p className="text-xs mt-1.5" style={{ color: "var(--color-ink-light)" }}>
                Jumps 2 squares (no capture), or 1 diagonal (capture OK)
              </p>
            </div>
            <div>
              <p className="text-xs mb-2 font-medium" style={{ color: "var(--color-wood-dark)" }}>
                After first move — Regular queen:
              </p>
              <MiniBoard
                size={7}
                squareSize={48}
                pieces={[{ type: "q", color: "w", row: 3, col: 3 }]}
                highlights={[
                  { row: 3, col: 3, type: "origin" },
                  // Only 1-square diagonal
                  { row: 2, col: 2, type: "move" },
                  { row: 2, col: 4, type: "move" },
                  { row: 4, col: 2, type: "move" },
                  { row: 4, col: 4, type: "move" },
                ]}
              />
              <p className="text-xs mt-1.5" style={{ color: "var(--color-ink-light)" }}>
                Only moves 1 square diagonally
              </p>
            </div>
          </RuleSection>

          {/* Bishop (Elephant) */}
          <RuleSection
            title="The Bishop (Elephant)"
            description="Unlike modern chess where bishops slide along diagonals, the medieval bishop jumps exactly 2 squares diagonally. It leaps over any piece in between — nothing can block its path."
          >
            <div>
              <p className="text-xs mb-2 font-medium" style={{ color: "var(--color-wood-dark)" }}>
                Bishop movement — 2-square diagonal jump:
              </p>
              <MiniBoard
                size={7}
                squareSize={48}
                pieces={[
                  { type: "b", color: "w", row: 3, col: 3 },
                  // Add a piece to show it jumps over
                  { type: "p", color: "b", row: 2, col: 2 },
                ]}
                highlights={[
                  { row: 3, col: 3, type: "origin" },
                  { row: 1, col: 1, type: "move" },
                  { row: 1, col: 5, type: "move" },
                  { row: 5, col: 1, type: "move" },
                  { row: 5, col: 5, type: "move" },
                  { row: 2, col: 2, type: "capture" },
                ]}
              />
              <p className="text-xs mt-1.5" style={{ color: "var(--color-ink-light)" }}>
                Jumps over pieces — the pawn doesn&apos;t block the top-left move
              </p>
            </div>
          </RuleSection>

          {/* Rook */}
          <RuleSection
            title="The Rook"
            description="The rook moves exactly as in modern chess — it slides any number of squares along a rank or file, and cannot jump over pieces."
          >
            <div>
              <p className="text-xs mb-2 font-medium" style={{ color: "var(--color-wood-dark)" }}>
                Rook movement — slides along ranks and files:
              </p>
              <MiniBoard
                size={7}
                squareSize={48}
                pieces={[
                  { type: "r", color: "w", row: 3, col: 3 },
                  { type: "p", color: "b", row: 1, col: 3 },
                ]}
                highlights={[
                  { row: 3, col: 3, type: "origin" },
                  // Up (blocked by pawn at row 1)
                  { row: 2, col: 3, type: "move" },
                  { row: 1, col: 3, type: "capture" },
                  // Down
                  { row: 4, col: 3, type: "move" },
                  { row: 5, col: 3, type: "move" },
                  { row: 6, col: 3, type: "move" },
                  // Left
                  { row: 3, col: 2, type: "move" },
                  { row: 3, col: 1, type: "move" },
                  { row: 3, col: 0, type: "move" },
                  // Right
                  { row: 3, col: 4, type: "move" },
                  { row: 3, col: 5, type: "move" },
                  { row: 3, col: 6, type: "move" },
                ]}
              />
              <p className="text-xs mt-1.5" style={{ color: "var(--color-ink-light)" }}>
                Slides until blocked — can capture the pawn
              </p>
            </div>
          </RuleSection>

          {/* Knight */}
          <RuleSection
            title="The Knight"
            description="The knight moves exactly as in modern chess — in an L-shape (2+1 squares), and can jump over other pieces."
          >
            <div>
              <p className="text-xs mb-2 font-medium" style={{ color: "var(--color-wood-dark)" }}>
                Knight movement — L-shape jumps:
              </p>
              <MiniBoard
                size={7}
                squareSize={48}
                pieces={[{ type: "n", color: "w", row: 3, col: 3 }]}
                highlights={[
                  { row: 3, col: 3, type: "origin" },
                  { row: 1, col: 2, type: "move" },
                  { row: 1, col: 4, type: "move" },
                  { row: 2, col: 1, type: "move" },
                  { row: 2, col: 5, type: "move" },
                  { row: 4, col: 1, type: "move" },
                  { row: 4, col: 5, type: "move" },
                  { row: 5, col: 2, type: "move" },
                  { row: 5, col: 4, type: "move" },
                ]}
              />
            </div>
          </RuleSection>

          {/* Pawn */}
          <RuleSection
            title="The Pawn"
            description="Pawns move forward one square, or capture one square diagonally — just like modern chess. However, the double-move on the first turn is only available if no capture has occurred in the game yet."
            note="Once any piece captures another (by either side), all pawns lose the ability to move two squares. Pawns promote to a Grace Jump Queen."
          >
            <div>
              <p className="text-xs mb-2 font-medium" style={{ color: "var(--color-wood-dark)" }}>
                Before any capture — can move 1 or 2 squares:
              </p>
              <MiniBoard
                size={5}
                squareSize={48}
                pieces={[
                  { type: "p", color: "w", row: 3, col: 2 },
                  { type: "n", color: "b", row: 2, col: 3 },
                ]}
                highlights={[
                  { row: 3, col: 2, type: "origin" },
                  { row: 2, col: 2, type: "move" },
                  { row: 1, col: 2, type: "move" },
                  { row: 2, col: 3, type: "capture" },
                ]}
              />
            </div>
            <div>
              <p className="text-xs mb-2 font-medium" style={{ color: "var(--color-wood-dark)" }}>
                After a capture happened — only 1 square:
              </p>
              <MiniBoard
                size={5}
                squareSize={48}
                pieces={[{ type: "p", color: "w", row: 3, col: 2 }]}
                highlights={[
                  { row: 3, col: 2, type: "origin" },
                  { row: 2, col: 2, type: "move" },
                ]}
              />
            </div>
          </RuleSection>

          {/* King */}
          <RuleSection
            title="The King"
            description="The king moves exactly as in modern chess — one square in any direction. Castling is available under the standard conditions."
          >
            <div>
              <p className="text-xs mb-2 font-medium" style={{ color: "var(--color-wood-dark)" }}>
                King movement — 1 square in any direction:
              </p>
              <MiniBoard
                size={5}
                squareSize={48}
                pieces={[{ type: "k", color: "w", row: 2, col: 2 }]}
                highlights={[
                  { row: 2, col: 2, type: "origin" },
                  { row: 1, col: 1, type: "move" },
                  { row: 1, col: 2, type: "move" },
                  { row: 1, col: 3, type: "move" },
                  { row: 2, col: 1, type: "move" },
                  { row: 2, col: 3, type: "move" },
                  { row: 3, col: 1, type: "move" },
                  { row: 3, col: 2, type: "move" },
                  { row: 3, col: 3, type: "move" },
                ]}
              />
            </div>
          </RuleSection>

          {/* Summary */}
          <div
            className="rounded-lg p-6"
            style={{
              backgroundColor: "rgba(201, 168, 76, 0.15)",
              border: "1px solid rgba(201, 168, 76, 0.3)",
            }}
          >
            <h2
              className="text-xl font-bold mb-3"
              style={{ color: "var(--color-wood-dark)" }}
            >
              Key Differences from Modern Chess
            </h2>
            <ul
              className="space-y-2 text-sm"
              style={{ color: "var(--color-ink)" }}
            >
              <li>
                <strong>Queen</strong> — Starts with special Grace Jump powers (2-square jumps). After first move, only moves 1 square diagonally. Much weaker than the modern queen.
              </li>
              <li>
                <strong>Bishop</strong> — Jumps exactly 2 squares diagonally (like a knight but diagonal). Can leap over pieces. Does not slide.
              </li>
              <li>
                <strong>Pawns</strong> — Double-move is only available before any capture occurs in the game. Promote to Grace Jump Queen.
              </li>
              <li>
                <strong>Rook, Knight, King</strong> — Move exactly as in modern chess.
              </li>
            </ul>
            <div className="mt-4">
              <Link
                href="/play"
                className="inline-block px-6 py-2 rounded font-medium text-sm transition-colors"
                style={{
                  backgroundColor: "var(--color-wood-dark)",
                  color: "var(--color-parchment)",
                }}
              >
                Try it out &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
