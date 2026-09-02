import type { Metadata } from "next";
import { Locale } from "@/proxy";
import MembershipHeroSection from "@/sections/membership/MembershipHeroSection";
import MembershipTiersSection from "@/sections/membership/MembershipTiersSection";
import ComplianceSection from "@/sections/membership/ComplianceSection";
import MembershipFormSection from "@/sections/membership/MembershipFormSection";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  await params;
  return {
    title: "Membership | Swiss Bullion Depository Vault",
    description: "Exclusive membership tiers for discerning clients. Standard Custody, Executive Vault, and Sovereign Tier options available.",
  };
}

export default async function MembershipPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  await params;
  return (
    <>
      <MembershipHeroSection />
      <MembershipTiersSection />
      <ComplianceSection />
      <MembershipFormSection />
    </>
  );
}

