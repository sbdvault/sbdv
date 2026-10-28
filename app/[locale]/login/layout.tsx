import type { Metadata } from "next";
import { pageTitle } from "@/lib/i18n";
import { Locale } from "@/proxy";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: pageTitle(locale, "login.title"),
  };
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
