import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

type Props = { params: Promise<{ locale: string }>; children: React.ReactNode };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.profile" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      languages: { en: "/profile", es: "/es/profile", "x-default": "/profile" },
    },
  };
}

export default function Layout({ children }: Props) {
  return children;
}
