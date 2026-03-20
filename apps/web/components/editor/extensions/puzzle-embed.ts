import { Node, mergeAttributes } from "@tiptap/react";
import { ReactNodeViewRenderer } from "@tiptap/react";
import PuzzleEmbedView from "../nodes/PuzzleEmbedView";

export const PuzzleEmbedExtension = Node.create({
  name: "puzzleEmbed", group: "block", atom: true,
  addAttributes() { return { puzzleId: { default: null } }; },
  parseHTML() { return [{ tag: 'div[data-type="puzzle-embed"]' }]; },
  renderHTML({ HTMLAttributes }) { return ["div", mergeAttributes(HTMLAttributes, { "data-type": "puzzle-embed" })]; },
  addNodeView() { return ReactNodeViewRenderer(PuzzleEmbedView); },
});
