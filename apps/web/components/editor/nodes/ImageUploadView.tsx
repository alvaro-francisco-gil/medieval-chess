"use client";
import { NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";

export default function ImageUploadView({ node }: NodeViewProps) {
  const { src, alt, uploading, progress } = node.attrs;

  if (uploading) return (
    <NodeViewWrapper className="my-4">
      <div className="rounded-lg p-6 flex flex-col items-center gap-2" style={{ backgroundColor: "rgba(255,255,255,0.4)", border: "2px dashed var(--color-wood)" }}>
        <div className="text-sm" style={{ color: "var(--color-ink-light)" }}>Uploading image...</div>
        <div className="w-48 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(139, 94, 60, 0.2)" }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: "var(--color-gold)" }} />
        </div>
        <div className="text-xs" style={{ color: "var(--color-ink-light)" }}>{Math.round(progress)}%</div>
      </div>
    </NodeViewWrapper>
  );

  if (!src) return (
    <NodeViewWrapper className="my-4">
      <div className="rounded-lg p-6 text-center text-sm" style={{ backgroundColor: "rgba(255,255,255,0.4)", border: "2px dashed var(--color-wood)", color: "var(--color-ink-light)" }}>No image</div>
    </NodeViewWrapper>
  );

  return (
    <NodeViewWrapper className="my-4">
      <div className="rounded-lg overflow-hidden inline-block" style={{ border: "1px solid rgba(139, 94, 60, 0.2)" }}>
        <img src={src} alt={alt || ""} className="max-w-full h-auto" style={{ maxHeight: 500 }} />
      </div>
    </NodeViewWrapper>
  );
}
