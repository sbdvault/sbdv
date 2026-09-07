"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "@/hooks/useTranslations";
import {
  FACILITY_TERMS_EFFECTIVE,
  FACILITY_TERMS_VERSION,
  facilityTermsArticles,
} from "@/lib/facility-terms";

export default function FacilityTermsDocument() {
  const { t, locale } = useTranslations();
  const params = useParams();
  const currentLocale = (params?.locale as string) || locale || "en";
  const facilityHref = `/${currentLocale}/capital-access/portal/facility`;

  return (
    <article className="bg-white">
      <header className="border-b border-charcoal/10 pb-8 mb-10">
        <p className="font-body text-xs uppercase tracking-[0.22em] text-gold mb-3">
          {t("capitalAccess.facilityTerms.eyebrow")}
        </p>
        <h1 className="font-heading text-3xl md:text-4xl font-semibold text-charcoal leading-tight">
          {t("capitalAccess.facilityTerms.pageTitle")}
        </h1>
        <p className="font-body text-charcoal/70 mt-4 max-w-2xl leading-relaxed">
          {t("capitalAccess.facilityTerms.intro")}
        </p>
        <dl className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm font-body">
          <div className="p-4 bg-off-white rounded-sm">
            <dt className="text-charcoal/45">{t("capitalAccess.facilityTerms.versionLabel")}</dt>
            <dd className="font-medium text-charcoal mt-1">{FACILITY_TERMS_VERSION}</dd>
          </div>
          <div className="p-4 bg-off-white rounded-sm">
            <dt className="text-charcoal/45">{t("capitalAccess.facilityTerms.effectiveLabel")}</dt>
            <dd className="font-medium text-charcoal mt-1">{FACILITY_TERMS_EFFECTIVE}</dd>
          </div>
          <div className="p-4 bg-off-white rounded-sm">
            <dt className="text-charcoal/45">{t("capitalAccess.facilityTerms.languageLabel")}</dt>
            <dd className="font-medium text-charcoal mt-1">English</dd>
          </div>
        </dl>
        <p className="font-body text-xs text-charcoal/50 mt-4">
          {t("capitalAccess.facilityTerms.governingNote")}
        </p>
      </header>

      <nav aria-label={t("capitalAccess.facilityTerms.contents")} className="mb-12 p-5 border border-charcoal/10 rounded-sm">
        <p className="font-heading text-sm font-semibold text-charcoal mb-3">
          {t("capitalAccess.facilityTerms.contents")}
        </p>
        <ol className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1.5 font-body text-sm">
          {facilityTermsArticles.map((article) => (
            <li key={article.id}>
              <a href={`#${article.id}`} className="text-charcoal/70 hover:text-gold">
                {article.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="space-y-10">
        {facilityTermsArticles.map((article) => (
          <section key={article.id} id={article.id} className="scroll-mt-28">
            <h2 className="font-heading text-xl font-semibold text-charcoal mb-3 border-b border-gold/40 pb-2">
              {article.title}
            </h2>
            <div className="space-y-3">
              {article.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 48)} className="font-body text-[15px] text-charcoal/75 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <footer className="mt-14 pt-8 border-t border-charcoal/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="font-body text-xs text-charcoal/45">
          {FACILITY_TERMS_VERSION} · {FACILITY_TERMS_EFFECTIVE}
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 border border-charcoal/20 font-body text-sm text-charcoal rounded-sm"
          >
            {t("capitalAccess.facilityTerms.print")}
          </button>
          <Link
            href={facilityHref}
            className="px-4 py-2 bg-gold text-charcoal font-body text-sm rounded-sm"
          >
            {t("capitalAccess.facilityTerms.backFacility")}
          </Link>
        </div>
      </footer>
    </article>
  );
}
