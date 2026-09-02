import { Locale } from "@/proxy";
import Layout from "@/layouts/Layout";
import Providers from "@/components/Providers";
import LocaleHtmlLang from "@/components/LocaleHtmlLang";

export async function generateStaticParams() {
  return [{ locale: "en" }, { locale: "nl" }, { locale: "fr" }, { locale: "it" }];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <Providers>
      <LocaleHtmlLang locale={(locale as Locale) || "en"} />
      <Layout>{children}</Layout>
    </Providers>
  );
}

