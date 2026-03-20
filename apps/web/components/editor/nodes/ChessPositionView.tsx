"use client";
import { NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import MiniBoard from "@/components/chess-board/MiniBoard";
import { fenToPieces } from "@/lib/editor-utils";

export default function ChessPositionView({ node, editor }: NodeViewProps) {
  const fen = node.attrs.fen as string;
  const pieces = fenToPieces(fen);
  return (
    <NodeViewWrapper className="my-4">
      <div className="inline-flex flex-col items-center p-4 rounded-lg"
        style={{ backgroundColor: "rgba(255,255,255,0.5)", border: "2px solid var(--color-gold)" }}>
        <MiniBoard pieces={pieces} highlights={[]} squareSize={40} />
        {editor.isEditable && (
          <div className="mt-2 text-xs" style={{ color: "var(--color-ink-light)" }}>
            {fen.split(" ")[0].substring(0, 30)}...
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}
