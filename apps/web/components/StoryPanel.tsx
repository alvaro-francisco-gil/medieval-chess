"use client";

interface StoryPanelProps {
  title: string;
  story?: string;
  statusText: string;
  isGameOver: boolean;
}

export default function StoryPanel({ title, story, statusText, isGameOver }: StoryPanelProps) {
  return (
    <div
      className="rounded-lg p-4 overflow-y-auto"
      style={{ backgroundColor: "rgba(255,255,255,0.5)", border: "1px solid rgba(139, 94, 60, 0.2)", maxHeight: "100%" }}
    >
      <h3 className="text-sm font-semibold mb-3 uppercase tracking-wide" style={{ color: "var(--color-wood-dark)" }}>
        {title}
      </h3>
      {story && (
        <p className="text-sm mb-4 leading-relaxed italic" style={{ color: "var(--color-ink-light)" }}>
          {story}
        </p>
      )}
      <div
        className="text-sm font-medium px-3 py-2 rounded"
        style={{
          backgroundColor: isGameOver ? "rgba(201, 168, 76, 0.2)" : "rgba(139, 94, 60, 0.1)",
          color: "var(--color-wood-dark)",
        }}
      >
        {statusText}
      </div>
    </div>
  );
}
