import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  const cards = [
    { href: "/rules" as const, key: "rulesCard" as const },
    { href: "/puzzles" as const, key: "puzzlesCard" as const },
    { href: "/play" as const, key: "playCard" as const },
    { href: "/community" as const, key: "communityCard" as const },
  ];

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold text-[var(--color-wood-dark)] mb-4">
          {t("title")}
        </h1>
        <p className="text-xl text-[var(--color-ink-light)] mb-8">
          {t("subtitle")}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map(({ href, key }) => (
            <Link
              key={key}
              href={href}
              className="bg-white/60 border border-[var(--color-wood)]/20 rounded-lg p-6 hover:bg-white/80 transition-colors"
            >
              <h2 className="text-lg font-semibold text-[var(--color-wood-dark)] mb-2">
                {t(`${key}.title`)}
              </h2>
              <p className="text-sm text-[var(--color-ink-light)]">
                {t(`${key}.description`)}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
