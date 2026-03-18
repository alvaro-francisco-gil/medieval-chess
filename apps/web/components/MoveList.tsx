"use client";

interface MoveListProps {
  moves: string[];
}

export default function MoveList({ moves }: MoveListProps) {
  // Group moves into pairs (white, black)
  const pairs: { number: number; white: string; black?: string }[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push({
      number: Math.floor(i / 2) + 1,
      white: moves[i],
      black: moves[i + 1],
    });
  }

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
        Moves
      </h3>
      {pairs.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--color-ink-light)" }}>
          No moves yet. Click a piece to start.
        </p>
      ) : (
        <div className="space-y-1">
          {pairs.map((pair) => (
            <div key={pair.number} className="flex text-sm font-mono">
              <span
                className="w-8 text-right mr-2 shrink-0"
                style={{ color: "var(--color-ink-light)" }}
              >
                {pair.number}.
              </span>
              <span
                className="w-16"
                style={{ color: "var(--color-ink)" }}
              >
                {pair.white}
              </span>
              <span style={{ color: "var(--color-ink)" }}>
                {pair.black ?? ""}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
