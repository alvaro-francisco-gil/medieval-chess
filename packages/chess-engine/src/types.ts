import type { Square as ChessSquare, PieceSymbol, Color } from "chess.js";

export type Square = ChessSquare;
export type PieceType = PieceSymbol | "g"; // 'g' = queen grace jump

export interface MedievalPiece {
  type: PieceType;
  color: Color;
}

export interface MedievalMove {
  from: Square;
  to: Square;
  promotion?: PieceType;
  captured?: PieceType;
  piece: PieceType;
  color: Color;
  san: string;
  flags: string;
}

export interface MedievalChessConfig {
  fen?: string;
  /** If true, use medieval rules. If false, standard chess. */
  medieval?: boolean;
}
