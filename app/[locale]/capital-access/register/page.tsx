import type { Metadata } from "next";
import CapitalAccessRegisterPage from "@/components/capital-access/CapitalAccessRegisterPage";
import { pageTitle } from "@/lib/i18n";
import { Locale } from "@/proxy";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: pageTitle(locale, "capitalAccess.register.title"),
  };
}

export default function RegisterPage() {
  return <CapitalAccessRegisterPage />;
}
