"use client";

interface StoryPanelProps {
  title?: string;
  story?: string;
  turn: "w" | "b";
  isGameOver: boolean;
  isCheckmate: boolean;
}

export default function StoryPanel({
  title,
  story,
  turn,
  isGameOver,
  isCheckmate,
}: StoryPanelProps) {
  return (
    <div
      className="rounded-lg p-4 overflow-y-auto"
      style={{
        backgroundColor: "rgba(255,255,255,0.5)",
        border: "1px solid rgba(139, 94, 60, 0.2)",
        maxHeight: "100%",
      }}
    >
      <h3
        className="text-sm font-semibold mb-3 uppercase tracking-wide"
        style={{ color: "var(--color-wood-dark)" }}
      >
        {title ?? "Medieval Chess"}
      </h3>

      {story && (
        <p
          className="text-sm mb-4 leading-relaxed italic"
          style={{ color: "var(--color-ink-light)" }}
        >
          {story}
        </p>
      )}

      <div
        className="text-sm font-medium px-3 py-2 rounded"
        style={{
          backgroundColor: isGameOver
            ? "rgba(201, 168, 76, 0.2)"
            : "rgba(139, 94, 60, 0.1)",
          color: "var(--color-wood-dark)",
        }}
      >
        {isCheckmate
          ? `Checkmate! ${turn === "w" ? "Black" : "White"} wins.`
          : isGameOver
            ? "Game over — draw."
            : `${turn === "w" ? "White" : "Black"} to move`}
      </div>
    </div>
  );
}
