# Rich Content Posts — Design Spec

## Problem

The community forum currently supports plain text only for posts. Users cannot share images, formatted text, chess positions, or reference puzzles — limiting the social experience for a chess community where visual content is essential.

**Scope note:** This spec covers rich content for **posts only**. Comments remain plain text for now — they serve a different purpose (short replies) and adding rich content there can be a follow-up if needed.

## Solution

Replace the plain text editor with a WYSIWYG block editor (Tiptap) that supports rich text formatting, image uploads, static chess position diagrams, and puzzle embeds.

## Decisions

| Decision | Choice | Reasoning |
|----------|--------|-----------|
| Editor library | Tiptap (ProseMirror-based) | Headless UI for custom theming, excellent custom node support, mature ecosystem |
| Editor style | WYSIWYG block editor | Friendly for all users, no syntax to learn |
| Chess positions | Static board diagrams | Simple, performant, covers the sharing use case |
| Puzzle embeds | Reference existing puzzles | Leverages existing puzzle system, links to full solve experience |
| Position insertion | Board setup + FEN paste (two tabs) | Covers visual users and power users |
| Puzzle insertion | Search/browse picker modal | Users don't need to know puzzle URLs |
| Image storage | Firebase Storage uploads | Self-contained within existing Firebase infrastructure |
| Content format | Tiptap JSON document | Native format, lossless, supports all block types |
| Text formatting | Bold, italic, headings (H2/H3), bullet lists, numbered lists, links | Covers community forum needs without over-complexity |

## Architecture

### Data Flow

```
Editor (Tiptap) → JSON document → Firestore (posts/{id}.content)
                                → Firebase Storage (posts/{id}/images/*)
                                → Plain text excerpt (posts/{id}.contentPreview)

Firestore → JSON document → Viewer (Tiptap read-only) → Rendered HTML with custom blocks
```

### Data Model Changes

**Current `posts` document:**
```
title: string
content: string              ← plain text
authorId: string
authorName: string
authorAvatarUrl: string
commentCount: number
likes: number
createdAt: Timestamp
updatedAt: Timestamp
```

**New `posts` document:**
```
title: string
content: object              ← Tiptap JSON document
contentPreview: string       ← first ~200 chars as plain text (for listings)
authorId: string
authorName: string
authorAvatarUrl: string
commentCount: number
likes: number
createdAt: Timestamp
updatedAt: Timestamp
```

**Tiptap JSON structure example:**
```json
{
  "type": "doc",
  "content": [
    {
      "type": "heading",
      "attrs": { "level": 2 },
      "content": [{ "type": "text", "text": "My Analysis" }]
    },
    {
      "type": "paragraph",
      "content": [
        { "type": "text", "text": "Check out this " },
        { "type": "text", "marks": [{ "type": "bold" }], "text": "critical position" }
      ]
    },
    {
      "type": "chessPosition",
      "attrs": { "fen": "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR" }
    },
    {
      "type": "puzzleEmbed",
      "attrs": { "puzzleId": "abc123" }
    },
    {
      "type": "image",
      "attrs": { "src": "https://firebasestorage.googleapis.com/...", "alt": "Board photo" }
    }
  ]
}
```

**Firebase Storage structure:**
```
posts/{postId}/images/{uuid}-{filename}
```

**Migration:** Existing plain-text posts get their `content` string wrapped into a Tiptap doc with a single paragraph node, and `contentPreview` is extracted from it.

### Custom Tiptap Nodes

**chessPosition node:**
- Attrs: `fen` (string, required)
- Editor view: renders a MiniBoard (reusing existing component) with an edit/delete overlay
- Viewer: renders a static MiniBoard with the position
- Insertion: ChessPositionModal provides the FEN

**puzzleEmbed node:**
- Attrs: `puzzleId` (string, required)
- Editor view: fetches puzzle metadata, renders a card preview with title/difficulty/author
- Viewer: renders the same card with a "Try this puzzle" link to `/puzzles/{id}`
- Insertion: PuzzlePickerModal provides the puzzle ID

**image node:**
- Attrs: `src` (string, required), `alt` (string, optional)
- Editor view: handles upload to Firebase Storage, shows progress bar, renders image when done
- Viewer: renders the image with alt text
- Insertion: file picker dialog, uploads to `posts/{postId}/images/{uuid}-{filename}`
- Constraints: max 5MB per image, max 1200px wide (client-side resize before upload)

## Components

### New Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `RichTextEditor` | `components/editor/RichTextEditor.tsx` | Tiptap editor with toolbar and custom nodes. Main editor component. |
| `RichTextViewer` | `components/editor/RichTextViewer.tsx` | Read-only Tiptap renderer for post detail pages. |
| `EditorToolbar` | `components/editor/EditorToolbar.tsx` | Formatting buttons (B/I/H/lists/link) + insert buttons (image/position/puzzle). |
| `ChessPositionNode` | `components/editor/nodes/ChessPositionNode.tsx` | Custom Tiptap node component for chess position blocks. |
| `PuzzleEmbedNode` | `components/editor/nodes/PuzzleEmbedNode.tsx` | Custom Tiptap node component for puzzle embed blocks. |
| `ImageUploadNode` | `components/editor/nodes/ImageUploadNode.tsx` | Custom Tiptap node component for image blocks with upload handling. |
| `ChessPositionModal` | `components/editor/modals/ChessPositionModal.tsx` | Two-tab modal: interactive board setup + FEN paste. Outputs FEN string. |
| `PuzzlePickerModal` | `components/editor/modals/PuzzlePickerModal.tsx` | Search/browse picker for existing puzzles. Outputs puzzle ID. |

### Modified Components/Pages

| Component | Change |
|-----------|--------|
| `/community/new/page.tsx` | Replace textarea with RichTextEditor. Handle image uploads. |
| `/community/[id]/page.tsx` | Replace plain text rendering with RichTextViewer. |
| `/community/page.tsx` | Use `contentPreview` for post listing excerpts. |
| `lib/forum.ts` | Update `createPost` to accept Tiptap JSON, extract contentPreview. Add image upload helpers. |
| `lib/storage.ts` (new) | Firebase Storage upload/delete utilities for post images. |
| `packages/shared/src/types.ts` | Update `ForumPost.content` type from `string` to `TiptapDocument`. |

### Reused Components

- `MiniBoard` — used inside ChessPositionNode for rendering static board diagrams
- `ChessBoard` — used inside ChessPositionModal for interactive position setup

## Image Upload Flow

1. User clicks "Image" button in toolbar
2. Native file picker opens (accept: image/*)
3. Client validates: max 5MB, image type only
4. Client resizes if wider than 1200px (using canvas)
5. Upload to Firebase Storage at `posts/{postId}/images/{uuid}-{filename}`
6. Progress bar shown in the editor node during upload
7. On complete, `src` attr is set to the download URL
8. Image renders inline in the editor

**Post ID strategy:** The post ID is pre-generated using Firestore's `doc()` (which returns a DocumentReference with an auto-ID before writing). This ID is created when the editor mounts, so images can be uploaded to their final `posts/{postId}/images/` path immediately. On save, `setDoc` is used instead of `addDoc` with this pre-generated ID. If the user abandons the post, orphaned images remain in Storage (acceptable for now; cleanup can be added later).

## Chess Position Insertion Flow

1. User clicks "Position" button in toolbar
2. ChessPositionModal opens with two tabs:
   - **Board Setup tab:** Shows ChessBoard starting from default position. User makes moves or drags pieces to set up the position. FEN is displayed and updated live.
   - **FEN Paste tab:** Text input for pasting a FEN string. Preview MiniBoard renders below.
3. User clicks "Insert" — modal closes, chessPosition node is inserted with the FEN.

## Puzzle Embed Insertion Flow

1. User clicks "Puzzle" button in toolbar
2. PuzzlePickerModal opens showing a searchable list of puzzles
   - Search by title
   - Filter by difficulty
   - Each result shows: title, difficulty stars, author, mini board preview
3. User selects a puzzle and clicks "Insert"
4. puzzleEmbed node is inserted with the puzzle ID
5. Node fetches puzzle metadata and renders a card preview

## Migration Strategy

A one-time migration script converts existing plain-text posts:

```typescript
// For each existing post with string content:
const newContent = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [{ type: "text", text: oldContent }]
    }
  ]
};
const contentPreview = oldContent.substring(0, 200);
```

This can run as a Firebase Cloud Function or a one-off script.

## Firestore Security Rules Updates

```
match /posts/{postId} {
  // Existing rules remain
  // No changes needed — content field type changes from string to map,
  // but Firestore doesn't enforce field types in rules
}
```

Firebase Storage rules (new):
```
match /posts/{postId}/images/{imageId} {
  allow read: if true;
  allow write: if request.auth != null
                && request.resource.size < 5 * 1024 * 1024
                && request.resource.contentType.matches('image/.*');
}
```

## Dependencies

New npm packages for `apps/web`:
- `@tiptap/react` — React bindings
- `@tiptap/starter-kit` — Basic extensions (bold, italic, headings, lists, etc.)
- `@tiptap/extension-link` — Link support
- `@tiptap/extension-image` — Base image node (used as foundation, extended with custom upload logic in ImageUploadNode)
- `firebase/storage` — Firebase Storage SDK (may already be available)

## Testing Strategy

- Unit tests for content preview extraction from Tiptap JSON
- Unit tests for migration function (plain text → Tiptap doc)
- Component tests for RichTextEditor (formatting commands produce correct JSON)
- Component tests for custom nodes (render correctly given attrs)
- Integration test for image upload flow (mock Firebase Storage)
- Integration test for chess position insertion (modal → node)
- Integration test for puzzle embed (picker → node → rendered card)
