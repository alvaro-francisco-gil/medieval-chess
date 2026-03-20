# Rich Content Posts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the plain-text forum editor with a Tiptap WYSIWYG editor supporting rich text, image uploads, chess position diagrams, and puzzle embeds.

**Architecture:** Tiptap editor with three custom nodes (chessPosition, puzzleEmbed, image) stores JSON documents in Firestore. Images upload to Firebase Storage. A read-only Tiptap renderer displays posts. Post IDs are pre-generated so images can upload to their final path before the post is saved.

**Tech Stack:** Tiptap (ProseMirror), Firebase Storage, Next.js 15, React 19, Tailwind CSS v4

**Spec:** `docs/superpowers/specs/2026-03-20-rich-content-posts-design.md`

---

## File Structure

### New Files

| File | Responsibility |
|------|---------------|
| `apps/web/components/editor/RichTextEditor.tsx` | Tiptap editor with extensions and toolbar integration |
| `apps/web/components/editor/RichTextViewer.tsx` | Read-only Tiptap renderer for post detail pages |
| `apps/web/components/editor/EditorToolbar.tsx` | Formatting + insert buttons toolbar |
| `apps/web/components/editor/extensions/chess-position.ts` | Tiptap Node extension definition for chess positions |
| `apps/web/components/editor/extensions/puzzle-embed.ts` | Tiptap Node extension definition for puzzle embeds |
| `apps/web/components/editor/extensions/image-upload.ts` | Tiptap Node extension definition for images with upload |
| `apps/web/components/editor/nodes/ChessPositionView.tsx` | React component rendered inside the chess position node |
| `apps/web/components/editor/nodes/PuzzleEmbedView.tsx` | React component rendered inside the puzzle embed node |
| `apps/web/components/editor/nodes/ImageUploadView.tsx` | React component rendered inside the image node |
| `apps/web/components/editor/modals/ChessPositionModal.tsx` | Two-tab modal: board setup + FEN paste |
| `apps/web/components/editor/modals/PuzzlePickerModal.tsx` | Search/browse picker for existing puzzles |
| `apps/web/lib/storage.ts` | Firebase Storage upload/download utilities |
| `apps/web/lib/editor-utils.ts` | Helpers: FEN→MiniBoard pieces, content preview extraction |

### Modified Files

| File | What Changes |
|------|-------------|
| `packages/shared/src/types.ts` | Add `TiptapDocument` type, update `ForumPost.content` to `TiptapDocument \| string`, add `contentPreview` field |
| `apps/web/lib/forum.ts` | Switch to `setDoc` with pre-generated IDs, accept `TiptapDocument` content, store `contentPreview` |
| `apps/web/app/community/new/page.tsx` | Replace textarea with `RichTextEditor`, pre-generate post ID, handle rich content submission |
| `apps/web/app/community/[id]/page.tsx` | Replace `{post.content}` with `RichTextViewer`, handle both legacy string and new JSON content |
| `apps/web/app/community/page.tsx` | Use `contentPreview` for listing excerpts (fallback to `content` string for old posts) |
| `apps/web/package.json` | Add Tiptap dependencies |
| `storage.rules` (new) | Add Firebase Storage rules for post images |

---

## Task 1: Install Tiptap Dependencies

**Files:**
- Modify: `apps/web/package.json`

- [ ] **Step 1: Install Tiptap packages**

Run from repo root:
```bash
cd apps/web && pnpm add @tiptap/react @tiptap/starter-kit @tiptap/pm @tiptap/extension-link
```

- [ ] **Step 2: Verify installation**

```bash
cd apps/web && pnpm ls @tiptap/react @tiptap/starter-kit @tiptap/extension-link
```
Expected: all packages listed with versions.

- [ ] **Step 3: Verify build still works**

```bash
pnpm web:build
```
Expected: build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add apps/web/package.json apps/web/pnpm-lock.yaml pnpm-lock.yaml
git commit -m "feat: add Tiptap editor dependencies"
```

---

## Task 2: Update Shared Types

**Files:**
- Modify: `packages/shared/src/types.ts`

- [ ] **Step 1: Add TiptapDocument type and update ForumPost**

In `packages/shared/src/types.ts`, add the `TiptapDocument` type and update `ForumPost`:

```typescript
// Add after the existing imports/types at line 1:
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
```

Update the `ForumPost` interface (currently lines 34-45):
```typescript
export interface ForumPost {
  id: string;
  title: string;
  /** Rich content (TiptapDocument) for new posts, plain string for legacy posts */
  content: TiptapDocument | string;
  /** Plain text excerpt for listing pages */
  contentPreview?: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  commentCount: number;
  likes: number;
  createdAt: number;
  updatedAt: number;
}
```

- [ ] **Step 2: Build shared package**

```bash
pnpm shared:build
```
Expected: builds successfully.

- [ ] **Step 3: Commit**

```bash
git add packages/shared/src/types.ts
git commit -m "feat: add TiptapDocument type and update ForumPost for rich content"
```

---

## Task 3: Editor Utilities — FEN Parser and Content Preview

**Files:**
- Create: `apps/web/lib/editor-utils.ts`

- [ ] **Step 1: Create editor-utils.ts with FEN-to-pieces parser and content preview extractor**

The `MiniBoard` component (at `apps/web/components/chess-board/MiniBoard.tsx`) expects `pieces: { type: string; color: "w" | "b"; row: number; col: number }[]`. We need a function to convert a FEN string to this format. We also need a function to extract plain text from a Tiptap JSON document for the `contentPreview` field.

Create `apps/web/lib/editor-utils.ts`:

```typescript
interface MiniBoardPiece {
  type: string;
  color: "w" | "b";
  row: number;
  col: number;
}

const FEN_PIECE_MAP: Record<string, { type: string; color: "w" | "b" }> = {
  K: { type: "k", color: "w" },
  Q: { type: "q", color: "w" },
  R: { type: "r", color: "w" },
  B: { type: "b", color: "w" },
  N: { type: "n", color: "w" },
  P: { type: "p", color: "w" },
  k: { type: "k", color: "b" },
  q: { type: "q", color: "b" },
  r: { type: "r", color: "b" },
  b: { type: "b", color: "b" },
  n: { type: "n", color: "b" },
  p: { type: "p", color: "b" },
};

export function fenToPieces(fen: string): MiniBoardPiece[] {
  const pieces: MiniBoardPiece[] = [];
  const placement = fen.split(" ")[0];
  const ranks = placement.split("/");

  for (let rankIdx = 0; rankIdx < ranks.length; rankIdx++) {
    let col = 0;
    for (const ch of ranks[rankIdx]) {
      if (ch >= "1" && ch <= "8") {
        col += parseInt(ch);
      } else {
        const mapped = FEN_PIECE_MAP[ch];
        if (mapped) {
          pieces.push({ type: mapped.type, color: mapped.color, row: rankIdx, col });
        }
        col++;
      }
    }
  }

  return pieces;
}

interface TiptapNodeLike {
  type: string;
  content?: TiptapNodeLike[];
  text?: string;
}

export function extractPlainText(node: TiptapNodeLike): string {
  if (node.text) return node.text;
  if (!node.content) return "";
  return node.content.map((child) => extractPlainText(child)).join(" ");
}

export function generateContentPreview(doc: TiptapNodeLike): string {
  const text = extractPlainText(doc).replace(/\s+/g, " ").trim();
  if (text.length <= 200) return text;
  return text.substring(0, 197) + "...";
}
```

- [ ] **Step 2: Verify the web app still compiles**

```bash
pnpm web:build
```
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add apps/web/lib/editor-utils.ts
git commit -m "feat: add FEN-to-pieces parser and content preview extractor"
```

---

## Task 4: Firebase Storage Utilities

**Files:**
- Create: `apps/web/lib/storage.ts`
- Modify: `apps/web/lib/firebase.ts`

- [ ] **Step 1: Add Firebase Storage export to firebase.ts**

In `apps/web/lib/firebase.ts` (currently 18 lines), add the Storage import and export. After the existing `auth` and `db` exports:

```typescript
import { getStorage } from "firebase/storage";
// ... existing code ...
export const storage = getStorage(app);
```

- [ ] **Step 2: Create storage.ts with upload utility**

Create `apps/web/lib/storage.ts`:

```typescript
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

/**
 * Upload an image file to Firebase Storage for a post.
 * Returns { downloadUrl, unsubscribe } where unsubscribe stops the upload.
 */
export function uploadPostImage(
  postId: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  const filename = `${crypto.randomUUID()}-${file.name}`;
  const storageRef = ref(storage, `posts/${postId}/images/${filename}`);
  const task = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    task.on(
      "state_changed",
      (snapshot) => {
        const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(percent);
      },
      (error) => reject(error),
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve(url);
      }
    );
  });
}

/**
 * Resize an image file if it exceeds maxWidth.
 * Returns the resized file (or original if no resize needed).
 */
export function resizeImage(file: File, maxWidth = 1200): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      if (img.width <= maxWidth) {
        resolve(file);
        return;
      }
      const ratio = maxWidth / img.width;
      const canvas = document.createElement("canvas");
      canvas.width = maxWidth;
      canvas.height = Math.round(img.height * ratio);
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: file.type }));
          } else {
            resolve(file);
          }
        },
        file.type,
        0.9
      );
    };
    img.src = URL.createObjectURL(file);
  });
}
```

- [ ] **Step 3: Verify build**

```bash
pnpm web:build
```
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add apps/web/lib/firebase.ts apps/web/lib/storage.ts
git commit -m "feat: add Firebase Storage utilities for post image uploads"
```

---

## Task 5: Update Forum Library for Rich Content

**Files:**
- Modify: `apps/web/lib/forum.ts`

- [ ] **Step 1: Update forum.ts to support rich content**

Key changes to `apps/web/lib/forum.ts`:
1. Import `doc` (already imported), add `setDoc` import
2. Change `PostDoc.content` type from `string` to `object | string`
3. Add `contentPreview` field to `PostDoc`
4. Update `createPost` to accept a pre-generated `id`, use `setDoc`, accept `TiptapDocument` content
5. Update `docToPost` to pass through `contentPreview`

Replace the full file with:

```typescript
import {
  collection,
  doc,
  addDoc,
  setDoc,
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
import type { ForumPost, ForumComment, TiptapDocument } from "@medieval-chess/shared/types";

const POSTS_COLLECTION = "posts";

interface PostDoc {
  title: string;
  content: TiptapDocument | string;
  contentPreview?: string;
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
    contentPreview: data.contentPreview,
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

/**
 * Generate a new post document reference (pre-generates an ID).
 * Call this before uploading images so they can use the postId path.
 */
export function generatePostId(): string {
  return doc(collection(db, POSTS_COLLECTION)).id;
}

/**
 * Create a post with a pre-generated ID (from generatePostId).
 * Uses setDoc instead of addDoc.
 */
export async function createPost(post: {
  id: string;
  title: string;
  content: TiptapDocument | string;
  contentPreview?: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
}): Promise<string> {
  const { id, ...data } = post;
  await setDoc(doc(db, POSTS_COLLECTION, id), {
    ...data,
    commentCount: 0,
    likes: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return id;
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
```

- [ ] **Step 2: Verify build**

```bash
pnpm web:build
```
Expected: may have type errors in `community/new/page.tsx` since `createPost` signature changed — that's expected and will be fixed in Task 9.

- [ ] **Step 3: Commit**

```bash
git add apps/web/lib/forum.ts
git commit -m "feat: update forum library for rich content with pre-generated post IDs"
```

---

## Task 6: Tiptap Custom Extensions — Chess Position Node

**Files:**
- Create: `apps/web/components/editor/extensions/chess-position.ts`
- Create: `apps/web/components/editor/nodes/ChessPositionView.tsx`

- [ ] **Step 1: Create the chess position Tiptap extension**

Create `apps/web/components/editor/extensions/chess-position.ts`:

```typescript
import { Node, mergeAttributes } from "@tiptap/react";
import { ReactNodeViewRenderer } from "@tiptap/react";
import ChessPositionView from "../nodes/ChessPositionView";

export const ChessPositionExtension = Node.create({
  name: "chessPosition",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      fen: {
        default: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="chess-position"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "chess-position" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ChessPositionView);
  },
});
```

- [ ] **Step 2: Create the chess position React view component**

Create `apps/web/components/editor/nodes/ChessPositionView.tsx`:

```typescript
"use client";

import { NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import MiniBoard from "@/components/chess-board/MiniBoard";
import { fenToPieces } from "@/lib/editor-utils";

export default function ChessPositionView({ node, editor }: NodeViewProps) {
  const fen = node.attrs.fen as string;
  const pieces = fenToPieces(fen);
  const isEditable = editor.isEditable;

  return (
    <NodeViewWrapper className="my-4">
      <div
        className="inline-flex flex-col items-center p-4 rounded-lg"
        style={{
          backgroundColor: "rgba(255,255,255,0.5)",
          border: "2px solid var(--color-gold)",
        }}
      >
        <MiniBoard pieces={pieces} highlights={[]} squareSize={40} />
        {isEditable && (
          <div className="mt-2 text-xs" style={{ color: "var(--color-ink-light)" }}>
            {fen.split(" ")[0].substring(0, 30)}...
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
pnpm web:build
```
Expected: build succeeds (components not yet imported anywhere).

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/editor/extensions/chess-position.ts apps/web/components/editor/nodes/ChessPositionView.tsx
git commit -m "feat: add chess position Tiptap custom node extension"
```

---

## Task 7: Tiptap Custom Extensions — Puzzle Embed Node

**Files:**
- Create: `apps/web/components/editor/extensions/puzzle-embed.ts`
- Create: `apps/web/components/editor/nodes/PuzzleEmbedView.tsx`

- [ ] **Step 1: Create the puzzle embed Tiptap extension**

Create `apps/web/components/editor/extensions/puzzle-embed.ts`:

```typescript
import { Node, mergeAttributes } from "@tiptap/react";
import { ReactNodeViewRenderer } from "@tiptap/react";
import PuzzleEmbedView from "../nodes/PuzzleEmbedView";

export const PuzzleEmbedExtension = Node.create({
  name: "puzzleEmbed",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      puzzleId: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="puzzle-embed"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "puzzle-embed" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(PuzzleEmbedView);
  },
});
```

- [ ] **Step 2: Create the puzzle embed React view component**

This component fetches puzzle metadata and renders a card. Create `apps/web/components/editor/nodes/PuzzleEmbedView.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";
import { NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { getPuzzle } from "@/lib/puzzles";
import MiniBoard from "@/components/chess-board/MiniBoard";
import { fenToPieces } from "@/lib/editor-utils";
import type { Puzzle } from "@medieval-chess/shared/types";

export default function PuzzleEmbedView({ node }: NodeViewProps) {
  const puzzleId = node.attrs.puzzleId as string;
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!puzzleId) return;
    getPuzzle(puzzleId)
      .then(setPuzzle)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [puzzleId]);

  if (loading) {
    return (
      <NodeViewWrapper className="my-4">
        <div
          className="rounded-lg p-4 text-sm"
          style={{ backgroundColor: "rgba(255,255,255,0.4)", color: "var(--color-ink-light)" }}
        >
          Loading puzzle...
        </div>
      </NodeViewWrapper>
    );
  }

  if (!puzzle) {
    return (
      <NodeViewWrapper className="my-4">
        <div
          className="rounded-lg p-4 text-sm"
          style={{ backgroundColor: "rgba(255,255,255,0.4)", color: "var(--color-ink-light)" }}
        >
          Puzzle not found
        </div>
      </NodeViewWrapper>
    );
  }

  const pieces = fenToPieces(puzzle.fen);
  const stars = "★".repeat(puzzle.difficulty) + "☆".repeat(5 - puzzle.difficulty);

  return (
    <NodeViewWrapper className="my-4">
      <a
        href={`/puzzles/${puzzle.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-4 rounded-lg p-4 hover:shadow-md transition-shadow no-underline"
        style={{
          backgroundColor: "rgba(255,255,255,0.5)",
          border: "2px solid var(--color-wood)",
        }}
        contentEditable={false}
      >
        <div className="flex-shrink-0">
          <MiniBoard pieces={pieces} highlights={[]} squareSize={24} size={8} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm" style={{ color: "var(--color-wood-dark)" }}>
            {puzzle.title}
          </div>
          <div className="text-xs mt-1" style={{ color: "var(--color-ink-light)" }}>
            {stars} · by {puzzle.authorName}
          </div>
          <div
            className="mt-2 inline-block px-3 py-1 rounded text-xs font-medium"
            style={{ backgroundColor: "var(--color-gold)", color: "var(--color-ink)" }}
          >
            Try this puzzle →
          </div>
        </div>
      </a>
    </NodeViewWrapper>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
pnpm web:build
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/editor/extensions/puzzle-embed.ts apps/web/components/editor/nodes/PuzzleEmbedView.tsx
git commit -m "feat: add puzzle embed Tiptap custom node extension"
```

---

## Task 8: Tiptap Custom Extensions — Image Upload Node

**Files:**
- Create: `apps/web/components/editor/extensions/image-upload.ts`
- Create: `apps/web/components/editor/nodes/ImageUploadView.tsx`

- [ ] **Step 1: Create the image upload Tiptap extension**

Create `apps/web/components/editor/extensions/image-upload.ts`:

```typescript
import { Node, mergeAttributes } from "@tiptap/react";
import { ReactNodeViewRenderer } from "@tiptap/react";
import ImageUploadView from "../nodes/ImageUploadView";

export const ImageUploadExtension = Node.create({
  name: "image",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: "" },
      uploading: { default: false },
      progress: { default: 0 },
    };
  },

  parseHTML() {
    return [{ tag: "img[src]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["img", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageUploadView);
  },
});
```

- [ ] **Step 2: Create the image upload React view component**

Create `apps/web/components/editor/nodes/ImageUploadView.tsx`:

```typescript
"use client";

import { NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import NextImage from "next/image";

export default function ImageUploadView({ node }: NodeViewProps) {
  const { src, alt, uploading, progress } = node.attrs;

  if (uploading) {
    return (
      <NodeViewWrapper className="my-4">
        <div
          className="rounded-lg p-6 flex flex-col items-center gap-2"
          style={{
            backgroundColor: "rgba(255,255,255,0.4)",
            border: "2px dashed var(--color-wood)",
          }}
        >
          <div className="text-sm" style={{ color: "var(--color-ink-light)" }}>
            Uploading image...
          </div>
          <div
            className="w-48 h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: "rgba(139, 94, 60, 0.2)" }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${progress}%`,
                backgroundColor: "var(--color-gold)",
              }}
            />
          </div>
          <div className="text-xs" style={{ color: "var(--color-ink-light)" }}>
            {Math.round(progress)}%
          </div>
        </div>
      </NodeViewWrapper>
    );
  }

  if (!src) {
    return (
      <NodeViewWrapper className="my-4">
        <div
          className="rounded-lg p-6 text-center text-sm"
          style={{
            backgroundColor: "rgba(255,255,255,0.4)",
            border: "2px dashed var(--color-wood)",
            color: "var(--color-ink-light)",
          }}
        >
          No image
        </div>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper className="my-4">
      <div className="rounded-lg overflow-hidden inline-block" style={{ border: "1px solid rgba(139, 94, 60, 0.2)" }}>
        <img
          src={src}
          alt={alt || ""}
          className="max-w-full h-auto"
          style={{ maxHeight: 500 }}
        />
      </div>
    </NodeViewWrapper>
  );
}
```

Note: We use a plain `<img>` tag here instead of `next/image` because the src is a dynamic Firebase Storage URL that may not be in the configured image domains.

- [ ] **Step 3: Verify build**

```bash
pnpm web:build
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/editor/extensions/image-upload.ts apps/web/components/editor/nodes/ImageUploadView.tsx
git commit -m "feat: add image upload Tiptap custom node extension"
```

---

## Task 9: Editor Toolbar Component

**Files:**
- Create: `apps/web/components/editor/EditorToolbar.tsx`

- [ ] **Step 1: Create EditorToolbar component**

The toolbar provides formatting buttons and insert buttons. It receives the Tiptap editor instance and callbacks for opening modals.

Create `apps/web/components/editor/EditorToolbar.tsx`:

```typescript
"use client";

import type { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link,
  ImageIcon,
  Grid3x3,
  Puzzle,
} from "lucide-react";

interface EditorToolbarProps {
  editor: Editor;
  onInsertImage: () => void;
  onInsertChessPosition: () => void;
  onInsertPuzzle: () => void;
}

function ToolbarButton({
  active,
  onClick,
  children,
  title,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="p-1.5 rounded cursor-pointer transition-colors"
      style={{
        backgroundColor: active ? "var(--color-gold)" : "transparent",
        color: active ? "var(--color-ink)" : "var(--color-ink-light)",
      }}
    >
      {children}
    </button>
  );
}

function Divider() {
  return (
    <div
      className="w-px h-5 mx-1"
      style={{ backgroundColor: "rgba(139, 94, 60, 0.3)" }}
    />
  );
}

export default function EditorToolbar({
  editor,
  onInsertImage,
  onInsertChessPosition,
  onInsertPuzzle,
}: EditorToolbarProps) {
  const setLink = () => {
    const url = window.prompt("Enter URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div
      className="flex items-center gap-0.5 p-2 rounded-t-lg flex-wrap"
      style={{
        backgroundColor: "rgba(139, 94, 60, 0.1)",
        borderBottom: "1px solid rgba(139, 94, 60, 0.2)",
      }}
    >
      <ToolbarButton
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold"
      >
        <Bold size={16} />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic"
      >
        <Italic size={16} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        title="Heading 2"
      >
        <Heading2 size={16} />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        title="Heading 3"
      >
        <Heading3 size={16} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="Bullet List"
      >
        <List size={16} />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        title="Numbered List"
      >
        <ListOrdered size={16} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        active={editor.isActive("link")}
        onClick={setLink}
        title="Insert Link"
      >
        <Link size={16} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton onClick={onInsertImage} title="Insert Image">
        <ImageIcon size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={onInsertChessPosition} title="Insert Chess Position">
        <Grid3x3 size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={onInsertPuzzle} title="Insert Puzzle">
        <Puzzle size={16} />
      </ToolbarButton>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
pnpm web:build
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/editor/EditorToolbar.tsx
git commit -m "feat: add editor toolbar with formatting and insert buttons"
```

---

## Task 10: Chess Position Modal

**Files:**
- Create: `apps/web/components/editor/modals/ChessPositionModal.tsx`

- [ ] **Step 1: Create ChessPositionModal component**

Two-tab modal: "Board Setup" (interactive ChessBoard) and "Paste FEN" (text input + MiniBoard preview). The existing puzzle creation page (`apps/web/app/puzzles/new/page.tsx`) already uses `ChessBoard` in a similar FEN-editing pattern (lines 32-44, 153-188) — follow that approach.

Create `apps/web/components/editor/modals/ChessPositionModal.tsx`:

The existing puzzle creation page (`apps/web/app/puzzles/new/page.tsx`) uses `ChessBoard` with a FEN input + live preview pattern (lines 32-44, 153-188). We follow the same approach for the "Board Setup" tab, reusing `ChessBoard` in non-interactive mode with a FEN input that updates the board. The "Paste FEN" tab is a simple text input with MiniBoard preview.

```typescript
"use client";

import { useState, useCallback, useMemo } from "react";
import ChessBoard from "@/components/chess-board/ChessBoard";
import MiniBoard from "@/components/chess-board/MiniBoard";
import { fenToPieces } from "@/lib/editor-utils";
import { MedievalChess } from "@medieval-chess/engine";

const DEFAULT_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

interface ChessPositionModalProps {
  onInsert: (fen: string) => void;
  onClose: () => void;
}

export default function ChessPositionModal({ onInsert, onClose }: ChessPositionModalProps) {
  const [tab, setTab] = useState<"board" | "paste">("board");
  const [fen, setFen] = useState(DEFAULT_FEN);
  const [fenInput, setFenInput] = useState(DEFAULT_FEN);
  const [boardFen, setBoardFen] = useState(DEFAULT_FEN);

  // Game instance for the board setup tab
  const game = useMemo(() => {
    const g = new MedievalChess();
    g.loadFen(boardFen);
    return g;
  }, [boardFen]);

  const handleFenInputChange = useCallback((value: string) => {
    setFenInput(value);
    const placement = value.split(" ")[0];
    const ranks = placement.split("/");
    if (ranks.length === 8) {
      setFen(value);
    }
  }, []);

  const handleBoardFenChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBoardFen(value);
    setFen(value);
  }, []);

  const handleMove = useCallback(
    (from: { row: number; col: number }, to: { row: number; col: number }) => {
      try {
        game.move({ from, to });
        const newFen = game.fen();
        setBoardFen(newFen);
        setFen(newFen);
      } catch {
        // Invalid move, ignore
      }
    },
    [game]
  );

  const handleReset = useCallback(() => {
    setBoardFen(DEFAULT_FEN);
    setFen(DEFAULT_FEN);
  }, []);

  const pieces = fenToPieces(fen);

  const tabStyle = (active: boolean) => ({
    padding: "8px 16px",
    fontSize: "13px",
    fontWeight: active ? ("600" as const) : ("400" as const),
    background: "none",
    border: "none",
    borderBottom: active ? "2px solid var(--color-gold)" : "2px solid transparent",
    color: active ? "var(--color-wood-dark)" : "var(--color-ink-light)",
    cursor: "pointer" as const,
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: "var(--color-parchment)", border: "2px solid var(--color-wood)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(139, 94, 60, 0.2)" }}>
          <h3 className="font-semibold" style={{ color: "var(--color-wood-dark)" }}>
            Insert Chess Position
          </h3>
          <button onClick={onClose} className="text-lg cursor-pointer" style={{ color: "var(--color-ink-light)" }}>
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex" style={{ borderBottom: "1px solid rgba(139, 94, 60, 0.2)" }}>
          <button style={tabStyle(tab === "board")} onClick={() => setTab("board")}>
            Board Setup
          </button>
          <button style={tabStyle(tab === "paste")} onClick={() => setTab("paste")}>
            Paste FEN
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {tab === "board" ? (
            <>
              <p className="text-xs mb-3" style={{ color: "var(--color-ink-light)" }}>
                Make moves on the board to reach the position you want to share. Use the FEN field below to set a custom starting position.
              </p>
              <div className="flex justify-center mb-3">
                <ChessBoard game={game} onMove={handleMove} interactive={true} />
              </div>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={boardFen}
                  onChange={handleBoardFenChange}
                  className="flex-1 px-3 py-2 rounded text-xs font-mono"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.6)",
                    border: "1px solid rgba(139, 94, 60, 0.3)",
                    color: "var(--color-ink)",
                  }}
                />
                <button
                  onClick={handleReset}
                  className="px-3 py-2 rounded text-xs cursor-pointer"
                  style={{
                    backgroundColor: "rgba(139, 94, 60, 0.15)",
                    color: "var(--color-wood-dark)",
                  }}
                >
                  Reset
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-4">
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--color-wood-dark)" }}>
                  FEN String
                </label>
                <input
                  type="text"
                  value={fenInput}
                  onChange={(e) => handleFenInputChange(e.target.value)}
                  className="w-full px-3 py-2 rounded text-sm font-mono"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.6)",
                    border: "1px solid rgba(139, 94, 60, 0.3)",
                    color: "var(--color-ink)",
                  }}
                  placeholder="Paste FEN string here..."
                />
              </div>
              <div className="flex justify-center mb-4">
                <MiniBoard pieces={pieces} highlights={[]} squareSize={40} />
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 flex justify-end gap-2" style={{ borderTop: "1px solid rgba(139, 94, 60, 0.2)" }}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded text-sm cursor-pointer"
            style={{ backgroundColor: "rgba(139, 94, 60, 0.15)", color: "var(--color-wood-dark)" }}
          >
            Cancel
          </button>
          <button
            onClick={() => onInsert(fen)}
            className="px-4 py-2 rounded text-sm font-medium cursor-pointer"
            style={{ backgroundColor: "var(--color-wood-dark)", color: "var(--color-parchment)" }}
          >
            Insert Position
          </button>
        </div>
      </div>
    </div>
  );
}
```

Note: The Board Setup tab uses ChessBoard for making moves to reach a desired position. The ChessBoard component props (`game`, `onMove`, `interactive`) follow the same pattern used in `apps/web/app/puzzles/new/page.tsx`. The exact ChessBoard prop interface may need minor adjustments based on how the component accepts the game instance — check the actual ChessBoard props and adapt accordingly during implementation.

- [ ] **Step 2: Verify build**

```bash
pnpm web:build
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/editor/modals/ChessPositionModal.tsx
git commit -m "feat: add chess position insertion modal with FEN paste and preview"
```

---

## Task 11: Puzzle Picker Modal

**Files:**
- Create: `apps/web/components/editor/modals/PuzzlePickerModal.tsx`

- [ ] **Step 1: Create PuzzlePickerModal component**

Uses `listPuzzles()` from `apps/web/lib/puzzles.ts` (lines 79-100) to fetch puzzles. Supports difficulty filtering and title search.

Create `apps/web/components/editor/modals/PuzzlePickerModal.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";
import { listPuzzles } from "@/lib/puzzles";
import MiniBoard from "@/components/chess-board/MiniBoard";
import { fenToPieces } from "@/lib/editor-utils";
import type { Puzzle } from "@medieval-chess/shared/types";

interface PuzzlePickerModalProps {
  onInsert: (puzzleId: string) => void;
  onClose: () => void;
}

export default function PuzzlePickerModal({ onInsert, onClose }: PuzzlePickerModalProps) {
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<number | undefined>();
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    listPuzzles({ difficulty, maxResults: 50 })
      .then(setPuzzles)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [difficulty]);

  const filtered = puzzles.filter(
    (p) => !search || p.title.toLowerCase().includes(search.toLowerCase())
  );

  const inputStyle = {
    backgroundColor: "rgba(255,255,255,0.6)",
    border: "1px solid rgba(139, 94, 60, 0.3)",
    color: "var(--color-ink)",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="rounded-lg w-full max-w-lg max-h-[80vh] flex flex-col"
        style={{ backgroundColor: "var(--color-parchment)", border: "2px solid var(--color-wood)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(139, 94, 60, 0.2)" }}>
          <h3 className="font-semibold" style={{ color: "var(--color-wood-dark)" }}>
            Insert Puzzle
          </h3>
          <button
            onClick={onClose}
            className="text-lg cursor-pointer"
            style={{ color: "var(--color-ink-light)" }}
          >
            ✕
          </button>
        </div>

        {/* Search & Filter */}
        <div className="p-4 flex gap-2" style={{ borderBottom: "1px solid rgba(139, 94, 60, 0.2)" }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search puzzles..."
            className="flex-1 px-3 py-2 rounded text-sm"
            style={inputStyle}
          />
          <select
            value={difficulty || ""}
            onChange={(e) => setDifficulty(e.target.value ? Number(e.target.value) : undefined)}
            className="px-3 py-2 rounded text-sm"
            style={inputStyle}
          >
            <option value="">All difficulties</option>
            {[1, 2, 3, 4, 5].map((d) => (
              <option key={d} value={d}>
                {"★".repeat(d)}{"☆".repeat(5 - d)}
              </option>
            ))}
          </select>
        </div>

        {/* Puzzle List */}
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <p className="text-center p-4 text-sm" style={{ color: "var(--color-ink-light)" }}>
              Loading puzzles...
            </p>
          ) : filtered.length === 0 ? (
            <p className="text-center p-4 text-sm" style={{ color: "var(--color-ink-light)" }}>
              No puzzles found.
            </p>
          ) : (
            <div className="space-y-1">
              {filtered.map((puzzle) => {
                const isSelected = selected === puzzle.id;
                return (
                  <button
                    key={puzzle.id}
                    onClick={() => setSelected(puzzle.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg text-left cursor-pointer transition-colors"
                    style={{
                      backgroundColor: isSelected ? "rgba(201, 168, 76, 0.2)" : "transparent",
                      border: isSelected ? "1px solid var(--color-gold)" : "1px solid transparent",
                    }}
                  >
                    <div className="flex-shrink-0">
                      <MiniBoard pieces={fenToPieces(puzzle.fen)} highlights={[]} squareSize={16} size={8} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate" style={{ color: "var(--color-wood-dark)" }}>
                        {puzzle.title}
                      </div>
                      <div className="text-xs" style={{ color: "var(--color-ink-light)" }}>
                        {"★".repeat(puzzle.difficulty)}{"☆".repeat(5 - puzzle.difficulty)} · {puzzle.authorName}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 flex justify-end gap-2" style={{ borderTop: "1px solid rgba(139, 94, 60, 0.2)" }}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded text-sm cursor-pointer"
            style={{
              backgroundColor: "rgba(139, 94, 60, 0.15)",
              color: "var(--color-wood-dark)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => selected && onInsert(selected)}
            disabled={!selected}
            className="px-4 py-2 rounded text-sm font-medium cursor-pointer disabled:opacity-50"
            style={{
              backgroundColor: "var(--color-wood-dark)",
              color: "var(--color-parchment)",
            }}
          >
            Insert Puzzle
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
pnpm web:build
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/editor/modals/PuzzlePickerModal.tsx
git commit -m "feat: add puzzle picker modal with search and difficulty filter"
```

---

## Task 12: RichTextEditor Component

**Files:**
- Create: `apps/web/components/editor/RichTextEditor.tsx`

- [ ] **Step 1: Create the main RichTextEditor component**

This is the main editor component that wires together Tiptap, the toolbar, custom extensions, modals, and image upload logic.

Create `apps/web/components/editor/RichTextEditor.tsx`:

```typescript
"use client";

import { useState, useCallback, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import type { JSONContent } from "@tiptap/react";
import EditorToolbar from "./EditorToolbar";
import { ChessPositionExtension } from "./extensions/chess-position";
import { PuzzleEmbedExtension } from "./extensions/puzzle-embed";
import { ImageUploadExtension } from "./extensions/image-upload";
import ChessPositionModal from "./modals/ChessPositionModal";
import PuzzlePickerModal from "./modals/PuzzlePickerModal";
import { uploadPostImage, resizeImage } from "@/lib/storage";

interface RichTextEditorProps {
  postId: string;
  onChange: (content: JSONContent) => void;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export default function RichTextEditor({ postId, onChange }: RichTextEditorProps) {
  const [showChessModal, setShowChessModal] = useState(false);
  const [showPuzzleModal, setShowPuzzleModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      LinkExtension.configure({
        openOnClick: false,
      }),
      ChessPositionExtension,
      PuzzleEmbedExtension,
      ImageUploadExtension,
    ],
    content: {
      type: "doc",
      content: [{ type: "paragraph" }],
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4",
      },
    },
  });

  const handleInsertChessPosition = useCallback(
    (fen: string) => {
      if (!editor) return;
      editor.chain().focus().insertContent({ type: "chessPosition", attrs: { fen } }).run();
      setShowChessModal(false);
    },
    [editor]
  );

  const handleInsertPuzzle = useCallback(
    (puzzleId: string) => {
      if (!editor) return;
      editor.chain().focus().insertContent({ type: "puzzleEmbed", attrs: { puzzleId } }).run();
      setShowPuzzleModal(false);
    },
    [editor]
  );

  const handleImageUpload = useCallback(async () => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelected = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editor) return;

      if (file.size > MAX_IMAGE_SIZE) {
        alert("Image must be smaller than 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      // Insert placeholder node
      editor
        .chain()
        .focus()
        .insertContent({
          type: "image",
          attrs: { src: null, uploading: true, progress: 0 },
        })
        .run();

      try {
        const resized = await resizeImage(file);
        const url = await uploadPostImage(postId, resized, (percent) => {
          // Find and update the uploading node's progress
          const { state } = editor;
          state.doc.descendants((node, pos) => {
            if (node.type.name === "image" && node.attrs.uploading) {
              editor.view.dispatch(
                state.tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  progress: percent,
                })
              );
              return false;
            }
          });
        });

        // Replace the uploading node with the final image
        const { state } = editor;
        state.doc.descendants((node, pos) => {
          if (node.type.name === "image" && node.attrs.uploading) {
            editor.view.dispatch(
              state.tr.setNodeMarkup(pos, undefined, {
                src: url,
                alt: file.name,
                uploading: false,
                progress: 100,
              })
            );
            return false;
          }
        });
      } catch (err) {
        console.error("Image upload failed:", err);
        // Remove the failed upload node
        const { state } = editor;
        state.doc.descendants((node, pos) => {
          if (node.type.name === "image" && node.attrs.uploading) {
            editor.view.dispatch(state.tr.delete(pos, pos + node.nodeSize));
            return false;
          }
        });
      }

      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [editor, postId]
  );

  if (!editor) return null;

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        border: "1px solid rgba(139, 94, 60, 0.3)",
        backgroundColor: "rgba(255,255,255,0.6)",
      }}
    >
      <EditorToolbar
        editor={editor}
        onInsertImage={handleImageUpload}
        onInsertChessPosition={() => setShowChessModal(true)}
        onInsertPuzzle={() => setShowPuzzleModal(true)}
      />
      <div style={{ color: "var(--color-ink)" }}>
        <EditorContent editor={editor} />
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelected}
      />
      {showChessModal && (
        <ChessPositionModal
          onInsert={handleInsertChessPosition}
          onClose={() => setShowChessModal(false)}
        />
      )}
      {showPuzzleModal && (
        <PuzzlePickerModal
          onInsert={handleInsertPuzzle}
          onClose={() => setShowPuzzleModal(false)}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
pnpm web:build
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/editor/RichTextEditor.tsx
git commit -m "feat: add RichTextEditor component wiring Tiptap with custom nodes and modals"
```

---

## Task 13: RichTextViewer Component

**Files:**
- Create: `apps/web/components/editor/RichTextViewer.tsx`

- [ ] **Step 1: Create read-only viewer component**

Create `apps/web/components/editor/RichTextViewer.tsx`:

```typescript
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import type { JSONContent } from "@tiptap/react";
import { ChessPositionExtension } from "./extensions/chess-position";
import { PuzzleEmbedExtension } from "./extensions/puzzle-embed";
import { ImageUploadExtension } from "./extensions/image-upload";

interface RichTextViewerProps {
  content: JSONContent;
}

export default function RichTextViewer({ content }: RichTextViewerProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      LinkExtension,
      ChessPositionExtension,
      PuzzleEmbedExtension,
      ImageUploadExtension,
    ],
    content,
    editable: false,
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none",
      },
    },
  });

  if (!editor) return null;

  return (
    <div style={{ color: "var(--color-ink)" }}>
      <EditorContent editor={editor} />
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
pnpm web:build
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/editor/RichTextViewer.tsx
git commit -m "feat: add RichTextViewer component for read-only rich content display"
```

---

## Task 14: Update Create Post Page

**Files:**
- Modify: `apps/web/app/community/new/page.tsx`

- [ ] **Step 1: Replace textarea with RichTextEditor**

Rewrite `apps/web/app/community/new/page.tsx` to:
1. Pre-generate a post ID using `generatePostId()` (from `lib/forum.ts`)
2. Replace the `content` textarea with `RichTextEditor`
3. Pass rich content (Tiptap JSON) to `createPost`
4. Generate `contentPreview` before saving

Full replacement for the file:

```typescript
"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { createPost, generatePostId } from "@/lib/forum";
import { generateContentPreview } from "@/lib/editor-utils";
import RichTextEditor from "@/components/editor/RichTextEditor";
import type { JSONContent } from "@tiptap/react";
import type { TiptapDocument } from "@medieval-chess/shared/types";

export default function NewPostPage() {
  const { user } = useAuth();
  const router = useRouter();
  const postId = useMemo(() => generatePostId(), []);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState<JSONContent | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user || !title.trim() || !content) return;

      setSubmitting(true);
      try {
        const contentPreview = generateContentPreview(content as TiptapDocument);
        await createPost({
          id: postId,
          title: title.trim(),
          content: content as TiptapDocument,
          contentPreview,
          authorId: user.uid,
          authorName: user.displayName || "Anonymous",
          authorAvatarUrl: user.photoURL || undefined,
        });
        router.push(`/community/${postId}`);
      } catch (err) {
        console.error("Failed to create post:", err);
        setSubmitting(false);
      }
    },
    [user, title, content, router, postId]
  );

  if (!user) {
    return (
      <main
        className="min-h-screen p-8 flex items-center justify-center"
        style={{ backgroundColor: "var(--color-parchment)" }}
      >
        <p style={{ color: "var(--color-ink-light)" }}>
          Please sign in to create posts.
        </p>
      </main>
    );
  }

  const inputStyle = {
    backgroundColor: "rgba(255,255,255,0.6)",
    border: "1px solid rgba(139, 94, 60, 0.3)",
    color: "var(--color-ink)",
  };

  return (
    <main
      className="min-h-screen p-4 md:p-8"
      style={{ backgroundColor: "var(--color-parchment)" }}
    >
      <div className="max-w-2xl mx-auto">
        <h1
          className="text-3xl font-bold mb-6"
          style={{ color: "var(--color-wood-dark)" }}
        >
          New Post
        </h1>

        <form
          onSubmit={handleSubmit}
          className="rounded-lg p-6 space-y-4"
          style={{
            backgroundColor: "rgba(255,255,255,0.5)",
            border: "1px solid rgba(139, 94, 60, 0.2)",
          }}
        >
          <div>
            <label
              className="text-xs font-medium block mb-1"
              style={{ color: "var(--color-wood-dark)" }}
            >
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded text-sm"
              style={inputStyle}
              placeholder="What's on your mind?"
              required
            />
          </div>

          <div>
            <label
              className="text-xs font-medium block mb-1"
              style={{ color: "var(--color-wood-dark)" }}
            >
              Content
            </label>
            <RichTextEditor postId={postId} onChange={setContent} />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 rounded text-sm font-medium cursor-pointer"
              style={{
                backgroundColor: "rgba(139, 94, 60, 0.15)",
                color: "var(--color-wood-dark)",
                border: "1px solid rgba(139, 94, 60, 0.3)",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim() || !content}
              className="px-4 py-2 rounded text-sm font-medium cursor-pointer disabled:opacity-50"
              style={{
                backgroundColor: "var(--color-wood-dark)",
                color: "var(--color-parchment)",
              }}
            >
              {submitting ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
pnpm web:build
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/community/new/page.tsx
git commit -m "feat: replace plain text editor with RichTextEditor on create post page"
```

---

## Task 15: Update Post Detail Page (Viewer)

**Files:**
- Modify: `apps/web/app/community/[id]/page.tsx`

- [ ] **Step 1: Replace plain text rendering with RichTextViewer**

In `apps/web/app/community/[id]/page.tsx`, replace lines 141-146 (the plain text content display):

```typescript
// OLD (lines 141-146):
<div
  className="text-sm leading-relaxed whitespace-pre-wrap"
  style={{ color: "var(--color-ink)" }}
>
  {post.content}
</div>
```

With a component that handles both legacy string content and new rich content:

```typescript
{typeof post.content === "string" ? (
  <div
    className="text-sm leading-relaxed whitespace-pre-wrap"
    style={{ color: "var(--color-ink)" }}
  >
    {post.content}
  </div>
) : (
  <RichTextViewer content={post.content} />
)}
```

Also add the import at the top of the file (after the existing imports):

```typescript
import RichTextViewer from "@/components/editor/RichTextViewer";
```

- [ ] **Step 2: Verify build**

```bash
pnpm web:build
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/community/[id]/page.tsx
git commit -m "feat: render rich content posts with RichTextViewer on post detail page"
```

---

## Task 16: Update Community Listing Page

**Files:**
- Modify: `apps/web/app/community/page.tsx`

- [ ] **Step 1: Use contentPreview for post excerpts**

In `apps/web/app/community/page.tsx`, update line 103 where `post.content` is displayed as a preview:

```typescript
// OLD (lines 99-104):
<p
  className="text-sm mb-3 line-clamp-2"
  style={{ color: "var(--color-ink-light)" }}
>
  {post.content}
</p>
```

Replace with:

```typescript
<p
  className="text-sm mb-3 line-clamp-2"
  style={{ color: "var(--color-ink-light)" }}
>
  {post.contentPreview || (typeof post.content === "string" ? post.content : "")}
</p>
```

This handles:
- New posts: uses `contentPreview` (plain text excerpt)
- Legacy posts (pre-migration): falls back to `content` string
- Rich content without preview: shows empty (edge case)

- [ ] **Step 2: Verify build**

```bash
pnpm web:build
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/community/page.tsx
git commit -m "feat: use contentPreview for post excerpts on community listing page"
```

---

## Task 17: Update Firestore Security Rules for Storage

**Files:**
- Modify: `firestore.rules` (note: Firebase Storage rules are typically in `storage.rules`, but if the project uses Firestore rules file, add there. Check what exists.)

- [ ] **Step 1: Create Firebase Storage rules**

Check if `storage.rules` exists. If not, create it. If the project deploys Storage rules separately, create `storage.rules`:

```
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /posts/{postId}/images/{imageId} {
      allow read: if true;
      allow write: if request.auth != null
                    && request.resource.size < 5 * 1024 * 1024
                    && request.resource.contentType.matches('image/.*');
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add storage.rules
git commit -m "feat: add Firebase Storage security rules for post images"
```

---

## Task 18: End-to-End Verification

- [ ] **Step 1: Build the full project**

```bash
pnpm build
```
Expected: all packages and the web app build successfully.

- [ ] **Step 2: Start the dev server and test manually**

```bash
pnpm web:dev
```

Test the following flows:
1. Navigate to `/community/new` while signed in
2. Verify the WYSIWYG editor appears with toolbar
3. Type formatted text (bold, italic, headings, lists)
4. Click "Position" button → verify FEN paste modal opens → paste a FEN → verify board preview → insert
5. Click "Puzzle" button → verify puzzle picker opens → select a puzzle → insert
6. Click "Image" button → select an image → verify upload progress → verify image renders
7. Submit the post → verify redirect to post detail page
8. Verify post detail page renders all rich content correctly
9. Verify community listing page shows text preview
10. Verify old plain-text posts (if any) still render correctly

- [ ] **Step 3: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: address issues found during end-to-end verification"
```
