"use client";

import { useEffect, useState } from "react";
import { useTranslations, useFormatter } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth-context";
import { getOrCreateProfile } from "@/lib/users";
import { listPuzzles } from "@/lib/puzzles";
import type { UserProfile } from "@medieval-chess/shared/types";
import type { Puzzle } from "@medieval-chess/shared/types";

export default function ProfilePage() {
  const t = useTranslations("profile");
  const format = useFormatter();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userPuzzles, setUserPuzzles] = useState<Puzzle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    Promise.all([
      getOrCreateProfile(
        user.uid,
        user.displayName || "Anonymous",
        user.photoURL || undefined
      ),
      listPuzzles({ maxResults: 100 }),
    ])
      .then(([p, allPuzzles]) => {
        setProfile(p);
        setUserPuzzles(allPuzzles.filter((pz) => pz.authorId === user.uid));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <main
        className="min-h-screen p-8 flex items-center justify-center"
        style={{ backgroundColor: "var(--color-parchment)" }}
      >
        <p style={{ color: "var(--color-ink-light)" }}>{t("loading")}</p>
      </main>
    );
  }

  if (!user || !profile) {
    return (
      <main
        className="min-h-screen p-8 flex items-center justify-center"
        style={{ backgroundColor: "var(--color-parchment)" }}
      >
        <p style={{ color: "var(--color-ink-light)" }}>
          {t("signInRequired")}
        </p>
      </main>
    );
  }

  const solvedCount = Object.keys(profile.solvedPuzzles).length;
  const memberDate = format.dateTime(new Date(profile.createdAt), {
    year: "numeric",
    month: "long",
  });

  return (
    <main
      className="min-h-screen p-4 md:p-8"
      style={{ backgroundColor: "var(--color-parchment)" }}
    >
      <div className="max-w-3xl mx-auto">
        {/* Profile header */}
        <div
          className="rounded-lg p-6 mb-6 flex items-center gap-4"
          style={{
            backgroundColor: "rgba(255,255,255,0.5)",
            border: "1px solid rgba(139, 94, 60, 0.2)",
          }}
        >
          {profile.avatarUrl && (
            <img
              src={profile.avatarUrl}
              alt={profile.displayName}
              className="w-16 h-16 rounded-full"
              referrerPolicy="no-referrer"
            />
          )}
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ color: "var(--color-wood-dark)" }}
            >
              {profile.displayName}
            </h1>
            <p className="text-sm" style={{ color: "var(--color-ink-light)" }}>
              {t("memberSince", { date: memberDate })}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <div
            className="rounded-lg p-4 text-center"
            style={{
              backgroundColor: "rgba(255,255,255,0.5)",
              border: "1px solid rgba(139, 94, 60, 0.2)",
            }}
          >
            <p
              className="text-2xl font-bold"
              style={{ color: "var(--color-wood-dark)" }}
            >
              {solvedCount}
            </p>
            <p className="text-xs" style={{ color: "var(--color-ink-light)" }}>
              {t("puzzlesSolved")}
            </p>
          </div>
          <div
            className="rounded-lg p-4 text-center"
            style={{
              backgroundColor: "rgba(255,255,255,0.5)",
              border: "1px solid rgba(139, 94, 60, 0.2)",
            }}
          >
            <p
              className="text-2xl font-bold"
              style={{ color: "var(--color-wood-dark)" }}
            >
              {userPuzzles.length}
            </p>
            <p className="text-xs" style={{ color: "var(--color-ink-light)" }}>
              {t("puzzlesCreated")}
            </p>
          </div>
          <div
            className="rounded-lg p-4 text-center"
            style={{
              backgroundColor: "rgba(255,255,255,0.5)",
              border: "1px solid rgba(139, 94, 60, 0.2)",
            }}
          >
            <p
              className="text-2xl font-bold"
              style={{ color: "var(--color-wood-dark)" }}
            >
              {userPuzzles.reduce((sum, p) => sum + p.likes, 0)}
            </p>
            <p className="text-xs" style={{ color: "var(--color-ink-light)" }}>
              {t("totalLikes")}
            </p>
          </div>
        </div>

        {/* Created puzzles */}
        <div
          className="rounded-lg p-6"
          style={{
            backgroundColor: "rgba(255,255,255,0.5)",
            border: "1px solid rgba(139, 94, 60, 0.2)",
          }}
        >
          <h2
            className="text-lg font-semibold mb-4"
            style={{ color: "var(--color-wood-dark)" }}
          >
            {t("yourPuzzles")}
          </h2>
          {userPuzzles.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--color-ink-light)" }}>
              {t("noPuzzles")}{" "}
              <Link
                href="/puzzles/new"
                className="underline"
                style={{ color: "var(--color-wood)" }}
              >
                {t("createOne")}
              </Link>
            </p>
          ) : (
            <div className="space-y-2">
              {userPuzzles.map((puzzle) => (
                <Link
                  key={puzzle.id}
                  href={`/puzzles/${puzzle.id}`}
                  className="block rounded p-3 hover:shadow-sm transition-shadow"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.4)",
                    border: "1px solid rgba(139, 94, 60, 0.1)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="font-medium text-sm"
                      style={{ color: "var(--color-wood-dark)" }}
                    >
                      {puzzle.title}
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: "var(--color-ink-light)" }}
                    >
                      {t("likes", { count: puzzle.likes })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
