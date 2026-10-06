import type { Metadata } from "next";
import { Locale } from "@/proxy";
import HeroSection from "@/sections/HeroSection";
import AboutSection from "@/sections/AboutSection";
import VaultsSection from "@/sections/VaultsSection";
import ServicesSection from "@/sections/ServicesSection";
import CapitalAccessTeaserSection from "@/sections/CapitalAccessTeaserSection";
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
  await params;
  return {
    title: "Home | Swiss Bullion Depository Vault",
    description:
      "Swiss custody for private wealth and stress-free, mandate-aligned capital for qualified enterprises. Global Trust. Swiss Security.",
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  await params;
  return (
    <>
      <HeroSection />
      <AboutSection />
      <VaultsSection />
      <ServicesSection />
      <CapitalAccessTeaserSection />
      <WealthTeaserSection />
      <SwissStandardSection />
      <GlobalAccessSection />
      <TestimonialsSection />
      <CTASection />
    </>
  );
}

