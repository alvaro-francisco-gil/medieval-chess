"use client";

import { useState, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth-context";
import { createPost } from "@/lib/forum";
import { useTranslations } from "next-intl";

export default function NewPostPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const t = useTranslations("community.new");

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user || !title.trim() || !content.trim()) return;

      setSubmitting(true);
      try {
        const id = await createPost({
          title: title.trim(),
          content: content.trim(),
          authorId: user.uid,
          authorName: user.displayName || "Anonymous",
          authorAvatarUrl: user.photoURL || undefined,
        });
        router.push(`/community/${id}`);
      } catch (err) {
        console.error("Failed to create post:", err);
        setSubmitting(false);
      }
    },
    [user, title, content, router]
  );

  if (!user) {
    return (
      <main className="min-h-screen p-8 flex items-center justify-center" style={{ backgroundColor: "var(--color-parchment)" }}>
        <p style={{ color: "var(--color-ink-light)" }}>{t("signInRequired")}</p>
      </main>
    );
  }

  const inputStyle = { backgroundColor: "rgba(255,255,255,0.6)", border: "1px solid rgba(139, 94, 60, 0.3)", color: "var(--color-ink)" };

  return (
    <main className="min-h-screen p-4 md:p-8" style={{ backgroundColor: "var(--color-parchment)" }}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6" style={{ color: "var(--color-wood-dark)" }}>{t("title")}</h1>
        <form onSubmit={handleSubmit} className="rounded-lg p-6 space-y-4" style={{ backgroundColor: "rgba(255,255,255,0.5)", border: "1px solid rgba(139, 94, 60, 0.2)" }}>
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "var(--color-wood-dark)" }}>{t("labelTitle")}</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 rounded text-sm" style={inputStyle} placeholder={t("placeholderTitle")} required />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "var(--color-wood-dark)" }}>{t("labelContent")}</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} className="w-full px-3 py-2 rounded text-sm" style={inputStyle} rows={8} placeholder={t("placeholderContent")} required />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => router.back()} className="px-4 py-2 rounded text-sm font-medium cursor-pointer" style={{ backgroundColor: "rgba(139, 94, 60, 0.15)", color: "var(--color-wood-dark)", border: "1px solid rgba(139, 94, 60, 0.3)" }}>{t("cancel")}</button>
            <button type="submit" disabled={submitting || !title.trim() || !content.trim()} className="px-4 py-2 rounded text-sm font-medium cursor-pointer disabled:opacity-50" style={{ backgroundColor: "var(--color-wood-dark)", color: "var(--color-parchment)" }}>{submitting ? t("posting") : t("postButton")}</button>
          </div>
        </form>
      </div>
    </main>
  );
}
