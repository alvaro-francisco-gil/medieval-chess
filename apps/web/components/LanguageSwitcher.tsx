"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: "en" | "es") => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="flex items-center gap-1 text-sm">
      <button
        onClick={() => switchLocale("en")}
        className="px-1.5 py-0.5 rounded cursor-pointer transition-colors"
        style={{
          fontWeight: locale === "en" ? 700 : 400,
          color: locale === "en" ? "var(--color-wood-dark)" : "var(--color-ink-light)",
          textDecoration: locale === "en" ? "underline" : "none",
        }}
      >
        EN
      </button>
      <span style={{ color: "var(--color-ink-light)" }}>|</span>
      <button
        onClick={() => switchLocale("es")}
        className="px-1.5 py-0.5 rounded cursor-pointer transition-colors"
        style={{
          fontWeight: locale === "es" ? 700 : 400,
          color: locale === "es" ? "var(--color-wood-dark)" : "var(--color-ink-light)",
          textDecoration: locale === "es" ? "underline" : "none",
        }}
      >
        ES
      </button>
    </div>
  );
}
