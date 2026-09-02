import type { Metadata } from "next";
import { Locale } from "@/proxy";
import CapitalAccessHeroSection, {
  CapitalAccessFeaturesSection,
  CapitalAccessHowItWorksSection,
} from "@/sections/capital-access/CapitalAccessSections";
import CTASection from "@/sections/CTASection";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  await params;
  return {
    title: "Capital Access Program | Swiss Bullion Depository Vault",
    description:
      "Access institutional sovereign capital for qualified enterprises. Structured lending with transparent terms, security deposit, and mandate-aligned investment.",
  };
}

export default async function CapitalAccessPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  await params;
  return (
    <>
      <CapitalAccessHeroSection />
      <CapitalAccessFeaturesSection />
      <CapitalAccessHowItWorksSection />
      <CTASection />
    </>
  );
}
