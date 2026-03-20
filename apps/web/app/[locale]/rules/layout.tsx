import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

type Props = { params: Promise<{ locale: string }>; children: React.ReactNode };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.rules" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      languages: { en: "/rules", es: "/es/rules", "x-default": "/rules" },
    },
  };
}

export default function Layout({ children }: Props) {
  return children;
}
