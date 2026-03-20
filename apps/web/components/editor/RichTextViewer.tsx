"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import type { JSONContent } from "@tiptap/react";
import { ChessPositionExtension } from "./extensions/chess-position";
import { PuzzleEmbedExtension } from "./extensions/puzzle-embed";
import { ImageUploadExtension } from "./extensions/image-upload";

interface RichTextViewerProps { content: JSONContent; }

export default function RichTextViewer({ content }: RichTextViewerProps) {
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [2, 3] } }), LinkExtension, ChessPositionExtension, PuzzleEmbedExtension, ImageUploadExtension],
    content, editable: false,
    editorProps: { attributes: { class: "prose prose-sm max-w-none" } },
  });
  if (!editor) return null;
  return <div style={{ color: "var(--color-ink)" }}><EditorContent editor={editor} /></div>;
}
