import type { Metadata } from "next";
import { Locale } from "@/proxy";
import WealthHeroSection from "@/sections/wealth/WealthHeroSection";
import WealthPillarsSection from "@/sections/wealth/WealthPillarsSection";
import WealthApproachSection from "@/sections/wealth/WealthApproachSection";
import CTASection from "@/sections/CTASection";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  await params;
  return {
    title: "Wealth & Investment | Swiss Bullion Depository Vault",
    description:
      "Strategic portfolio management, investment advisory, and precious metals allocation integrated with Swiss custody excellence.",
  };
}

export default async function WealthInvestmentPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  await params;
  return (
    <>
      <WealthHeroSection />
      <WealthPillarsSection />
      <WealthApproachSection />
      <CTASection />
    </>
  );
}
