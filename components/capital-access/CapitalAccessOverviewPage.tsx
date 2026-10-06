"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "@/hooks/useTranslations";
import { ArrowRight, Lock, Shield } from "lucide-react";

interface Pool {
  id: string;
  label: string;
  focus: string;
  region: string;
  availableRange: string;
  minTicket: string;
  securityDepositPct: number;
  interestFrom: string;
}

export default function CapitalAccessOverviewPage() {
  const { t, locale } = useTranslations();
  const params = useParams();
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);

  const getLocalizedHref = (href: string) =>
    `/${(params?.locale as string) || locale || "en"}${href}`;

  useEffect(() => {
    fetch("/api/capital-access/pools")
      .then((res) => res.json())
      .then((json) => setPools(json.pools || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-semibold text-charcoal mb-2">
          {t("capitalAccess.overview.title")}
        </h1>
        <p className="font-body text-charcoal/60 max-w-2xl">
          {t("capitalAccess.overview.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { step: "1", title: t("capitalAccess.steps.explore"), desc: t("capitalAccess.steps.exploreDesc") },
          { step: "2", title: t("capitalAccess.steps.apply"), desc: t("capitalAccess.steps.applyDesc") },
          { step: "3", title: t("capitalAccess.steps.review"), desc: t("capitalAccess.steps.reviewDesc") },
        ].map((s) => (
          <div key={s.step} className="p-5 bg-white border border-charcoal/10 rounded-lg">
            <span className="inline-flex w-8 h-8 items-center justify-center rounded-full bg-gold text-charcoal font-heading font-semibold text-sm mb-3">
              {s.step}
            </span>
            <h3 className="font-heading font-semibold text-charcoal mb-1">{s.title}</h3>
            <p className="font-body text-sm text-charcoal/60">{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-heading font-semibold text-charcoal">
          {t("capitalAccess.overview.featuredPools")}
        </h2>
        <Link
          href={getLocalizedHref("/capital-access/portal/pools")}
          className="flex items-center gap-1 text-sm font-body text-gold hover:underline"
        >
          {t("capitalAccess.viewAllPools")} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {loading ? (
        <p className="font-body text-charcoal/60">{t("common.loading")}</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {pools.slice(0, 4).map((pool) => (
            <div
              key={pool.id}
              className="p-6 bg-white border border-charcoal/10 rounded-lg hover:border-gold/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="font-heading font-semibold text-charcoal">{pool.label}</p>
                  <p className="font-body text-sm text-charcoal/50">{pool.region}</p>
                </div>
                <Lock className="w-5 h-5 text-gold/60 shrink-0" />
              </div>
              <p className="font-body text-sm text-charcoal/70 mb-4">{pool.focus}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="font-body text-xs text-charcoal/40">{t("capitalAccess.availableRange")}</p>
                  <p className="font-heading font-medium text-charcoal">{pool.availableRange}</p>
                </div>
                <div>
                  <p className="font-body text-xs text-charcoal/40">{t("capitalAccess.interestFrom")}</p>
                  <p className="font-heading font-medium text-gold">{pool.interestFrom} APR</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 p-6 bg-charcoal text-off-white rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-gold shrink-0 mt-0.5" />
          <div>
            <p className="font-heading font-semibold">{t("capitalAccess.overview.ctaTitle")}</p>
            <p className="font-body text-sm text-off-white/70 mt-1">{t("capitalAccess.overview.ctaDesc")}</p>
          </div>
        </div>
        <Link
          href={getLocalizedHref("/capital-access/portal/request")}
          className="px-6 py-3 bg-gold text-charcoal font-body font-medium rounded-sm hover:bg-gold/90 whitespace-nowrap"
        >
          {t("capitalAccess.startRequest")}
        </Link>
      </div>
    </div>
  );
}
