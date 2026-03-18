"use client";

import Image from "next/image";

interface MiniBoardPiece {
  type: string;
  color: "w" | "b";
  row: number;
  col: number;
}

interface Highlight {
  row: number;
  col: number;
  type: "move" | "capture" | "origin";
}

interface MiniBoardProps {
  /** Pieces to show on the board */
  pieces: MiniBoardPiece[];
  /** Squares to highlight */
  highlights: Highlight[];
  /** Board size (number of squares shown, default 8) */
  size?: number;
  /** Square pixel size */
  squareSize?: number;
}

const PIECE_MAP: Record<string, string> = {
  wk: "/pieces/wK.png",
  wq: "/pieces/wQ.png",
  wg: "/pieces/wQ.png",
  wr: "/pieces/wR.png",
  wb: "/pieces/wB.png",
  wn: "/pieces/wN.png",
  wp: "/pieces/wP.png",
  bk: "/pieces/bK.png",
  bq: "/pieces/bQ.png",
  bg: "/pieces/bQ.png",
  br: "/pieces/bR.png",
  bb: "/pieces/bB.png",
  bn: "/pieces/bN.png",
  bp: "/pieces/bP.png",
};

const HIGHLIGHT_COLORS = {
  move: "rgba(201, 168, 76, 0.5)",
  capture: "rgba(180, 60, 60, 0.45)",
  origin: "rgba(201, 168, 76, 0.6)",
};

export default function MiniBoard({
  pieces,
  highlights,
  size = 8,
  squareSize = 52,
}: MiniBoardProps) {
  const pieceMap = new Map<string, MiniBoardPiece>();
  for (const p of pieces) {
    pieceMap.set(`${p.row},${p.col}`, p);
  }

  const highlightMap = new Map<string, Highlight>();
  for (const h of highlights) {
    highlightMap.set(`${h.row},${h.col}`, h);
  }

  const pieceImgSize = Math.floor(squareSize * 0.82);

  return (
    <div
      className="grid border-2 rounded"
      style={{
        gridTemplateColumns: `repeat(${size}, ${squareSize}px)`,
        gridTemplateRows: `repeat(${size}, ${squareSize}px)`,
        borderColor: "var(--color-wood-dark)",
      }}
    >
      {Array.from({ length: size * size }, (_, i) => {
        const row = Math.floor(i / size);
        const col = i % size;
        const isLight = (row + col) % 2 === 0;
        const piece = pieceMap.get(`${row},${col}`);
        const highlight = highlightMap.get(`${row},${col}`);
        const bgImage = isLight
          ? "/board/square-light.png"
          : "/board/square-dark.png";

        return (
          <div
            key={`${row}-${col}`}
            className="relative"
            style={{
              width: squareSize,
              height: squareSize,
              backgroundImage: `url(${bgImage})`,
              backgroundSize: "cover",
            }}
          >
            {highlight && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ backgroundColor: HIGHLIGHT_COLORS[highlight.type] }}
              />
            )}
            {highlight && highlight.type === "move" && !piece && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className="rounded-full"
                  style={{
                    width: squareSize * 0.28,
                    height: squareSize * 0.28,
                    backgroundColor: "rgba(201, 168, 76, 0.7)",
                  }}
                />
              </div>
            )}
            {highlight && highlight.type === "capture" && (
              <div
                className="absolute inset-0 pointer-events-none rounded-full"
                style={{
                  border: `${squareSize * 0.08}px solid rgba(180, 60, 60, 0.6)`,
                  margin: squareSize * 0.08,
                }}
              />
            )}
            {piece && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Image
                  src={PIECE_MAP[`${piece.color}${piece.type}`] || ""}
                  alt={`${piece.color} ${piece.type}`}
                  width={pieceImgSize}
                  height={pieceImgSize}
                  className="pointer-events-none select-none"
                  draggable={false}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
