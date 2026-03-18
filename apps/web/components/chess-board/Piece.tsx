"use client";

import Image from "next/image";

const PIECE_MAP: Record<string, string> = {
  wk: "/pieces/wK.png",
  wq: "/pieces/wQ.png",
  wg: "/pieces/wQ.png", // Grace jump queen uses same image as queen
  wr: "/pieces/wR.png",
  wb: "/pieces/wB.png",
  wn: "/pieces/wN.png",
  wp: "/pieces/wP.png",
  bk: "/pieces/bK.png",
  bq: "/pieces/bQ.png",
  bg: "/pieces/bQ.png", // Grace jump queen uses same image as queen
  br: "/pieces/bR.png",
  bb: "/pieces/bB.png",
  bn: "/pieces/bN.png",
  bp: "/pieces/bP.png",
};

interface PieceProps {
  color: "w" | "b";
  type: string;
  squareSize: number;
}

export default function Piece({ color, type, squareSize }: PieceProps) {
  const key = `${color}${type}`;
  const src = PIECE_MAP[key];
  if (!src) return null;

  const pieceSize = Math.floor(squareSize * 0.82);

  return (
    <Image
      src={src}
      alt={`${color === "w" ? "White" : "Black"} ${type}`}
      width={pieceSize}
      height={pieceSize}
      className="pointer-events-none select-none"
      draggable={false}
      priority
    />
  );
}
