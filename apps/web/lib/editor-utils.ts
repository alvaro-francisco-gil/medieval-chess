interface MiniBoardPiece {
  type: string;
  color: "w" | "b";
  row: number;
  col: number;
}

const FEN_PIECE_MAP: Record<string, { type: string; color: "w" | "b" }> = {
  K: { type: "k", color: "w" }, Q: { type: "q", color: "w" }, R: { type: "r", color: "w" },
  B: { type: "b", color: "w" }, N: { type: "n", color: "w" }, P: { type: "p", color: "w" },
  k: { type: "k", color: "b" }, q: { type: "q", color: "b" }, r: { type: "r", color: "b" },
  b: { type: "b", color: "b" }, n: { type: "n", color: "b" }, p: { type: "p", color: "b" },
};

export function fenToPieces(fen: string): MiniBoardPiece[] {
  const pieces: MiniBoardPiece[] = [];
  const placement = fen.split(" ")[0];
  const ranks = placement.split("/");
  for (let rankIdx = 0; rankIdx < ranks.length; rankIdx++) {
    let col = 0;
    for (const ch of ranks[rankIdx]) {
      if (ch >= "1" && ch <= "8") { col += parseInt(ch); }
      else {
        const mapped = FEN_PIECE_MAP[ch];
        if (mapped) { pieces.push({ type: mapped.type, color: mapped.color, row: rankIdx, col }); }
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
