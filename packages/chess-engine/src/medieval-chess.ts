import type { MedievalChessConfig, MedievalMove, Piece, PieceType, Color, Square } from "./types";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = ["1", "2", "3", "4", "5", "6", "7", "8"];

// Square index: 0=a1, 1=b1, ..., 63=h8
function sqIndex(square: Square): number {
  const file = FILES.indexOf(square[0]);
  const rank = RANKS.indexOf(square[1]);
  return rank * 8 + file;
}

function indexToSquare(index: number): Square {
  const file = index % 8;
  const rank = Math.floor(index / 8);
  return `${FILES[file]}${RANKS[rank]}` as Square;
}

function fileOf(index: number): number {
  return index % 8;
}

function rankOf(index: number): number {
  return Math.floor(index / 8);
}

function squareDistance(a: number, b: number): number {
  return Math.max(Math.abs(fileOf(a) - fileOf(b)), Math.abs(rankOf(a) - rankOf(b)));
}

/**
 * Compute step attacks: squares reachable by one application of delta,
 * filtering out wraps (distance > 3).
 */
function computeStepAttacks(sq: number, deltas: number[]): number[] {
  const result: number[] = [];
  for (const delta of deltas) {
    const target = sq + delta;
    if (target >= 0 && target < 64 && squareDistance(sq, target) <= 3) {
      result.push(target);
    }
  }
  return result;
}

// Precompute attack tables
const KNIGHT_ATTACKS: number[][] = [];
const KING_ATTACKS: number[][] = [];
const PAWN_ATTACKS: [number[][], number[][]] = [[], []]; // [white, black]
const DIAGONAL_1_ATTACKS: number[][] = []; // 1-square diagonal (queen, grace jump captures)
const DIAGONAL_2_ATTACKS: number[][] = []; // 2-square diagonal jumps (bishop, grace jump moves)
const ORTHOGONAL_2_ATTACKS: number[][] = []; // 2-square orthogonal jumps (grace jump moves)

for (let sq = 0; sq < 64; sq++) {
  KNIGHT_ATTACKS.push(computeStepAttacks(sq, [17, 15, 10, 6, -17, -15, -10, -6]));
  KING_ATTACKS.push(computeStepAttacks(sq, [9, 8, 7, 1, -9, -8, -7, -1]));
  PAWN_ATTACKS[0].push(computeStepAttacks(sq, [7, 9])); // white pawn attacks
  PAWN_ATTACKS[1].push(computeStepAttacks(sq, [-7, -9])); // black pawn attacks
  DIAGONAL_1_ATTACKS.push(computeStepAttacks(sq, [7, 9, -7, -9]));
  DIAGONAL_2_ATTACKS.push(computeStepAttacks(sq, [18, 14, -18, -14]));
  ORTHOGONAL_2_ATTACKS.push(computeStepAttacks(sq, [16, -16, 2, -2]));
}

/** Compute rook sliding attacks along rank and file */
function rookAttacks(sq: number, occupied: Set<number>): number[] {
  const result: number[] = [];
  const f = fileOf(sq);
  const r = rankOf(sq);

  // Directions: right, left, up, down
  const directions = [
    { df: 1, dr: 0 },
    { df: -1, dr: 0 },
    { df: 0, dr: 1 },
    { df: 0, dr: -1 },
  ];

  for (const { df, dr } of directions) {
    let cf = f + df;
    let cr = r + dr;
    while (cf >= 0 && cf < 8 && cr >= 0 && cr < 8) {
      const target = cr * 8 + cf;
      result.push(target);
      if (occupied.has(target)) break;
      cf += df;
      cr += dr;
    }
  }

  return result;
}

interface BoardState {
  board: (Piece | null)[];
  turn: Color;
  captureHappened: boolean;
  castlingRights: { K: boolean; Q: boolean; k: boolean; q: boolean };
  epSquare: number | null;
  halfmoveClock: number;
  fullmoveNumber: number;
}

/**
 * Medieval Chess Engine
 *
 * Medieval rules (from python-medieval-chess):
 * - Queens start as "Queen Grace Jump" (type 'g'):
 *   - Can capture 1 square diagonally
 *   - Can move (no capture) 2 squares diagonally or 2 squares orthogonally
 *   - After first move, becomes a regular queen ('q')
 * - Regular queens ('q') can only move/capture 1 square diagonally
 * - Bishops move as 2-square diagonal jumpers (no sliding)
 * - Rooks keep standard sliding movement
 * - Pawns can only double-move if no capture has occurred in the game
 * - Promotion is always to Queen Grace Jump ('g')
 * - No en passant (disabled because pawn double-move is conditional)
 */
export class MedievalChess {
  private board: (Piece | null)[] = new Array(64).fill(null);
  private _turn: Color = "w";
  private captureHappened = false;
  private castlingRights = { K: true, Q: true, k: true, q: true };
  private epSquare: number | null = null;
  private halfmoveClock = 0;
  private fullmoveNumber = 1;
  private moveHistory: MedievalMove[] = [];
  private stateStack: BoardState[] = [];

  constructor(config: MedievalChessConfig = {}) {
    if (config.fen) {
      this.loadFen(config.fen);
    } else {
      this.reset();
    }
  }

  reset(): void {
    this.board = new Array(64).fill(null);
    this._turn = "w";
    this.captureHappened = false;
    this.castlingRights = { K: true, Q: true, k: true, q: true };
    this.epSquare = null;
    this.halfmoveClock = 0;
    this.fullmoveNumber = 1;
    this.moveHistory = [];
    this.stateStack = [];

    // Back rank: R N B G K B N R (G = queen grace jump at d1/d8)
    const backRank: PieceType[] = ["r", "n", "b", "g", "k", "b", "n", "r"];
    for (let f = 0; f < 8; f++) {
      this.board[f] = { type: backRank[f], color: "w" };
      this.board[8 + f] = { type: "p", color: "w" };
      this.board[48 + f] = { type: "p", color: "b" };
      this.board[56 + f] = { type: backRank[f], color: "b" };
    }
  }

  turn(): Color {
    return this._turn;
  }

  fen(): string {
    let fen = "";
    for (let rank = 7; rank >= 0; rank--) {
      let empty = 0;
      for (let file = 0; file < 8; file++) {
        const piece = this.board[rank * 8 + file];
        if (!piece) {
          empty++;
        } else {
          if (empty > 0) {
            fen += empty;
            empty = 0;
          }
          // Grace jump queen uses 'q' in FEN (same as python version)
          const symbol = piece.type === "g" ? "q" : piece.type;
          fen += piece.color === "w" ? symbol.toUpperCase() : symbol;
        }
      }
      if (empty > 0) fen += empty;
      if (rank > 0) fen += "/";
    }

    fen += ` ${this._turn}`;

    // Castling
    let castling = "";
    if (this.castlingRights.K) castling += "K";
    if (this.castlingRights.Q) castling += "Q";
    if (this.castlingRights.k) castling += "k";
    if (this.castlingRights.q) castling += "q";
    fen += ` ${castling || "-"}`;

    // En passant
    fen += ` ${this.epSquare !== null ? indexToSquare(this.epSquare) : "-"}`;
    fen += ` ${this.halfmoveClock} ${this.fullmoveNumber}`;

    return fen;
  }

  loadFen(fen: string): void {
    this.board = new Array(64).fill(null);
    this.moveHistory = [];
    this.stateStack = [];

    const parts = fen.split(" ");
    const ranks = parts[0].split("/");

    for (let rank = 7; rank >= 0; rank--) {
      let file = 0;
      for (const ch of ranks[7 - rank]) {
        if (ch >= "1" && ch <= "8") {
          file += parseInt(ch);
        } else {
          const color: Color = ch === ch.toUpperCase() ? "w" : "b";
          const lower = ch.toLowerCase();
          let type: PieceType;
          // In starting position, queens at d1/d8 are grace jump
          // But from FEN we can't distinguish — treat 'q' as regular queen
          if (lower === "p") type = "p";
          else if (lower === "n") type = "n";
          else if (lower === "b") type = "b";
          else if (lower === "r") type = "r";
          else if (lower === "q") type = "q";
          else if (lower === "k") type = "k";
          else type = "q";
          this.board[rank * 8 + file] = { type, color };
          file++;
        }
      }
    }

    this._turn = (parts[1] || "w") as Color;

    this.castlingRights = { K: false, Q: false, k: false, q: false };
    const castling = parts[2] || "-";
    if (castling.includes("K")) this.castlingRights.K = true;
    if (castling.includes("Q")) this.castlingRights.Q = true;
    if (castling.includes("k")) this.castlingRights.k = true;
    if (castling.includes("q")) this.castlingRights.q = true;

    const ep = parts[3] || "-";
    this.epSquare = ep === "-" ? null : sqIndex(ep as Square);

    this.halfmoveClock = parseInt(parts[4] || "0");
    this.fullmoveNumber = parseInt(parts[5] || "1");
    this.captureHappened = false;
  }

  /** Get the board as an 8x8 array (row 0 = rank 8, row 7 = rank 1) for display */
  getBoard(): (Piece | null)[][] {
    const result: (Piece | null)[][] = [];
    for (let row = 0; row < 8; row++) {
      const rank: (Piece | null)[] = [];
      for (let col = 0; col < 8; col++) {
        // row 0 = rank 8 (index 56-63), row 7 = rank 1 (index 0-7)
        rank.push(this.board[(7 - row) * 8 + col]);
      }
      result.push(rank);
    }
    return result;
  }

  get(square: Square): Piece | null {
    return this.board[sqIndex(square)];
  }

  get hasCaptureOccurred(): boolean {
    return this.captureHappened;
  }

  private occupiedSet(): Set<number> {
    const set = new Set<number>();
    for (let i = 0; i < 64; i++) {
      if (this.board[i]) set.add(i);
    }
    return set;
  }

  /**
   * Get squares that attack a given square for a given color.
   */
  private attackersOf(sq: number, color: Color, boardState?: (Piece | null)[]): number[] {
    const b = boardState || this.board;
    const occupied = new Set<number>();
    for (let i = 0; i < 64; i++) {
      if (b[i]) occupied.add(i);
    }

    const attackers: number[] = [];

    // Knights
    for (const from of KNIGHT_ATTACKS[sq]) {
      const p = b[from];
      if (p && p.color === color && p.type === "n") attackers.push(from);
    }

    // King
    for (const from of KING_ATTACKS[sq]) {
      const p = b[from];
      if (p && p.color === color && p.type === "k") attackers.push(from);
    }

    // Pawns
    const pawnDir = color === "w" ? 1 : 0; // white attacks come from below
    for (const from of PAWN_ATTACKS[pawnDir][sq]) {
      const p = b[from];
      if (p && p.color === color && p.type === "p") attackers.push(from);
    }

    // Bishops (2-square diagonal jumpers)
    for (const from of DIAGONAL_2_ATTACKS[sq]) {
      const p = b[from];
      if (p && p.color === color && p.type === "b") attackers.push(from);
    }

    // Queens and Grace Jump Queens (1-square diagonal)
    for (const from of DIAGONAL_1_ATTACKS[sq]) {
      const p = b[from];
      if (p && p.color === color && (p.type === "q" || p.type === "g")) {
        attackers.push(from);
      }
    }

    // Rooks (sliding)
    for (const from of rookAttacks(sq, occupied)) {
      const p = b[from];
      if (p && p.color === color && p.type === "r") attackers.push(from);
    }

    return attackers;
  }

  /** Is the given color's king in check? */
  private isInCheck(color: Color, boardState?: (Piece | null)[]): boolean {
    const b = boardState || this.board;
    const opponent: Color = color === "w" ? "b" : "w";
    for (let i = 0; i < 64; i++) {
      if (b[i]?.type === "k" && b[i]?.color === color) {
        return this.attackersOf(i, opponent, b).length > 0;
      }
    }
    return false;
  }

  isCheck(): boolean {
    return this.isInCheck(this._turn);
  }

  /**
   * Generate all legal moves for the current position.
   */
  legalMoves(square?: Square): MedievalMove[] {
    const pseudoLegal = this.generatePseudoLegalMoves(square);
    return pseudoLegal.filter((m) => this.isLegalMove(m));
  }

  /** Check if a pseudo-legal move doesn't leave own king in check */
  private isLegalMove(move: MedievalMove): boolean {
    const fromIdx = sqIndex(move.from);
    const toIdx = sqIndex(move.to);

    // Simulate the move
    const tempBoard = [...this.board];
    let piece = tempBoard[fromIdx]!;

    // Grace jump converts to queen
    if (piece.type === "g") {
      piece = { type: "q", color: piece.color };
    }

    // Handle promotion
    if (move.promotion) {
      piece = { type: move.promotion, color: piece.color };
    }

    tempBoard[toIdx] = piece;
    tempBoard[fromIdx] = null;

    // Handle castling rook movement
    if (move.piece === "k" && Math.abs(fileOf(fromIdx) - fileOf(toIdx)) === 2) {
      if (fileOf(toIdx) === 6) {
        // Kingside
        tempBoard[rankOf(fromIdx) * 8 + 5] = tempBoard[rankOf(fromIdx) * 8 + 7];
        tempBoard[rankOf(fromIdx) * 8 + 7] = null;
      } else if (fileOf(toIdx) === 2) {
        // Queenside
        tempBoard[rankOf(fromIdx) * 8 + 3] = tempBoard[rankOf(fromIdx) * 8 + 0];
        tempBoard[rankOf(fromIdx) * 8 + 0] = null;
      }
    }

    // Handle en passant capture
    if (move.piece === "p" && toIdx === this.epSquare) {
      const capturedPawnIdx = move.color === "w" ? toIdx - 8 : toIdx + 8;
      tempBoard[capturedPawnIdx] = null;
    }

    return !this.isInCheck(this._turn, tempBoard);
  }

  private generatePseudoLegalMoves(onlySquare?: Square): MedievalMove[] {
    const moves: MedievalMove[] = [];
    const color = this._turn;
    const opponent: Color = color === "w" ? "b" : "w";
    const occupied = this.occupiedSet();

    const startIdx = onlySquare !== undefined ? sqIndex(onlySquare) : 0;
    const endIdx = onlySquare !== undefined ? sqIndex(onlySquare) + 1 : 64;

    for (let sq = startIdx; sq < endIdx; sq++) {
      const piece = this.board[sq];
      if (!piece || piece.color !== color) continue;

      const from = indexToSquare(sq);
      const targets: number[] = [];

      switch (piece.type) {
        case "p":
          this.generatePawnMoves(sq, color, opponent, occupied, moves);
          continue; // pawn moves handled separately (promotions)

        case "n":
          for (const t of KNIGHT_ATTACKS[sq]) {
            const target = this.board[t];
            if (!target || target.color === opponent) targets.push(t);
          }
          break;

        case "b":
          // Medieval bishop: 2-square diagonal jumper
          for (const t of DIAGONAL_2_ATTACKS[sq]) {
            const target = this.board[t];
            if (!target || target.color === opponent) targets.push(t);
          }
          break;

        case "r":
          // Standard sliding rook
          for (const t of rookAttacks(sq, occupied)) {
            const target = this.board[t];
            if (!target || target.color === opponent) targets.push(t);
          }
          break;

        case "q":
          // Medieval queen: 1-square diagonal only
          for (const t of DIAGONAL_1_ATTACKS[sq]) {
            const target = this.board[t];
            if (!target || target.color === opponent) targets.push(t);
          }
          break;

        case "g":
          // Queen Grace Jump:
          // 1) Can capture 1 square diagonally
          for (const t of DIAGONAL_1_ATTACKS[sq]) {
            const target = this.board[t];
            if (!target || target.color === opponent) targets.push(t);
          }
          // 2) Can move (no capture) 2 squares diagonally
          for (const t of DIAGONAL_2_ATTACKS[sq]) {
            if (!this.board[t]) targets.push(t);
          }
          // 3) Can move (no capture) 2 squares orthogonally
          for (const t of ORTHOGONAL_2_ATTACKS[sq]) {
            if (!this.board[t]) targets.push(t);
          }
          break;

        case "k":
          for (const t of KING_ATTACKS[sq]) {
            const target = this.board[t];
            if (!target || target.color === opponent) targets.push(t);
          }
          // Castling
          this.generateCastlingMoves(sq, color, occupied, moves);
          break;
      }

      for (const t of targets) {
        const captured = this.board[t];
        moves.push({
          from,
          to: indexToSquare(t),
          piece: piece.type,
          color,
          captured: captured?.type,
          san: this.buildSan(piece.type, from, indexToSquare(t), captured?.type),
        });
      }
    }

    return moves;
  }

  private generatePawnMoves(
    sq: number,
    color: Color,
    opponent: Color,
    occupied: Set<number>,
    moves: MedievalMove[]
  ): void {
    const from = indexToSquare(sq);
    const direction = color === "w" ? 1 : -1;
    const startRank = color === "w" ? 1 : 6;
    const promoRank = color === "w" ? 7 : 0;
    const pawnAttacks = color === "w" ? PAWN_ATTACKS[0][sq] : PAWN_ATTACKS[1][sq];

    // Captures
    for (const t of pawnAttacks) {
      const target = this.board[t];
      const isEnPassant = t === this.epSquare;
      if ((target && target.color === opponent) || isEnPassant) {
        const to = indexToSquare(t);
        if (rankOf(t) === promoRank) {
          // Promote to grace jump queen
          moves.push({
            from, to, piece: "p", color,
            captured: target?.type || "p", // en passant captures pawn
            promotion: "g",
            san: `${from[0]}x${to}=Q`,
          });
        } else {
          moves.push({
            from, to, piece: "p", color,
            captured: target?.type || "p",
            san: `${from[0]}x${to}`,
          });
        }
      }
    }

    // Single push
    const singleTarget = sq + direction * 8;
    if (singleTarget >= 0 && singleTarget < 64 && !occupied.has(singleTarget)) {
      const to = indexToSquare(singleTarget);
      if (rankOf(singleTarget) === promoRank) {
        moves.push({
          from, to, piece: "p", color, promotion: "g",
          san: `${to}=Q`,
        });
      } else {
        moves.push({
          from, to, piece: "p", color,
          san: to,
        });
      }

      // Double push (only if no capture has happened)
      if (!this.captureHappened && rankOf(sq) === startRank) {
        const doubleTarget = sq + direction * 16;
        if (doubleTarget >= 0 && doubleTarget < 64 && !occupied.has(doubleTarget)) {
          moves.push({
            from, to: indexToSquare(doubleTarget), piece: "p", color,
            san: indexToSquare(doubleTarget),
          });
        }
      }
    }
  }

  private generateCastlingMoves(
    kingSq: number,
    color: Color,
    occupied: Set<number>,
    moves: MedievalMove[]
  ): void {
    const rank = color === "w" ? 0 : 7;
    const from = indexToSquare(kingSq);
    const opponent: Color = color === "w" ? "b" : "w";

    // Can't castle while in check
    if (this.isInCheck(color)) return;

    // Kingside
    const canKingside = color === "w" ? this.castlingRights.K : this.castlingRights.k;
    if (canKingside) {
      const f = rank * 8 + 5;
      const g = rank * 8 + 6;
      if (!occupied.has(f) && !occupied.has(g)) {
        // Check if king passes through or ends on attacked square
        if (
          this.attackersOf(f, opponent).length === 0 &&
          this.attackersOf(g, opponent).length === 0
        ) {
          moves.push({
            from, to: indexToSquare(g), piece: "k", color,
            san: "O-O",
          });
        }
      }
    }

    // Queenside
    const canQueenside = color === "w" ? this.castlingRights.Q : this.castlingRights.q;
    if (canQueenside) {
      const d = rank * 8 + 3;
      const c = rank * 8 + 2;
      const b = rank * 8 + 1;
      if (!occupied.has(d) && !occupied.has(c) && !occupied.has(b)) {
        if (
          this.attackersOf(d, opponent).length === 0 &&
          this.attackersOf(c, opponent).length === 0
        ) {
          moves.push({
            from, to: indexToSquare(c), piece: "k", color,
            san: "O-O-O",
          });
        }
      }
    }
  }

  private buildSan(
    pieceType: PieceType,
    from: string,
    to: string,
    captured?: PieceType
  ): string {
    const pieceChar =
      pieceType === "n" ? "N"
        : pieceType === "b" ? "B"
          : pieceType === "r" ? "R"
            : pieceType === "q" ? "Q"
              : pieceType === "g" ? "Q"
                : pieceType === "k" ? "K"
                  : "";
    const capture = captured ? "x" : "";
    return `${pieceChar}${capture}${to}`;
  }

  /**
   * Execute a move. Returns the move or null if invalid.
   */
  move(moveInput: string | { from: Square; to: Square; promotion?: string }): MedievalMove | null {
    const legal = this.legalMoves();

    let move: MedievalMove | undefined;

    if (typeof moveInput === "string") {
      // SAN or coordinate notation
      move = legal.find((m) => m.san === moveInput);
      if (!move) {
        // Try coordinate match
        move = legal.find((m) => `${m.from}${m.to}` === moveInput);
      }
    } else {
      move = legal.find(
        (m) =>
          m.from === moveInput.from &&
          m.to === moveInput.to &&
          (!moveInput.promotion || m.promotion === moveInput.promotion)
      );
    }

    if (!move) return null;

    // Save state
    this.stateStack.push({
      board: [...this.board],
      turn: this._turn,
      captureHappened: this.captureHappened,
      castlingRights: { ...this.castlingRights },
      epSquare: this.epSquare,
      halfmoveClock: this.halfmoveClock,
      fullmoveNumber: this.fullmoveNumber,
    });

    const fromIdx = sqIndex(move.from);
    const toIdx = sqIndex(move.to);
    let piece = this.board[fromIdx]!;

    // Track capture
    if (move.captured) {
      this.captureHappened = true;
    }

    // Handle en passant capture
    if (piece.type === "p" && toIdx === this.epSquare) {
      const capturedPawnIdx = this._turn === "w" ? toIdx - 8 : toIdx + 8;
      this.board[capturedPawnIdx] = null;
      this.captureHappened = true;
    }

    // Set en passant square for double pawn push
    if (piece.type === "p" && Math.abs(rankOf(toIdx) - rankOf(fromIdx)) === 2) {
      this.epSquare = this._turn === "w" ? fromIdx + 8 : fromIdx - 8;
    } else {
      this.epSquare = null;
    }

    // Grace jump queen converts to regular queen after moving
    if (piece.type === "g") {
      piece = { type: "q", color: piece.color };
    }

    // Handle promotion
    if (move.promotion) {
      piece = { type: move.promotion, color: piece.color };
    }

    // Handle castling
    if (move.piece === "k" && Math.abs(fileOf(fromIdx) - fileOf(toIdx)) === 2) {
      const rank = rankOf(fromIdx);
      if (fileOf(toIdx) === 6) {
        // Kingside
        this.board[rank * 8 + 5] = this.board[rank * 8 + 7];
        this.board[rank * 8 + 7] = null;
      } else if (fileOf(toIdx) === 2) {
        // Queenside
        this.board[rank * 8 + 3] = this.board[rank * 8 + 0];
        this.board[rank * 8 + 0] = null;
      }
    }

    // Move piece
    this.board[toIdx] = piece;
    this.board[fromIdx] = null;

    // Update castling rights
    if (piece.type === "k") {
      if (this._turn === "w") {
        this.castlingRights.K = false;
        this.castlingRights.Q = false;
      } else {
        this.castlingRights.k = false;
        this.castlingRights.q = false;
      }
    }
    if (fromIdx === 0 || toIdx === 0) this.castlingRights.Q = false;
    if (fromIdx === 7 || toIdx === 7) this.castlingRights.K = false;
    if (fromIdx === 56 || toIdx === 56) this.castlingRights.q = false;
    if (fromIdx === 63 || toIdx === 63) this.castlingRights.k = false;

    // Update clocks
    if (piece.type === "p" || move.captured) {
      this.halfmoveClock = 0;
    } else {
      this.halfmoveClock++;
    }
    if (this._turn === "b") {
      this.fullmoveNumber++;
    }

    // Switch turn
    this._turn = this._turn === "w" ? "b" : "w";
    this.moveHistory.push(move);

    return move;
  }

  /** Undo the last move */
  undo(): MedievalMove | null {
    const move = this.moveHistory.pop();
    const state = this.stateStack.pop();
    if (!move || !state) return null;

    this.board = state.board;
    this._turn = state.turn;
    this.captureHappened = state.captureHappened;
    this.castlingRights = state.castlingRights;
    this.epSquare = state.epSquare;
    this.halfmoveClock = state.halfmoveClock;
    this.fullmoveNumber = state.fullmoveNumber;

    return move;
  }

  /** Get legal moves as SAN strings, optionally for a specific square */
  moves(options?: { square?: Square; verbose?: boolean }): MedievalMove[] | string[] {
    const legal = this.legalMoves(options?.square);
    if (options?.verbose) return legal;
    return legal.map((m) => m.san);
  }

  history(): string[] {
    return this.moveHistory.map((m) => m.san);
  }

  isGameOver(): boolean {
    return this.isCheckmate() || this.isStalemate() || this.isDraw();
  }

  isCheckmate(): boolean {
    return this.isInCheck(this._turn) && this.legalMoves().length === 0;
  }

  isStalemate(): boolean {
    return !this.isInCheck(this._turn) && this.legalMoves().length === 0;
  }

  isDraw(): boolean {
    return this.halfmoveClock >= 100; // 50-move rule
  }

  /** Load a PGN string (basic support) */
  loadPgn(pgn: string): void {
    this.reset();
    // Strip comments and tags
    const cleaned = pgn
      .replace(/\{[^}]*\}/g, "")
      .replace(/\[[^\]]*\]/g, "")
      .replace(/\d+\./g, "")
      .trim();
    const moves = cleaned.split(/\s+/).filter((m) => m && !m.match(/^(1-0|0-1|1\/2|\\*)$/));
    for (const san of moves) {
      if (!this.move(san)) break;
    }
  }

  pgn(): string {
    const moves: string[] = [];
    for (let i = 0; i < this.moveHistory.length; i++) {
      if (i % 2 === 0) {
        moves.push(`${Math.floor(i / 2) + 1}. ${this.moveHistory[i].san}`);
      } else {
        moves.push(this.moveHistory[i].san);
      }
    }
    return moves.join(" ");
  }
}
