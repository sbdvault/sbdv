import type { Metadata } from "next";
import { pageTitle } from "@/lib/i18n";
import { Locale } from "@/proxy";
import LegalPageSection from "@/sections/legal/LegalPageSection";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: pageTitle(locale, "legal.regulatoryTitle"),
    description: "Regulatory status, KYC/AML policy, and investment risk disclosures for SBDV clients.",
  };
}

export default async function RegulatoryPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  await params;
  return (
    <LegalPageSection
      titleKey="legal.regulatoryTitle"
      introKey="legal.regulatoryIntro"
      bodyKey="legal.regulatoryBody"
    />
  );
}
