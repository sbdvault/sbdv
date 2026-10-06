import type { Metadata } from "next";
import { Locale } from "@/proxy";
import LegalPageSection from "@/sections/legal/LegalPageSection";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Investor Relations | Swiss Bullion Depository Vault",
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
