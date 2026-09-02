import type { Metadata } from "next";
import { Locale } from "@/proxy";
import LegalPageSection from "@/sections/legal/LegalPageSection";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Terms of Service | Swiss Bullion Depository Vault",
    description: "Terms governing SBDV vault custody, investment services, and client portal use.",
  };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  await params;
  return (
    <LegalPageSection
      titleKey="legal.termsTitle"
      introKey="legal.termsIntro"
      bodyKey="legal.termsBody"
    />
  );
}
