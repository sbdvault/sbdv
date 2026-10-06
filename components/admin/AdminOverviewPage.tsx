"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { formatDisclosedAum } from "@/lib/wealth-format";
import { Landmark, Crown, ArrowRightLeft, Globe2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface OverviewData {
  totals: {
    sovereignCount: number;
    privateCount: number;
    disclosedSovereignMid: number;
    disclosedPrivateMid: number;
    activeDirectives: number;
    pendingDirectives: number;
    totalAllocatedUsdM: number;
  };
  recentDirectives: {
    id: string;
    entityName: string;
    country: string;
    amountUsdM: number;
    assetClass: string;
    status: string;
    createdAt: string;
  }[];
  topSovereignCountries: { country: string; disclosedMid: number; count: number }[];
}

export default function AdminOverviewPage() {
  const { t, locale } = useTranslations();
  const params = useParams();
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  const getLocalizedHref = (href: string) =>
    `/${(params?.locale as string) || locale || "en"}${href}`;

  useEffect(() => {
    fetch("/api/admin/overview")
      .then((res) => res.json())
      .then((json) => {
        if (!json.error) setData(json);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="font-body text-charcoal/60">{t("common.loading")}</p>;
  }

  if (!data) {
    return <p className="font-body text-charcoal/60">{t("admin.loadError")}</p>;
  }

  const stats = [
    {
      label: t("admin.stats.sovereignEntities"),
      value: data.totals.sovereignCount,
      sub: formatDisclosedAum(data.totals.disclosedSovereignMid),
      icon: Landmark,
      href: "/admin/sovereign",
    },
    {
      label: t("admin.stats.privateEntities"),
      value: data.totals.privateCount,
      sub: formatDisclosedAum(data.totals.disclosedPrivateMid),
      icon: Crown,
      href: "/admin/private-wealth",
    },
    {
      label: t("admin.stats.activeDirectives"),
      value: data.totals.activeDirectives + data.totals.pendingDirectives,
      sub: `$${data.totals.totalAllocatedUsdM.toFixed(0)}M ${t("admin.stats.allocated")}`,
      icon: ArrowRightLeft,
      href: "/admin/directives",
    },
    {
      label: t("admin.stats.globalCoverage"),
      value: data.topSovereignCountries.length,
      sub: t("admin.stats.jurisdictions"),
      icon: Globe2,
      href: "/admin/sovereign",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-semibold text-charcoal mb-2">
          {t("admin.overview.title")}
        </h1>
        <p className="font-body text-charcoal/60">{t("admin.overview.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={getLocalizedHref(stat.href)}
            className="p-6 bg-white border border-charcoal/10 rounded-lg hover:border-gold/40 transition-colors group"
          >
            <div className="flex items-start justify-between mb-4">
              <stat.icon className="w-6 h-6 text-gold" />
              <span className="text-xs font-body text-charcoal/40 group-hover:text-gold">
                →
              </span>
            </div>
            <p className="text-sm font-body text-charcoal/60 mb-1">{stat.label}</p>
            <p className="text-3xl font-heading font-semibold text-charcoal">{stat.value}</p>
            <p className="text-sm font-body text-gold mt-2">{stat.sub}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <section className="bg-white border border-charcoal/10 rounded-lg p-6">
          <h2 className="text-xl font-heading font-semibold text-charcoal mb-4">
            {t("admin.overview.topJurisdictions")}
          </h2>
          <div className="space-y-3">
            {data.topSovereignCountries.map((item) => (
              <div
                key={item.country}
                className="flex items-center justify-between py-3 border-b border-charcoal/5 last:border-0"
              >
                <div>
                  <p className="font-heading font-medium text-charcoal">{item.country}</p>
                  <p className="font-body text-xs text-charcoal/50">
                    {item.count} {t("admin.entities")}
                  </p>
                </div>
                <p className="font-heading font-semibold text-gold">
                  {formatDisclosedAum(item.disclosedMid)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white border border-charcoal/10 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-heading font-semibold text-charcoal">
              {t("admin.overview.recentDirectives")}
            </h2>
            <Link
              href={getLocalizedHref("/admin/directives")}
              className="text-sm font-body text-gold hover:underline"
            >
              {t("admin.viewAll")}
            </Link>
          </div>
          {data.recentDirectives.length === 0 ? (
            <p className="font-body text-charcoal/60 text-sm">{t("admin.directives.empty")}</p>
          ) : (
            <div className="space-y-3">
              {data.recentDirectives.map((d) => (
                <div
                  key={d.id}
                  className="p-4 bg-off-white rounded-sm border border-charcoal/5"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="font-heading font-medium text-charcoal text-sm">
                        {d.entityName}
                      </p>
                      <p className="font-body text-xs text-charcoal/50">
                        {d.country} · {d.assetClass.replace(/_/g, " ")}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-heading font-semibold text-charcoal">
                        ${d.amountUsdM.toFixed(1)}M
                      </p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          d.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : d.status === "EXECUTED"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {t(`admin.directiveStatus.${d.status.toLowerCase()}`)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
