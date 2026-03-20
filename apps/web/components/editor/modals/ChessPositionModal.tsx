"use client";
import { useState, useCallback } from "react";
import MiniBoard from "@/components/chess-board/MiniBoard";
import { fenToPieces } from "@/lib/editor-utils";

const DEFAULT_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

interface ChessPositionModalProps { onInsert: (fen: string) => void; onClose: () => void; }

export default function ChessPositionModal({ onInsert, onClose }: ChessPositionModalProps) {
  const [tab, setTab] = useState<"board" | "paste">("board");
  const [fen, setFen] = useState(DEFAULT_FEN);
  const [fenInput, setFenInput] = useState(DEFAULT_FEN);

  const handleFenChange = useCallback((value: string) => {
    setFenInput(value);
    const ranks = value.split(" ")[0].split("/");
    if (ranks.length === 8) setFen(value);
  }, []);

  const pieces = fenToPieces(fen);
  const inputStyle = { backgroundColor: "rgba(255,255,255,0.6)", border: "1px solid rgba(139, 94, 60, 0.3)", color: "var(--color-ink)" };
  const tabStyle = (active: boolean) => ({ padding: "8px 16px", fontSize: "13px", fontWeight: active ? ("600" as const) : ("400" as const), background: "none", border: "none", borderBottom: active ? "2px solid var(--color-gold)" : "2px solid transparent", color: active ? "var(--color-wood-dark)" : "var(--color-ink-light)", cursor: "pointer" as const });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div className="rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ backgroundColor: "var(--color-parchment)", border: "2px solid var(--color-wood)" }} onClick={(e) => e.stopPropagation()}>
        <div className="p-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(139, 94, 60, 0.2)" }}>
          <h3 className="font-semibold" style={{ color: "var(--color-wood-dark)" }}>Insert Chess Position</h3>
          <button onClick={onClose} className="text-lg cursor-pointer" style={{ color: "var(--color-ink-light)" }}>✕</button>
        </div>
        <div className="flex" style={{ borderBottom: "1px solid rgba(139, 94, 60, 0.2)" }}>
          <button style={tabStyle(tab === "board")} onClick={() => setTab("board")}>Board Setup</button>
          <button style={tabStyle(tab === "paste")} onClick={() => setTab("paste")}>Paste FEN</button>
        </div>
        <div className="p-4">
          {tab === "board" ? (
            <>
              <p className="text-xs mb-3" style={{ color: "var(--color-ink-light)" }}>Edit the FEN string below to set up the position you want to share.</p>
              <div className="flex justify-center mb-3"><MiniBoard pieces={pieces} highlights={[]} squareSize={44} /></div>
              <input type="text" value={fenInput} onChange={(e) => handleFenChange(e.target.value)} className="w-full px-3 py-2 rounded text-xs font-mono mb-3" style={inputStyle} />
              <div className="flex gap-2">
                <button onClick={() => { setFen(DEFAULT_FEN); setFenInput(DEFAULT_FEN); }} className="px-3 py-1 rounded text-xs cursor-pointer" style={{ backgroundColor: "rgba(139, 94, 60, 0.15)", color: "var(--color-wood-dark)" }}>Reset to Start</button>
                <button onClick={() => { setFen("8/8/8/8/8/8/8/8 w - - 0 1"); setFenInput("8/8/8/8/8/8/8/8 w - - 0 1"); }} className="px-3 py-1 rounded text-xs cursor-pointer" style={{ backgroundColor: "rgba(139, 94, 60, 0.15)", color: "var(--color-wood-dark)" }}>Empty Board</button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-4">
                <label className="text-xs font-medium block mb-1" style={{ color: "var(--color-wood-dark)" }}>FEN String</label>
                <input type="text" value={fenInput} onChange={(e) => handleFenChange(e.target.value)} className="w-full px-3 py-2 rounded text-sm font-mono" style={inputStyle} placeholder="Paste FEN string here..." />
              </div>
              <div className="flex justify-center mb-4"><MiniBoard pieces={pieces} highlights={[]} squareSize={40} /></div>
            </>
          )}
        </div>
        <div className="p-4 flex justify-end gap-2" style={{ borderTop: "1px solid rgba(139, 94, 60, 0.2)" }}>
          <button onClick={onClose} className="px-4 py-2 rounded text-sm cursor-pointer" style={{ backgroundColor: "rgba(139, 94, 60, 0.15)", color: "var(--color-wood-dark)" }}>Cancel</button>
          <button onClick={() => onInsert(fen)} className="px-4 py-2 rounded text-sm font-medium cursor-pointer" style={{ backgroundColor: "var(--color-wood-dark)", color: "var(--color-parchment)" }}>Insert Position</button>
        </div>
      </div>
    </div>
  );
}
