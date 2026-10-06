import type { Metadata } from "next";
import { Locale } from "@/proxy";
import LegalPageSection from "@/sections/legal/LegalPageSection";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Regulatory Disclosures | Swiss Bullion Depository Vault",
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
