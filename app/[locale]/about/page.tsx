import type { Metadata } from "next";
import { Locale } from "@/proxy";
import AboutHeroSection from "@/sections/about/AboutHeroSection";
import AboutContentSection from "@/sections/about/AboutContentSection";
import LocationSection from "@/sections/about/LocationSection";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  await params;
  return {
    title: "About | Swiss Bullion Depository Vault",
    description: "Learn about SBDV - a private Swiss institution safeguarding global wealth with uncompromising security and Swiss precision.",
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  await params;
  return (
    <>
      <AboutHeroSection />
      <AboutContentSection />
      <LocationSection />
    </>
  );
}

