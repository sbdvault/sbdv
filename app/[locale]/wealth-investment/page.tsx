import type { Metadata } from "next";
import { auth } from "@/auth";
import { pageTitle } from "@/lib/i18n";
import { Locale } from "@/proxy";
import WealthHeroSection from "@/sections/wealth/WealthHeroSection";
import WealthPillarsSection from "@/sections/wealth/WealthPillarsSection";
import WealthApproachSection from "@/sections/wealth/WealthApproachSection";
import WealthGrowthSection from "@/sections/wealth/WealthGrowthSection";
import WealthRegisterSection from "@/sections/wealth/WealthRegisterSection";
import WealthCloseSection from "@/sections/wealth/WealthCloseSection";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: pageTitle(locale, "wealth.title"),
    description:
      "Private clients fund a wealth mandate by wire or Bitcoin. SBDV invests the principal. Monitor live yield, then withdraw or reinvest interest.",
  };
}

export default async function WealthInvestmentPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  await params;
  const session = await auth();
  const alreadyClient = session?.user?.role === "CLIENT";

  return (
    <>
      <WealthHeroSection />
      <WealthPillarsSection />
      <WealthApproachSection />
      <WealthGrowthSection />
      <WealthRegisterSection alreadyClient={alreadyClient} />
      <WealthCloseSection />
    </>
  );
}
