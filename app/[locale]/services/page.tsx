import type { Metadata } from "next";
import { Locale } from "@/proxy";
import ServicesHeroSection from "@/sections/services/ServicesHeroSection";
import ServicesGridSection from "@/sections/services/ServicesGridSection";
import ServicesCTA from "@/sections/services/ServicesCTA";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  await params;
  return {
    title: "Services | Swiss Bullion Depository Vault",
    description: "Comprehensive vaulting services including private vault leasing, bullion custody, insurance, and VIP viewing rooms.",
  };
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  await params;
  return (
    <>
      <ServicesHeroSection />
      <ServicesGridSection />
      <ServicesCTA />
    </>
  );
}

