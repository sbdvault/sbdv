import type { Metadata } from "next";
import { Locale } from "@/proxy";
import HeroSection from "@/sections/HeroSection";
import AboutSection from "@/sections/AboutSection";
import VaultsSection from "@/sections/VaultsSection";
import ServicesSection from "@/sections/ServicesSection";
import WealthTeaserSection from "@/sections/WealthTeaserSection";
import SwissStandardSection from "@/sections/SwissStandardSection";
import GlobalAccessSection from "@/sections/GlobalAccessSection";
import TestimonialsSection from "@/sections/TestimonialsSection";
import CTASection from "@/sections/CTASection";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Home | Swiss Bullion Depository Vault",
    description: "Global Trust. Swiss Security. Discreet vaulting services for private investors, institutions, and sovereign clients.",
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  await params; // Ensure params are resolved
  return (
    <>
      <HeroSection />
      <AboutSection />
      <VaultsSection />
      <ServicesSection />
      <WealthTeaserSection />
      <SwissStandardSection />
      <GlobalAccessSection />
      <TestimonialsSection />
      <CTASection />
    </>
  );
}

