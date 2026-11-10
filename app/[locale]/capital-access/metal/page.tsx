import type { Metadata } from "next";
import CapitalAccessDoorPage from "@/components/capital-access/CapitalAccessDoorPage";
import { pageTitle } from "@/lib/i18n";
import { Locale } from "@/proxy";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: pageTitle(locale, "capitalAccess.doors.metal.title"),
    description:
      "Advance against gold or silver already vaulted with SBDV. No cash security deposit. The metal stays in the client’s name until repayment.",
  };
}

export default async function MetalFacilityPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  await params;
  return <CapitalAccessDoorPage track="metal" />;
}
