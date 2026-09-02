import type { Metadata } from "next";
import { Locale } from "@/proxy";
import LegalPageSection from "@/sections/legal/LegalPageSection";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Privacy Policy | Swiss Bullion Depository Vault",
    description: "SBDV privacy policy — Swiss FADP compliance and international privacy standards.",
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  await params;
  return (
    <LegalPageSection
      titleKey="legal.privacyTitle"
      introKey="legal.privacyIntro"
      bodyKey="legal.privacyBody"
    />
  );
}
