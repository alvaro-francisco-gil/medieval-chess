import { Node, mergeAttributes } from "@tiptap/react";
import { ReactNodeViewRenderer } from "@tiptap/react";
import ImageUploadView from "../nodes/ImageUploadView";

export const ImageUploadExtension = Node.create({
  name: "image", group: "block", atom: true,
  addAttributes() { return { src: { default: null }, alt: { default: "" }, uploading: { default: false }, progress: { default: 0 } }; },
  parseHTML() { return [{ tag: "img[src]" }]; },
  renderHTML({ HTMLAttributes }) { return ["img", mergeAttributes(HTMLAttributes)]; },
  addNodeView() { return ReactNodeViewRenderer(ImageUploadView); },
});
