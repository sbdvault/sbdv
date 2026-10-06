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
      "Qualified enterprises worldwide may apply for institutional capital. Structured USD facilities with Swiss KYC, a 10% security deposit, and mandate-aligned investment.",
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
