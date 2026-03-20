"use client";
import type { Editor } from "@tiptap/react";
import { Bold, Italic, Heading2, Heading3, List, ListOrdered, Link, ImageIcon, Grid3x3, Puzzle } from "lucide-react";

interface EditorToolbarProps { editor: Editor; onInsertImage: () => void; onInsertChessPosition: () => void; onInsertPuzzle: () => void; }

function ToolbarButton({ active, onClick, children, title }: { active?: boolean; onClick: () => void; children: React.ReactNode; title: string }) {
  return <button type="button" onClick={onClick} title={title} className="p-1.5 rounded cursor-pointer transition-colors" style={{ backgroundColor: active ? "var(--color-gold)" : "transparent", color: active ? "var(--color-ink)" : "var(--color-ink-light)" }}>{children}</button>;
}

function Divider() { return <div className="w-px h-5 mx-1" style={{ backgroundColor: "rgba(139, 94, 60, 0.3)" }} />; }

export default function EditorToolbar({ editor, onInsertImage, onInsertChessPosition, onInsertPuzzle }: EditorToolbarProps) {
  const setLink = () => { const url = window.prompt("Enter URL:"); if (url) editor.chain().focus().setLink({ href: url }).run(); };
  return (
    <div className="flex items-center gap-0.5 p-2 rounded-t-lg flex-wrap" style={{ backgroundColor: "rgba(139, 94, 60, 0.1)", borderBottom: "1px solid rgba(139, 94, 60, 0.2)" }}>
      <ToolbarButton active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold"><Bold size={16} /></ToolbarButton>
      <ToolbarButton active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic"><Italic size={16} /></ToolbarButton>
      <Divider />
      <ToolbarButton active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2"><Heading2 size={16} /></ToolbarButton>
      <ToolbarButton active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Heading 3"><Heading3 size={16} /></ToolbarButton>
      <Divider />
      <ToolbarButton active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet List"><List size={16} /></ToolbarButton>
      <ToolbarButton active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered List"><ListOrdered size={16} /></ToolbarButton>
      <Divider />
      <ToolbarButton active={editor.isActive("link")} onClick={setLink} title="Insert Link"><Link size={16} /></ToolbarButton>
      <Divider />
      <ToolbarButton onClick={onInsertImage} title="Insert Image"><ImageIcon size={16} /></ToolbarButton>
      <ToolbarButton onClick={onInsertChessPosition} title="Insert Chess Position"><Grid3x3 size={16} /></ToolbarButton>
      <ToolbarButton onClick={onInsertPuzzle} title="Insert Puzzle"><Puzzle size={16} /></ToolbarButton>
    </div>
  );
}
