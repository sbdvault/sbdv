import { Locale, locales } from "@/proxy";
import Layout from "@/layouts/Layout";
import Providers from "@/components/Providers";
import LocaleHtmlLang from "@/components/LocaleHtmlLang";
import { isAdminHostName } from "@/lib/admin-host";
import { headers } from "next/headers";

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const headerList = await headers();
  const host =
    headerList.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    headerList.get("host") ||
    "";

  return (
    <Providers>
      <LocaleHtmlLang locale={(locale as Locale) || "en"} />
      <Layout isAdminHost={isAdminHostName(host)}>{children}</Layout>
    </Providers>
  );
}

