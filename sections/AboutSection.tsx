"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "@/hooks/useTranslations";

export default function AboutSection() {
  const { t, locale } = useTranslations();
  const params = useParams();
  const currentLocale = (params?.locale as string) || locale || "en";

  return (
    <section className="bg-off-white py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <p className="font-body text-xs uppercase tracking-[0.22em] text-gold">
          {t("about.eyebrow")}
        </p>
        <h2 className="mt-4 font-heading text-4xl font-semibold text-charcoal">
          {t("about.heroTitle")}
        </h2>
        <p className="mt-6 font-body text-lg leading-relaxed text-charcoal/75">
          {t("about.whoText")}
        </p>
        <Link
          href={`/${currentLocale}/about`}
          className="mt-8 inline-block border-b border-gold pb-0.5 font-body text-sm text-charcoal hover:text-gold"
        >
          {t("nav.firm")}
        </Link>
      </div>
    </section>
  );
}
