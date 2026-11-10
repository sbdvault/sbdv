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
    title: pageTitle(locale, "capitalAccess.doors.company.title"),
    description:
      "Company facility. A 4% security deposit is requested only after written approval. No payment is due to read the terms or to apply.",
  };
}

export default async function CompanyFacilityPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  await params;
  return <CapitalAccessDoorPage track="company" />;
}
