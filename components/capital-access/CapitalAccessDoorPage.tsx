"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "@/hooks/useTranslations";

export default function CapitalAccessDoorPage({ track }: { track: "company" | "metal" }) {
  const { t, tArray, locale } = useTranslations();
  const params = useParams();
  const prefix = `capitalAccess.doors.${track}`;
  const steps = tArray(`${prefix}.steps`);
  const href = (path: string) => `/${(params?.locale as string) || locale || "en"}${path}`;

  return (
    <section className="bg-white min-h-[70vh] pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="font-body text-sm uppercase tracking-[0.2em] text-gold mb-3">
          {t("capitalAccess.hero.badge")}
        </p>
        <h1 className="font-heading text-4xl font-semibold text-charcoal mb-4">
          {t(`${prefix}.title`)}
        </h1>
        <p className="font-body text-charcoal/70 mb-10">{t("capitalAccess.doors.noPayment")}</p>

        <h2 className="font-heading text-2xl font-semibold text-charcoal mb-3">
          {t(`${prefix}.whoTitle`)}
        </h2>
        <p className="font-body text-charcoal/80 mb-8">{t(`${prefix}.who`)}</p>

        <h2 className="font-heading text-2xl font-semibold text-charcoal mb-3">
          {t(`${prefix}.securityTitle`)}
        </h2>
        <p className="font-body text-charcoal/80 mb-8">{t(`${prefix}.security`)}</p>

        <h2 className="font-heading text-2xl font-semibold text-charcoal mb-4">
          {t(`${prefix}.stepsTitle`)}
        </h2>
        <ol className="list-decimal pl-5 space-y-3 font-body text-charcoal/80 mb-10">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href={href(`/capital-access/register?track=${track}`)}
            className="inline-flex items-center justify-center px-6 py-3 bg-gold text-charcoal font-body font-medium rounded-sm hover:bg-gold/90"
          >
            {t("capitalAccess.doors.register")}
          </Link>
          <Link
            href={href("/capital-access/terms")}
            className="inline-flex items-center justify-center px-6 py-3 border border-charcoal/20 text-charcoal font-body rounded-sm hover:border-gold"
          >
            {t("capitalAccess.doors.readTerms")}
          </Link>
        </div>
      </div>
    </section>
  );
}
