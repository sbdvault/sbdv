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
    title: pageTitle(locale, "legal.investorRelationsTitle"),
    description: "Governance, transparency, and institutional communications from SBDV.",
  };
}

export default async function InvestorRelationsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  await params;
  return (
    <LegalPageSection
      titleKey="legal.investorRelationsTitle"
      introKey="legal.investorRelationsIntro"
      bodyKey="legal.investorRelationsBody"
    />
  );
}
