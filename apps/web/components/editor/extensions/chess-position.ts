import { Node, mergeAttributes } from "@tiptap/react";
import { ReactNodeViewRenderer } from "@tiptap/react";
import ChessPositionView from "../nodes/ChessPositionView";

export const ChessPositionExtension = Node.create({
  name: "chessPosition", group: "block", atom: true,
  addAttributes() { return { fen: { default: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" } }; },
  parseHTML() { return [{ tag: 'div[data-type="chess-position"]' }]; },
  renderHTML({ HTMLAttributes }) { return ["div", mergeAttributes(HTMLAttributes, { "data-type": "chess-position" })]; },
  addNodeView() { return ReactNodeViewRenderer(ChessPositionView); },
});
