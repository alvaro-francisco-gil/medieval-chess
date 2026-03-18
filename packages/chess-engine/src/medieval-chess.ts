import { Chess } from "chess.js";
import type { MedievalChessConfig, MedievalMove, Square } from "./types";

/**
 * Medieval chess engine extending chess.js with medieval variant rules.
 *
 * Medieval rules:
 * 1. Queens start as "Queen Grace Jump" — can jump 3 squares diagonally
 *    or 2 squares orthogonally (to empty squares), or capture 1 square
 *    diagonally. After first move, becomes a normal queen.
 * 2. Pawns can only move 2 squares if no capture has occurred in the game.
 * 3. Pawns promote to Queen Grace Jump (not regular queen).
 */
export class MedievalChess {
  private game: Chess;
  private medieval: boolean;
  private captureHappened: boolean = false;
  private graceQueens: Set<Square> = new Set();

  constructor(config: MedievalChessConfig = {}) {
    this.medieval = config.medieval ?? true;
    this.game = new Chess(config.fen);

    if (this.medieval && !config.fen) {
      // Mark starting queens as grace jump queens
      this.graceQueens.add("d1");
      this.graceQueens.add("d8");
    }
  }

  /** Get the underlying chess.js instance (for standard operations) */
  get chess(): Chess {
    return this.game;
  }

  /** Whether any capture has occurred in the game */
  get hasCaptureOccurred(): boolean {
    return this.captureHappened;
  }

  /** Get the current FEN string */
  fen(): string {
    return this.game.fen();
  }

  /** Get the board as an array */
  board() {
    return this.game.board();
  }

  /** Check if game is over */
  isGameOver(): boolean {
    return this.game.isGameOver();
  }

  /** Check if position is checkmate */
  isCheckmate(): boolean {
    return this.game.isCheckmate();
  }

  /** Check if position is stalemate */
  isStalemate(): boolean {
    return this.game.isStalemate();
  }

  /** Current turn ('w' or 'b') */
  turn() {
    return this.game.turn();
  }

  /** Reset to starting position */
  reset(): void {
    this.game.reset();
    this.captureHappened = false;
    this.graceQueens.clear();
    if (this.medieval) {
      this.graceQueens.add("d1");
      this.graceQueens.add("d8");
    }
  }

  /** Load a FEN position */
  load(fen: string): void {
    this.game.load(fen);
  }

  /**
   * TODO: Implement medieval move generation and validation.
   * For now, delegates to chess.js standard moves.
   * Phase 2 will add:
   * - Queen Grace Jump move generation
   * - Pawn double-move restriction after capture
   * - Grace queen conversion after move
   */
  moves(options?: { square?: Square; verbose?: boolean }) {
    if (!options) return this.game.moves();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.game.moves(options as any);
  }

  /**
   * TODO: Implement medieval move execution.
   * For now, delegates to chess.js.
   */
  move(move: string | { from: Square; to: Square; promotion?: string }) {
    const result = this.game.move(move);
    if (result && result.captured) {
      this.captureHappened = true;
    }
    return result;
  }

  /** Undo the last move */
  undo() {
    return this.game.undo();
  }

  /** Get move history */
  history(options?: { verbose?: boolean }) {
    if (!options) return this.game.history();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.game.history(options as any);
  }

  /** Load a PGN string */
  loadPgn(pgn: string): void {
    this.game.loadPgn(pgn);
  }

  /** Get PGN string */
  pgn(): string {
    return this.game.pgn();
  }
}
