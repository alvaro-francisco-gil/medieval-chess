export interface TiptapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  text?: string;
}

export interface TiptapDocument {
  type: "doc";
  content: TiptapNode[];
}

export interface Puzzle {
  id: string;
  title: string;
  description: string;
  /** Historical story/context for the puzzle */
  story?: string;
  /** PGN of the starting position */
  pgn: string;
  /** FEN of the starting position */
  fen: string;
  /** Solution moves in SAN notation */
  solution: string[];
  /** Difficulty 1-5 */
  difficulty: number;
  /** Collection this puzzle belongs to (e.g. "alfonso-x") */
  collection?: string;
  authorId: string;
  authorName: string;
  createdAt: number;
  likes: number;
}

export interface UserProfile {
  id: string;
  displayName: string;
  avatarUrl?: string;
  puzzlesSolved: number;
  puzzlesCreated: number;
  /** Map of puzzleId -> completion timestamp */
  solvedPuzzles: Record<string, number>;
  createdAt: number;
}

export interface ForumPost {
  id: string;
  title: string;
  content: TiptapDocument | string;
  contentPreview?: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  commentCount: number;
  likes: number;
  createdAt: number;
  updatedAt: number;
}

export interface ForumComment {
  id: string;
  postId: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  likes: number;
  createdAt: number;
}
