"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("rules");
  return (
    <div className="flex gap-4 flex-wrap text-xs" style={{ color: "var(--color-ink-light)" }}>
      <div className="flex items-center gap-1.5">
        <div
          className="w-4 h-4 rounded"
          style={{ backgroundColor: "rgba(201, 168, 76, 0.6)" }}
        />
        <span>{t("legend.piecePosition")}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-4 h-4 rounded flex items-center justify-center" style={{ backgroundColor: "rgba(201, 168, 76, 0.5)" }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "rgba(201, 168, 76, 0.7)" }} />
        </div>
        <span>{t("legend.canMove")}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div
          className="w-4 h-4 rounded"
          style={{ backgroundColor: "rgba(180, 60, 60, 0.45)" }}
        />
        <span>{t("legend.canCapture")}</span>
      </div>
    </div>
  );
}

export default function RulesPage() {
  const t = useTranslations("rules");
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
            {t("backToHome")}
          </Link>
          <h1
            className="text-4xl font-bold mb-2"
            style={{ color: "var(--color-wood-dark)" }}
          >
            {t("title")}
          </h1>
          <p
            className="text-lg mb-4"
            style={{ color: "var(--color-ink-light)" }}
          >
            {t("intro")}
          </p>
          <Legend />
        </div>

        <div className="space-y-8">
          {/* Queen Grace Jump */}
          <RuleSection
            title={t("queen.title")}
            description={t("queen.description")}
          >
            <div>
              <p className="text-xs mb-2 font-medium" style={{ color: "var(--color-wood-dark)" }}>
                {t("queen.firstMoveLabel")}
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
                {t("queen.firstMoveCaption")}
              </p>
            </div>
            <div>
              <p className="text-xs mb-2 font-medium" style={{ color: "var(--color-wood-dark)" }}>
                {t("queen.afterMoveLabel")}
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
                {t("queen.afterMoveCaption")}
              </p>
            </div>
          </RuleSection>

          {/* Bishop (Elephant) */}
          <RuleSection
            title={t("bishop.title")}
            description={t("bishop.description")}
          >
            <div>
              <p className="text-xs mb-2 font-medium" style={{ color: "var(--color-wood-dark)" }}>
                {t("bishop.movementLabel")}
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
                {t("bishop.movementCaption")}
              </p>
            </div>
          </RuleSection>

          {/* Rook */}
          <RuleSection
            title={t("rook.title")}
            description={t("rook.description")}
          >
            <div>
              <p className="text-xs mb-2 font-medium" style={{ color: "var(--color-wood-dark)" }}>
                {t("rook.movementLabel")}
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
                {t("rook.movementCaption")}
              </p>
            </div>
          </RuleSection>

          {/* Knight */}
          <RuleSection
            title={t("knight.title")}
            description={t("knight.description")}
          >
            <div>
              <p className="text-xs mb-2 font-medium" style={{ color: "var(--color-wood-dark)" }}>
                {t("knight.movementLabel")}
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
            title={t("pawn.title")}
            description={t("pawn.description")}
            note={t("pawn.note")}
          >
            <div>
              <p className="text-xs mb-2 font-medium" style={{ color: "var(--color-wood-dark)" }}>
                {t("pawn.beforeCaptureLabel")}
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
                {t("pawn.afterCaptureLabel")}
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
            title={t("king.title")}
            description={t("king.description")}
          >
            <div>
              <p className="text-xs mb-2 font-medium" style={{ color: "var(--color-wood-dark)" }}>
                {t("king.movementLabel")}
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
              {t("summary.title")}
            </h2>
            <ul
              className="space-y-2 text-sm"
              style={{ color: "var(--color-ink)" }}
            >
              <li>{t("summary.queen")}</li>
              <li>{t("summary.bishop")}</li>
              <li>{t("summary.pawns")}</li>
              <li>{t("summary.others")}</li>
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
                {t("summary.tryItOut")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
