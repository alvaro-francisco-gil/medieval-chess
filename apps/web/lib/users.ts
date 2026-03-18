import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { UserProfile } from "@medieval-chess/shared/types";

const USERS_COLLECTION = "users";

interface UserDoc {
  displayName: string;
  avatarUrl?: string;
  puzzlesSolved: number;
  puzzlesCreated: number;
  solvedPuzzles: Record<string, number>;
  createdAt: Timestamp;
}

function docToProfile(id: string, data: UserDoc): UserProfile {
  return {
    id,
    displayName: data.displayName,
    avatarUrl: data.avatarUrl,
    puzzlesSolved: data.puzzlesSolved || 0,
    puzzlesCreated: data.puzzlesCreated || 0,
    solvedPuzzles: data.solvedPuzzles || {},
    createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
  };
}

export async function getOrCreateProfile(
  uid: string,
  displayName: string,
  avatarUrl?: string
): Promise<UserProfile> {
  const ref = doc(db, USERS_COLLECTION, uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    return docToProfile(snap.id, snap.data() as UserDoc);
  }

  const newProfile = {
    displayName,
    avatarUrl: avatarUrl || null,
    puzzlesSolved: 0,
    puzzlesCreated: 0,
    solvedPuzzles: {},
    createdAt: serverTimestamp(),
  };
  await setDoc(ref, newProfile);

  return {
    id: uid,
    displayName,
    avatarUrl,
    puzzlesSolved: 0,
    puzzlesCreated: 0,
    solvedPuzzles: {},
    createdAt: Date.now(),
  };
}

export async function getProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, USERS_COLLECTION, uid));
  if (!snap.exists()) return null;
  return docToProfile(snap.id, snap.data() as UserDoc);
}

export async function markPuzzleSolved(
  uid: string,
  puzzleId: string
): Promise<void> {
  const ref = doc(db, USERS_COLLECTION, uid);
  await updateDoc(ref, {
    [`solvedPuzzles.${puzzleId}`]: Date.now(),
    puzzlesSolved: (await getDoc(ref)).data()?.puzzlesSolved + 1 || 1,
  });
}
