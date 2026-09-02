"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "@/hooks/useTranslations";
import { Lock, ArrowUpRight, CheckCircle2 } from "lucide-react";

interface Pool {
  id: string;
  label: string;
  focus: string;
  region: string;
  availableRange: string;
  minTicket: string;
  securityDepositPct: number;
  mandateHint: string;
  interestFrom: string;
}

export default function CapitalAccessPoolsPage() {
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
          {t("capitalAccess.pools.title")}
        </h1>
        <p className="font-body text-charcoal/60 max-w-2xl">{t("capitalAccess.pools.subtitle")}</p>
      </div>

      <div className="mb-8 p-5 bg-white border border-gold/30 rounded-lg">
        <h3 className="font-heading font-semibold text-charcoal mb-3">
          {t("capitalAccess.conditions.title")}
        </h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            "minimumOperatingYears",
            "auditedFinancials",
            "securityDeposit",
            "kycAml",
            "mandateAlignment",
            "minimumTicket",
          ].map((key) => (
            <li key={key} className="flex items-start gap-2 font-body text-sm text-charcoal/70">
              <CheckCircle2 className="w-4 h-4 text-gold shrink-0 mt-0.5" />
              {t(`capitalAccess.conditions.${key}`)}
            </li>
          ))}
        </ul>
      </div>

      {loading ? (
        <p className="font-body text-charcoal/60">{t("common.loading")}</p>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {pools.map((pool) => (
            <div
              key={pool.id}
              className="bg-white border border-charcoal/10 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6 border-b border-charcoal/5 bg-gradient-to-r from-off-white to-white">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Lock className="w-4 h-4 text-gold" />
                      <span className="font-body text-xs uppercase tracking-wide text-charcoal/40">
                        {t("capitalAccess.restrictedPool")}
                      </span>
                    </div>
                    <h2 className="text-xl font-heading font-semibold text-charcoal">{pool.label}</h2>
                    <p className="font-body text-sm text-gold mt-0.5">{pool.region}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <p className="font-body text-sm text-charcoal/80">{pool.focus}</p>
                <p className="font-body text-xs text-charcoal/50 italic border-l-2 border-gold/40 pl-3">
                  {pool.mandateHint}
                </p>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-3 bg-off-white rounded-sm">
                    <p className="font-body text-xs text-charcoal/40">{t("capitalAccess.availableRange")}</p>
                    <p className="font-heading font-semibold text-charcoal">{pool.availableRange}</p>
                  </div>
                  <div className="p-3 bg-off-white rounded-sm">
                    <p className="font-body text-xs text-charcoal/40">{t("capitalAccess.minTicket")}</p>
                    <p className="font-heading font-semibold text-charcoal">{pool.minTicket}</p>
                  </div>
                  <div className="p-3 bg-off-white rounded-sm">
                    <p className="font-body text-xs text-charcoal/40">{t("capitalAccess.interestFrom")}</p>
                    <p className="font-heading font-semibold text-gold">{pool.interestFrom}</p>
                  </div>
                  <div className="p-3 bg-off-white rounded-sm">
                    <p className="font-body text-xs text-charcoal/40">{t("capitalAccess.securityDeposit")}</p>
                    <p className="font-heading font-semibold text-charcoal">{pool.securityDepositPct}%</p>
                  </div>
                </div>

                <Link
                  href={getLocalizedHref(`/capital-access/portal/request?pool=${pool.id}`)}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-gold text-charcoal font-body font-medium rounded-sm hover:bg-gold/90 transition-colors"
                >
                  {t("capitalAccess.requestFromPool")} <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
