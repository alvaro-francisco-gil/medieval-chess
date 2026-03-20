import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <main
      className="min-h-screen p-8 flex flex-col items-center justify-center"
      style={{ backgroundColor: "var(--color-parchment)" }}
    >
      <h1
        className="text-3xl font-bold mb-2"
        style={{ color: "var(--color-wood-dark)" }}
      >
        {t("title")}
      </h1>
      <p className="mb-4" style={{ color: "var(--color-ink-light)" }}>
        {t("description")}
      </p>
      <Link
        href="/"
        className="px-4 py-2 rounded text-sm font-medium"
        style={{
          backgroundColor: "var(--color-wood-dark)",
          color: "var(--color-parchment)",
        }}
      >
        {t("goHome")}
      </Link>
    </main>
  );
}
