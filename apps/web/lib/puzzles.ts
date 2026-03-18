import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  orderBy,
  where,
  limit,
  increment,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Puzzle } from "@medieval-chess/shared/types";

const PUZZLES_COLLECTION = "puzzles";

export interface PuzzleDoc {
  title: string;
  description: string;
  story?: string;
  fen: string;
  solution: string[];
  difficulty: number;
  collection?: string;
  authorId: string;
  authorName: string;
  createdAt: Timestamp;
  likes: number;
}

function docToPuzzle(id: string, data: PuzzleDoc): Puzzle {
  return {
    id,
    title: data.title,
    description: data.description,
    story: data.story,
    pgn: "",
    fen: data.fen,
    solution: data.solution,
    difficulty: data.difficulty,
    collection: data.collection,
    authorId: data.authorId,
    authorName: data.authorName,
    createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
    likes: data.likes || 0,
  };
}

export async function createPuzzle(puzzle: {
  title: string;
  description: string;
  story?: string;
  fen: string;
  solution: string[];
  difficulty: number;
  collection?: string;
  authorId: string;
  authorName: string;
}): Promise<string> {
  const docRef = await addDoc(collection(db, PUZZLES_COLLECTION), {
    ...puzzle,
    createdAt: serverTimestamp(),
    likes: 0,
  });
  return docRef.id;
}

export async function getPuzzle(id: string): Promise<Puzzle | null> {
  const docRef = doc(db, PUZZLES_COLLECTION, id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return docToPuzzle(snap.id, snap.data() as PuzzleDoc);
}

export async function listPuzzles(options?: {
  collectionFilter?: string;
  difficulty?: number;
  maxResults?: number;
}): Promise<Puzzle[]> {
  const constraints = [];

  if (options?.collectionFilter) {
    constraints.push(where("collection", "==", options.collectionFilter));
  }
  if (options?.difficulty) {
    constraints.push(where("difficulty", "==", options.difficulty));
  }
  constraints.push(orderBy("createdAt", "desc"));
  if (options?.maxResults) {
    constraints.push(limit(options.maxResults));
  }

  const q = query(collection(db, PUZZLES_COLLECTION), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToPuzzle(d.id, d.data() as PuzzleDoc));
}

export async function likePuzzle(id: string): Promise<void> {
  const docRef = doc(db, PUZZLES_COLLECTION, id);
  await updateDoc(docRef, { likes: increment(1) });
}
