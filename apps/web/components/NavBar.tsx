"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth-context";
import LanguageSwitcher from "./LanguageSwitcher";

export default function NavBar() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const t = useTranslations("nav");
  const tAuth = useTranslations("auth");

  return (
    <nav
      className="border-b px-4 md:px-8 py-3 flex items-center justify-between"
      style={{
        borderColor: "rgba(139, 94, 60, 0.2)",
        backgroundColor: "rgba(255,255,255,0.3)",
      }}
    >
      <div className="flex items-center gap-6">
        <Link
          href="/"
          className="text-lg font-bold"
          style={{ color: "var(--color-wood-dark)" }}
        >
          {t("brand")}
        </Link>
        <div className="hidden sm:flex items-center gap-4 text-sm">
          <Link href="/rules" className="hover:underline" style={{ color: "var(--color-ink-light)" }}>{t("rules")}</Link>
          <Link href="/play" className="hover:underline" style={{ color: "var(--color-ink-light)" }}>{t("play")}</Link>
          <Link href="/puzzles" className="hover:underline" style={{ color: "var(--color-ink-light)" }}>{t("puzzles")}</Link>
          <Link href="/community" className="hover:underline" style={{ color: "var(--color-ink-light)" }}>{t("community")}</Link>
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <LanguageSwitcher />
        {loading ? null : user ? (
          <div className="flex items-center gap-3">
            <Link href="/profile" className="hover:underline" style={{ color: "var(--color-ink-light)" }}>
              {user.displayName || user.email}
            </Link>
            <button
              onClick={signOut}
              className="px-3 py-1 rounded cursor-pointer transition-colors"
              style={{ backgroundColor: "rgba(139, 94, 60, 0.15)", color: "var(--color-wood-dark)", border: "1px solid rgba(139, 94, 60, 0.3)" }}
            >
              {tAuth("signOut")}
            </button>
          </div>
        ) : (
          <button
            onClick={signInWithGoogle}
            className="px-3 py-1 rounded cursor-pointer transition-colors"
            style={{ backgroundColor: "var(--color-wood-dark)", color: "var(--color-parchment)" }}
          >
            {tAuth("signIn")}
          </button>
        )}
      </div>
    </nav>
  );
}
