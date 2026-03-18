"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import type { MedievalChess, MedievalMove, Piece } from "@medieval-chess/engine";
import SquareComponent from "./Square";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = ["8", "7", "6", "5", "4", "3", "2", "1"];

type Square = `${(typeof FILES)[number]}${(typeof RANKS)[number]}`;

function toSquare(row: number, col: number): Square {
  return `${FILES[col]}${RANKS[row]}` as Square;
}

interface ChessBoardProps {
  game: MedievalChess;
  onMove?: (move: MedievalMove) => void;
  interactive?: boolean;
}

export default function ChessBoard({
  game,
  onMove,
  interactive = true,
}: ChessBoardProps) {
  const [selectedSquare, setSelectedSquare] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [legalMoves, setLegalMoves] = useState<Set<string>>(new Set());
  const [lastMove, setLastMove] = useState<{
    from: string;
    to: string;
  } | null>(null);
  const [squareSize, setSquareSize] = useState(64);
  const boardRef = useRef<HTMLDivElement>(null);

  // Responsive square sizing
  useEffect(() => {
    const updateSize = () => {
      if (boardRef.current) {
        const parent = boardRef.current.parentElement;
        if (parent) {
          const available = Math.min(parent.clientWidth, 560);
          setSquareSize(Math.floor(available / 8));
        }
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const board = useMemo(() => game.getBoard(), [game.fen()]);

  const selectPiece = useCallback(
    (row: number, col: number) => {
      const square = toSquare(row, col);
      const moves = game.legalMoves(square as Parameters<typeof game.legalMoves>[0]);
      setSelectedSquare({ row, col });
      setLegalMoves(new Set(moves.map((m) => m.to)));
    },
    [game]
  );

  const clearSelection = useCallback(() => {
    setSelectedSquare(null);
    setLegalMoves(new Set());
  }, []);

  const executeMove = useCallback(
    (fromRow: number, fromCol: number, toRow: number, toCol: number) => {
      const from = toSquare(fromRow, fromCol);
      const to = toSquare(toRow, toCol);

      const move = game.move({ from: from as Parameters<typeof game.move>[0] extends string ? never : Parameters<typeof game.move>[0] extends { from: infer F } ? F : never, to: to as any });
      if (move) {
        setLastMove({ from, to });
        clearSelection();
        onMove?.(move);
      } else {
        clearSelection();
      }
    },
    [game, onMove, clearSelection]
  );

  const handleClick = useCallback(
    (row: number, col: number) => {
      if (!interactive) return;

      const clickedPiece = board[row][col];

      if (selectedSquare) {
        const targetSquare = toSquare(row, col);

        if (selectedSquare.row === row && selectedSquare.col === col) {
          clearSelection();
          return;
        }

        if (legalMoves.has(targetSquare)) {
          executeMove(selectedSquare.row, selectedSquare.col, row, col);
          return;
        }

        if (clickedPiece && clickedPiece.color === game.turn()) {
          selectPiece(row, col);
          return;
        }

        clearSelection();
        return;
      }

      if (clickedPiece && clickedPiece.color === game.turn()) {
        selectPiece(row, col);
      }
    },
    [
      interactive,
      board,
      selectedSquare,
      legalMoves,
      game,
      selectPiece,
      clearSelection,
      executeMove,
    ]
  );

  const handleDragStart = useCallback(
    (row: number, col: number) => {
      if (!interactive) return;
      const piece = board[row][col];
      if (piece && piece.color === game.turn()) {
        selectPiece(row, col);
      }
    },
    [interactive, board, game, selectPiece]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (row: number, col: number) => {
      if (!interactive || !selectedSquare) return;
      const targetSquare = toSquare(row, col);
      if (legalMoves.has(targetSquare)) {
        executeMove(selectedSquare.row, selectedSquare.col, row, col);
      } else {
        clearSelection();
      }
    },
    [interactive, selectedSquare, legalMoves, executeMove, clearSelection]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") clearSelection();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [clearSelection]);

  const boardSize = squareSize * 8;
  const coordSize = 18;

  return (
    <div className="inline-flex flex-col items-center" ref={boardRef}>
      <div className="flex">
        <div
          className="flex flex-col justify-around mr-1"
          style={{ height: boardSize, width: coordSize }}
        >
          {RANKS.map((rank) => (
            <span
              key={rank}
              className="text-xs font-semibold text-center"
              style={{ color: "var(--color-wood-dark)" }}
            >
              {rank}
            </span>
          ))}
        </div>

        <div
          className="grid border-2"
          style={{
            gridTemplateColumns: `repeat(8, ${squareSize}px)`,
            gridTemplateRows: `repeat(8, ${squareSize}px)`,
            borderColor: "var(--color-wood-dark)",
          }}
        >
          {RANKS.map((_, row) =>
            FILES.map((_, col) => {
              const square = toSquare(row, col);
              const piece = board[row][col];
              const isLight = (row + col) % 2 === 0;
              const isSelected =
                selectedSquare?.row === row && selectedSquare?.col === col;
              const isLegalMove = legalMoves.has(square);
              const isLastMoveSquare =
                lastMove?.from === square || lastMove?.to === square;

              return (
                <SquareComponent
                  key={square}
                  row={row}
                  col={col}
                  piece={piece}
                  isLight={isLight}
                  isSelected={isSelected}
                  isLegalMove={isLegalMove}
                  isLastMove={isLastMoveSquare}
                  squareSize={squareSize}
                  onClick={handleClick}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                />
              );
            })
          )}
        </div>
      </div>

      <div
        className="flex mt-1"
        style={{ marginLeft: coordSize + 4, width: boardSize }}
      >
        {FILES.map((file) => (
          <span
            key={file}
            className="text-xs font-semibold text-center"
            style={{
              width: squareSize,
              color: "var(--color-wood-dark)",
            }}
          >
            {file}
          </span>
        ))}
      </div>
    </div>
  );
}
