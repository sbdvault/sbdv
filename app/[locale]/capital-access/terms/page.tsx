import type { Metadata } from "next";
import { Locale } from "@/proxy";
import FacilityTermsDocument from "@/components/capital-access/FacilityTermsDocument";
import { FACILITY_TERMS_VERSION } from "@/lib/facility-terms";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Capital Access Facility Terms and Conditions | Swiss Bullion Depository Vault",
    description:
      "Facility terms governing the SBDV Capital Access program, including the 10% security deposit, interest, repayment, default, and Swiss governing law.",
  };
}

export default async function CapitalAccessTermsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  await params;
  return (
    <section className="bg-white min-h-[70vh] pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="sr-only">{FACILITY_TERMS_VERSION}</p>
        <FacilityTermsDocument />
      </div>
    </section>
  );
}
