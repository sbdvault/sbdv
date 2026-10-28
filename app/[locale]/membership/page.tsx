import type { Metadata } from "next";
import { pageTitle } from "@/lib/i18n";
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
  const { locale } = await params;
  return {
    title: pageTitle(locale, "membership.title"),
    description:
      "Request Swiss vault custody membership — allocated bullion storage, viewing, and relationship coverage. Separate from the Wealth & Investment mandate.",
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

