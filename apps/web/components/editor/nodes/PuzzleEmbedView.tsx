"use client";
import { useEffect, useState } from "react";
import { NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { getPuzzle } from "@/lib/puzzles";
import MiniBoard from "@/components/chess-board/MiniBoard";
import { fenToPieces } from "@/lib/editor-utils";
import type { Puzzle } from "@medieval-chess/shared/types";

export default function PuzzleEmbedView({ node }: NodeViewProps) {
  const puzzleId = node.attrs.puzzleId as string;
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!puzzleId) return;
    getPuzzle(puzzleId).then(setPuzzle).catch(console.error).finally(() => setLoading(false));
  }, [puzzleId]);

  if (loading) return <NodeViewWrapper className="my-4"><div className="rounded-lg p-4 text-sm" style={{ backgroundColor: "rgba(255,255,255,0.4)", color: "var(--color-ink-light)" }}>Loading puzzle...</div></NodeViewWrapper>;
  if (!puzzle) return <NodeViewWrapper className="my-4"><div className="rounded-lg p-4 text-sm" style={{ backgroundColor: "rgba(255,255,255,0.4)", color: "var(--color-ink-light)" }}>Puzzle not found</div></NodeViewWrapper>;

  const pieces = fenToPieces(puzzle.fen);
  const stars = "\u2605".repeat(puzzle.difficulty) + "\u2606".repeat(5 - puzzle.difficulty);

  return (
    <NodeViewWrapper className="my-4">
      <a href={`/puzzles/${puzzle.id}`} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-4 rounded-lg p-4 hover:shadow-md transition-shadow no-underline"
        style={{ backgroundColor: "rgba(255,255,255,0.5)", border: "2px solid var(--color-wood)" }} contentEditable={false}>
        <div className="flex-shrink-0"><MiniBoard pieces={pieces} highlights={[]} squareSize={24} size={8} /></div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm" style={{ color: "var(--color-wood-dark)" }}>{puzzle.title}</div>
          <div className="text-xs mt-1" style={{ color: "var(--color-ink-light)" }}>{stars} · by {puzzle.authorName}</div>
          <div className="mt-2 inline-block px-3 py-1 rounded text-xs font-medium" style={{ backgroundColor: "var(--color-gold)", color: "var(--color-ink)" }}>Try this puzzle →</div>
        </div>
      </a>
    </NodeViewWrapper>
  );
}
