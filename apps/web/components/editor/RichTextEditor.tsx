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

interface RichTextEditorProps { postId: string; onChange: (content: JSONContent) => void; }
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export default function RichTextEditor({ postId, onChange }: RichTextEditorProps) {
  const [showChessModal, setShowChessModal] = useState(false);
  const [showPuzzleModal, setShowPuzzleModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      LinkExtension.configure({ openOnClick: false }),
      ChessPositionExtension, PuzzleEmbedExtension, ImageUploadExtension,
    ],
    content: { type: "doc", content: [{ type: "paragraph" }] },
    onUpdate: ({ editor }) => { onChange(editor.getJSON()); },
    editorProps: { attributes: { class: "prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4" } },
  });

  const handleInsertChessPosition = useCallback((fen: string) => {
    if (!editor) return;
    editor.chain().focus().insertContent({ type: "chessPosition", attrs: { fen } }).run();
    setShowChessModal(false);
  }, [editor]);

  const handleInsertPuzzle = useCallback((puzzleId: string) => {
    if (!editor) return;
    editor.chain().focus().insertContent({ type: "puzzleEmbed", attrs: { puzzleId } }).run();
    setShowPuzzleModal(false);
  }, [editor]);

  const handleFileSelected = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    if (file.size > MAX_IMAGE_SIZE) { alert("Image must be smaller than 5MB"); return; }
    if (!file.type.startsWith("image/")) { alert("Please select an image file"); return; }

    editor.chain().focus().insertContent({ type: "image", attrs: { src: null, uploading: true, progress: 0 } }).run();

    try {
      const resized = await resizeImage(file);
      const url = await uploadPostImage(postId, resized, (percent) => {
        const { state } = editor;
        state.doc.descendants((node, pos) => {
          if (node.type.name === "image" && node.attrs.uploading) {
            editor.view.dispatch(state.tr.setNodeMarkup(pos, undefined, { ...node.attrs, progress: percent }));
            return false;
          }
        });
      });
      const { state } = editor;
      state.doc.descendants((node, pos) => {
        if (node.type.name === "image" && node.attrs.uploading) {
          editor.view.dispatch(state.tr.setNodeMarkup(pos, undefined, { src: url, alt: file.name, uploading: false, progress: 100 }));
          return false;
        }
      });
    } catch (err) {
      console.error("Image upload failed:", err);
      const { state } = editor;
      state.doc.descendants((node, pos) => {
        if (node.type.name === "image" && node.attrs.uploading) {
          editor.view.dispatch(state.tr.delete(pos, pos + node.nodeSize));
          return false;
        }
      });
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [editor, postId]);

  if (!editor) return null;

  return (
    <div className="rounded-lg overflow-hidden" style={{ border: "1px solid rgba(139, 94, 60, 0.3)", backgroundColor: "rgba(255,255,255,0.6)" }}>
      <EditorToolbar editor={editor} onInsertImage={() => fileInputRef.current?.click()} onInsertChessPosition={() => setShowChessModal(true)} onInsertPuzzle={() => setShowPuzzleModal(true)} />
      <div style={{ color: "var(--color-ink)" }}><EditorContent editor={editor} /></div>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelected} />
      {showChessModal && <ChessPositionModal onInsert={handleInsertChessPosition} onClose={() => setShowChessModal(false)} />}
      {showPuzzleModal && <PuzzlePickerModal onInsert={handleInsertPuzzle} onClose={() => setShowPuzzleModal(false)} />}
    </div>
  );
}
