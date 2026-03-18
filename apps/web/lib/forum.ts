import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  orderBy,
  limit,
  increment,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { ForumPost, ForumComment } from "@medieval-chess/shared/types";

const POSTS_COLLECTION = "posts";

interface PostDoc {
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  commentCount: number;
  likes: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface CommentDoc {
  postId: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  likes: number;
  createdAt: Timestamp;
}

function docToPost(id: string, data: PostDoc): ForumPost {
  return {
    id,
    title: data.title,
    content: data.content,
    authorId: data.authorId,
    authorName: data.authorName,
    authorAvatarUrl: data.authorAvatarUrl,
    commentCount: data.commentCount || 0,
    likes: data.likes || 0,
    createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
    updatedAt: data.updatedAt?.toMillis?.() ?? Date.now(),
  };
}

function docToComment(id: string, data: CommentDoc): ForumComment {
  return {
    id,
    postId: data.postId,
    content: data.content,
    authorId: data.authorId,
    authorName: data.authorName,
    authorAvatarUrl: data.authorAvatarUrl,
    likes: data.likes || 0,
    createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
  };
}

export async function createPost(post: {
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
}): Promise<string> {
  const docRef = await addDoc(collection(db, POSTS_COLLECTION), {
    ...post,
    commentCount: 0,
    likes: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getPost(id: string): Promise<ForumPost | null> {
  const snap = await getDoc(doc(db, POSTS_COLLECTION, id));
  if (!snap.exists()) return null;
  return docToPost(snap.id, snap.data() as PostDoc);
}

export async function listPosts(maxResults = 50): Promise<ForumPost[]> {
  const q = query(
    collection(db, POSTS_COLLECTION),
    orderBy("createdAt", "desc"),
    limit(maxResults)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToPost(d.id, d.data() as PostDoc));
}

export async function likePost(id: string): Promise<void> {
  await updateDoc(doc(db, POSTS_COLLECTION, id), { likes: increment(1) });
}

export async function addComment(comment: {
  postId: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
}): Promise<string> {
  const docRef = await addDoc(
    collection(db, POSTS_COLLECTION, comment.postId, "comments"),
    {
      ...comment,
      likes: 0,
      createdAt: serverTimestamp(),
    }
  );
  // Increment comment count on the post
  await updateDoc(doc(db, POSTS_COLLECTION, comment.postId), {
    commentCount: increment(1),
  });
  return docRef.id;
}

export async function listComments(postId: string): Promise<ForumComment[]> {
  const q = query(
    collection(db, POSTS_COLLECTION, postId, "comments"),
    orderBy("createdAt", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToComment(d.id, d.data() as CommentDoc));
}
