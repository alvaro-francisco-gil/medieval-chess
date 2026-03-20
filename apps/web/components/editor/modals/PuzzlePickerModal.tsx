"use client";
import { useEffect, useState } from "react";
import { listPuzzles } from "@/lib/puzzles";
import MiniBoard from "@/components/chess-board/MiniBoard";
import { fenToPieces } from "@/lib/editor-utils";
import type { Puzzle } from "@medieval-chess/shared/types";

interface PuzzlePickerModalProps { onInsert: (puzzleId: string) => void; onClose: () => void; }

export default function PuzzlePickerModal({ onInsert, onClose }: PuzzlePickerModalProps) {
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<number | undefined>();
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => { listPuzzles({ difficulty, maxResults: 50 }).then(setPuzzles).catch(console.error).finally(() => setLoading(false)); }, [difficulty]);

  const filtered = puzzles.filter((p) => !search || p.title.toLowerCase().includes(search.toLowerCase()));
  const inputStyle = { backgroundColor: "rgba(255,255,255,0.6)", border: "1px solid rgba(139, 94, 60, 0.3)", color: "var(--color-ink)" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div className="rounded-lg w-full max-w-lg max-h-[80vh] flex flex-col" style={{ backgroundColor: "var(--color-parchment)", border: "2px solid var(--color-wood)" }} onClick={(e) => e.stopPropagation()}>
        <div className="p-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(139, 94, 60, 0.2)" }}>
          <h3 className="font-semibold" style={{ color: "var(--color-wood-dark)" }}>Insert Puzzle</h3>
          <button onClick={onClose} className="text-lg cursor-pointer" style={{ color: "var(--color-ink-light)" }}>✕</button>
        </div>
        <div className="p-4 flex gap-2" style={{ borderBottom: "1px solid rgba(139, 94, 60, 0.2)" }}>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search puzzles..." className="flex-1 px-3 py-2 rounded text-sm" style={inputStyle} />
          <select value={difficulty || ""} onChange={(e) => setDifficulty(e.target.value ? Number(e.target.value) : undefined)} className="px-3 py-2 rounded text-sm" style={inputStyle}>
            <option value="">All difficulties</option>
            {[1,2,3,4,5].map((d) => <option key={d} value={d}>{"\u2605".repeat(d)}{"\u2606".repeat(5-d)}</option>)}
          </select>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? <p className="text-center p-4 text-sm" style={{ color: "var(--color-ink-light)" }}>Loading puzzles...</p> :
           filtered.length === 0 ? <p className="text-center p-4 text-sm" style={{ color: "var(--color-ink-light)" }}>No puzzles found.</p> :
           <div className="space-y-1">{filtered.map((puzzle) => {
             const isSelected = selected === puzzle.id;
             return <button key={puzzle.id} onClick={() => setSelected(puzzle.id)} className="w-full flex items-center gap-3 p-3 rounded-lg text-left cursor-pointer transition-colors" style={{ backgroundColor: isSelected ? "rgba(201, 168, 76, 0.2)" : "transparent", border: isSelected ? "1px solid var(--color-gold)" : "1px solid transparent" }}>
               <div className="flex-shrink-0"><MiniBoard pieces={fenToPieces(puzzle.fen)} highlights={[]} squareSize={16} size={8} /></div>
               <div className="flex-1 min-w-0">
                 <div className="text-sm font-medium truncate" style={{ color: "var(--color-wood-dark)" }}>{puzzle.title}</div>
                 <div className="text-xs" style={{ color: "var(--color-ink-light)" }}>{"\u2605".repeat(puzzle.difficulty)}{"\u2606".repeat(5-puzzle.difficulty)} · {puzzle.authorName}</div>
               </div>
             </button>;
           })}</div>}
        </div>
        <div className="p-4 flex justify-end gap-2" style={{ borderTop: "1px solid rgba(139, 94, 60, 0.2)" }}>
          <button onClick={onClose} className="px-4 py-2 rounded text-sm cursor-pointer" style={{ backgroundColor: "rgba(139, 94, 60, 0.15)", color: "var(--color-wood-dark)" }}>Cancel</button>
          <button onClick={() => selected && onInsert(selected)} disabled={!selected} className="px-4 py-2 rounded text-sm font-medium cursor-pointer disabled:opacity-50" style={{ backgroundColor: "var(--color-wood-dark)", color: "var(--color-parchment)" }}>Insert Puzzle</button>
        </div>
      </div>
    </div>
  );
}
