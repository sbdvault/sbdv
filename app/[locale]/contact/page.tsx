import type { Metadata } from "next";
import { pageTitle } from "@/lib/i18n";
import { Locale } from "@/proxy";
import ContactHeroSection from "@/sections/contact/ContactHeroSection";
import ContactFormSection from "@/sections/contact/ContactFormSection";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: pageTitle(locale, "contact.title"),
    description: "Get in touch with SBDV for private inquiries, membership applications, and secure consultation services.",
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  await params;
  return (
    <>
      <ContactHeroSection />
      <ContactFormSection />
    </>
  );
}

