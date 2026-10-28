import type { Metadata } from "next";
import { pageTitle } from "@/lib/i18n";
import { Locale } from "@/proxy";
import VaultSection from "@/sections/vault-security/VaultSection";
import SecurityArchitectureSection from "@/sections/vault-security/SecurityArchitectureSection";
import AccessProtocolSection from "@/sections/vault-security/AccessProtocolSection";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: pageTitle(locale, "vault.title"),
    description: "Discover our state-of-the-art security architecture, multi-tiered defense systems, and exclusive access protocols.",
  };
}

export default async function VaultSecurityPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  await params;
  return (
    <>
      <VaultSection />
      <SecurityArchitectureSection />
      <AccessProtocolSection />
    </>
  );
}

