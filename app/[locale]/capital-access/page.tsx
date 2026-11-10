import type { Metadata } from "next";
import { pageTitle } from "@/lib/i18n";
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
  const { locale } = await params;
  return {
    title: pageTitle(locale, "capitalAccess.facilityTerms.eyebrow"),
    description:
      "Structured USD facilities. A 4% security deposit applies only if the company does not already vault with SBDV, and only after written approval. SBDV is not a bank.",
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
