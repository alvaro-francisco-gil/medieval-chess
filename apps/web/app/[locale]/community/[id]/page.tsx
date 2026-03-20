"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useAuth } from "@/lib/auth-context";
import { getPost, listComments, addComment, likePost } from "@/lib/forum";
import { useTranslations } from "next-intl";
import type { ForumPost, ForumComment } from "@medieval-chess/shared/types";

export default function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();
  const [post, setPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(false);
  const t = useTranslations("community.detail");
  const tTime = useTranslations("community.timeAgo");
  const tComm = useTranslations("community");

  function timeAgo(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return tTime("justNow");
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return tTime("minutesAgo", { count: minutes });
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return tTime("hoursAgo", { count: hours });
    const days = Math.floor(hours / 24);
    return tTime("daysAgo", { count: days });
  }

  useEffect(() => {
    Promise.all([getPost(id), listComments(id)])
      .then(([p, c]) => {
        setPost(p);
        setComments(c);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleComment = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user || !newComment.trim()) return;

      setSubmitting(true);
      try {
        await addComment({
          postId: id,
          content: newComment.trim(),
          authorId: user.uid,
          authorName: user.displayName || "Anonymous",
          authorAvatarUrl: user.photoURL || undefined,
        });
        // Refresh comments
        const updated = await listComments(id);
        setComments(updated);
        setNewComment("");
        if (post) {
          setPost({ ...post, commentCount: post.commentCount + 1 });
        }
      } catch (err) {
        console.error("Failed to add comment:", err);
      } finally {
        setSubmitting(false);
      }
    },
    [user, newComment, id, post]
  );

  const handleLike = useCallback(async () => {
    if (liked) return;
    try {
      await likePost(id);
      setLiked(true);
      if (post) {
        setPost({ ...post, likes: post.likes + 1 });
      }
    } catch (err) {
      console.error("Failed to like post:", err);
    }
  }, [id, liked, post]);

  if (loading) {
    return (
      <main
        className="min-h-screen p-8 flex items-center justify-center"
        style={{ backgroundColor: "var(--color-parchment)" }}
      >
        <p style={{ color: "var(--color-ink-light)" }}>{t("loading")}</p>
      </main>
    );
  }

  if (!post) {
    return (
      <main
        className="min-h-screen p-8 flex items-center justify-center"
        style={{ backgroundColor: "var(--color-parchment)" }}
      >
        <p style={{ color: "var(--color-ink-light)" }}>{t("notFound")}</p>
      </main>
    );
  }

  const inputStyle = {
    backgroundColor: "rgba(255,255,255,0.6)",
    border: "1px solid rgba(139, 94, 60, 0.3)",
    color: "var(--color-ink)",
  };

  return (
    <main
      className="min-h-screen p-4 md:p-8"
      style={{ backgroundColor: "var(--color-parchment)" }}
    >
      <div className="max-w-3xl mx-auto">
        {/* Post */}
        <article
          className="rounded-lg p-6 mb-6"
          style={{
            backgroundColor: "rgba(255,255,255,0.5)",
            border: "1px solid rgba(139, 94, 60, 0.2)",
          }}
        >
          <h1
            className="text-2xl font-bold mb-2"
            style={{ color: "var(--color-wood-dark)" }}
          >
            {post.title}
          </h1>
          <div
            className="flex items-center gap-3 text-xs mb-4"
            style={{ color: "var(--color-ink-light)" }}
          >
            <span className="font-medium">{post.authorName}</span>
            <span>{timeAgo(post.createdAt)}</span>
          </div>
          <div
            className="text-sm leading-relaxed whitespace-pre-wrap"
            style={{ color: "var(--color-ink)" }}
          >
            {typeof post.content === "string" ? post.content : post.contentPreview ?? ""}
          </div>

          <div className="flex items-center gap-4 mt-4 pt-4" style={{ borderTop: "1px solid rgba(139, 94, 60, 0.15)" }}>
            <button
              onClick={handleLike}
              disabled={liked}
              className="flex items-center gap-1 text-sm cursor-pointer disabled:opacity-60"
              style={{ color: liked ? "var(--color-gold)" : "var(--color-ink-light)" }}
            >
              {liked ? t("liked") : t("like")} ({post.likes})
            </button>
            <span className="text-sm" style={{ color: "var(--color-ink-light)" }}>
              {tComm("commentCount", { count: post.commentCount })}
            </span>
          </div>
        </article>

        {/* Comments */}
        <div className="space-y-3 mb-6">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-lg p-4"
              style={{
                backgroundColor: "rgba(255,255,255,0.35)",
                border: "1px solid rgba(139, 94, 60, 0.15)",
              }}
            >
              <div
                className="flex items-center gap-2 text-xs mb-2"
                style={{ color: "var(--color-ink-light)" }}
              >
                <span className="font-medium">{comment.authorName}</span>
                <span>{timeAgo(comment.createdAt)}</span>
              </div>
              <p
                className="text-sm whitespace-pre-wrap"
                style={{ color: "var(--color-ink)" }}
              >
                {comment.content}
              </p>
            </div>
          ))}
        </div>

        {/* Add comment */}
        {user ? (
          <form
            onSubmit={handleComment}
            className="rounded-lg p-4"
            style={{
              backgroundColor: "rgba(255,255,255,0.5)",
              border: "1px solid rgba(139, 94, 60, 0.2)",
            }}
          >
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full px-3 py-2 rounded text-sm mb-3"
              style={inputStyle}
              rows={3}
              placeholder={t("commentPlaceholder")}
              required
            />
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="px-4 py-2 rounded text-sm font-medium cursor-pointer disabled:opacity-50"
              style={{
                backgroundColor: "var(--color-wood-dark)",
                color: "var(--color-parchment)",
              }}
            >
              {submitting ? t("posting") : t("commentButton")}
            </button>
          </form>
        ) : (
          <p className="text-sm text-center" style={{ color: "var(--color-ink-light)" }}>
            {t("signInToComment")}
          </p>
        )}
      </div>
    </main>
  );
}
