"use client";

import { useCallback } from "react";
import Piece from "./Piece";
import MoveIndicator from "./MoveIndicator";

interface SquareProps {
  row: number;
  col: number;
  piece: { type: string; color: "w" | "b" } | null;
  isLight: boolean;
  isSelected: boolean;
  isLegalMove: boolean;
  isLastMove: boolean;
  squareSize: number;
  onClick: (row: number, col: number) => void;
  onDragStart: (row: number, col: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (row: number, col: number) => void;
}

export default function Square({
  row,
  col,
  piece,
  isLight,
  isSelected,
  isLegalMove,
  isLastMove,
  squareSize,
  onClick,
  onDragStart,
  onDragOver,
  onDrop,
}: SquareProps) {
  const handleClick = useCallback(() => onClick(row, col), [onClick, row, col]);
  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      if (!piece) {
        e.preventDefault();
        return;
      }
      e.dataTransfer.effectAllowed = "move";
      onDragStart(row, col);
    },
    [piece, onDragStart, row, col]
  );
  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      onDragOver(e);
    },
    [onDragOver]
  );
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      onDrop(row, col);
    },
    [onDrop, row, col]
  );

  const bgImage = isLight ? "/board/square-light.png" : "/board/square-dark.png";

  let overlay = "";
  if (isSelected) {
    overlay = "rgba(201, 168, 76, 0.5)";
  } else if (isLastMove) {
    overlay = "rgba(201, 168, 76, 0.25)";
  }

  return (
    <div
      className="relative cursor-pointer"
      style={{
        width: squareSize,
        height: squareSize,
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
      }}
      onClick={handleClick}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      draggable={!!piece}
    >
      {overlay && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundColor: overlay }}
        />
      )}
      {piece && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Piece
            color={piece.color}
            type={piece.type}
            squareSize={squareSize}
          />
        </div>
      )}
      {isLegalMove && (
        <MoveIndicator isCapture={!!piece} squareSize={squareSize} />
      )}
    </div>
  );
}
