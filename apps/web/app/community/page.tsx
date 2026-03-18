"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listPosts } from "@/lib/forum";
import { useAuth } from "@/lib/auth-context";
import type { ForumPost } from "@medieval-chess/shared/types";

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function CommunityPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listPosts(50)
      .then(setPosts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <main
      className="min-h-screen p-4 md:p-8"
      style={{ backgroundColor: "var(--color-parchment)" }}
    >
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1
              className="text-3xl font-bold"
              style={{ color: "var(--color-wood-dark)" }}
            >
              Community
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--color-ink-light)" }}>
              Discuss strategies, share discoveries, and connect with other players.
            </p>
          </div>
          {user && (
            <Link
              href="/community/new"
              className="px-4 py-2 rounded text-sm font-medium transition-colors"
              style={{
                backgroundColor: "var(--color-wood-dark)",
                color: "var(--color-parchment)",
              }}
            >
              New Post
            </Link>
          )}
        </div>

        {loading ? (
          <p style={{ color: "var(--color-ink-light)" }}>Loading posts...</p>
        ) : posts.length === 0 ? (
          <div
            className="rounded-lg p-8 text-center"
            style={{
              backgroundColor: "rgba(255,255,255,0.5)",
              border: "1px solid rgba(139, 94, 60, 0.2)",
            }}
          >
            <p className="text-lg mb-2" style={{ color: "var(--color-ink-light)" }}>
              No posts yet.
            </p>
            <p className="text-sm" style={{ color: "var(--color-ink-light)" }}>
              {user ? "Start a discussion!" : "Sign in to create the first post."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/community/${post.id}`}
                className="block rounded-lg p-4 hover:shadow-md transition-shadow"
                style={{
                  backgroundColor: "rgba(255,255,255,0.5)",
                  border: "1px solid rgba(139, 94, 60, 0.2)",
                }}
              >
                <h3
                  className="font-semibold mb-1"
                  style={{ color: "var(--color-wood-dark)" }}
                >
                  {post.title}
                </h3>
                <p
                  className="text-sm mb-3 line-clamp-2"
                  style={{ color: "var(--color-ink-light)" }}
                >
                  {post.content}
                </p>
                <div
                  className="flex items-center gap-4 text-xs"
                  style={{ color: "var(--color-ink-light)" }}
                >
                  <span>{post.authorName}</span>
                  <span>{timeAgo(post.createdAt)}</span>
                  <span>{post.commentCount} {post.commentCount === 1 ? "comment" : "comments"}</span>
                  <span>{post.likes} {post.likes === 1 ? "like" : "likes"}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
