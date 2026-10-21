"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useTranslations } from "@/hooks/useTranslations";
import {
  formatUsd,
  liveAccrued,
  liveTotal,
  type MandateSnapshot,
} from "@/components/portal/wealth-ui";

interface PortfolioData {
  totalValue: number;
  bullionValue: number;
  financialValue: number;
  currency: string;
  asOfDate: string;
  allocation: Record<string, number>;
}

const COLORS = ["#D4AF37", "#1a1a1a", "#8B7355", "#C5A572", "#4A4A4A"];

export default function PortalOverviewPage() {
  const { t, locale } = useTranslations();
  const params = useParams();
  const [data, setData] = useState<PortfolioData | null>(null);
  const [mandate, setMandate] = useState<MandateSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());
  const loc = (params?.locale as string) || locale || "en";

  useEffect(() => {
    Promise.all([
      fetch("/api/portal/portfolio").then((res) => res.json()),
      fetch("/api/portal/wealth").then((res) => res.json()),
    ])
      .then(([portfolioJson, wealthJson]) => {
        if (portfolioJson.portfolio) setData(portfolioJson.portfolio);
        if (wealthJson.mandate) setMandate(wealthJson.mandate);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (loading) {
    return <p className="font-body text-charcoal/60">{t("common.loading")}</p>;
  }

  if (!data && !mandate) {
    return (
      <p className="font-body text-charcoal/60">
        {t("portal.overview.empty")}
      </p>
    );
  }

  const chartData = data
    ? Object.entries(data.allocation).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }))
    : [];

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: data?.currency || "USD",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div>
      <h1 className="text-3xl font-heading font-semibold text-charcoal mb-8">
        {t("portal.overview.title")}
      </h1>

      {mandate ? (
        <div className="p-6 bg-charcoal text-off-white rounded-lg mb-10">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-gold mb-2">
                {t("portal.mandate.title")}
              </p>
              <p className="text-3xl font-heading font-semibold">
                {formatUsd(liveTotal(mandate, now))}
              </p>
              <p className="text-xs text-off-white/60 mt-1">
                {mandate.annualYieldPct.toFixed(2)}% {t("portal.mandate.yield")} ·{" "}
                {new Date(now).toLocaleTimeString()}
              </p>
            </div>
            <Link
              href={`/${loc}/portal/mandate`}
              className="px-4 py-2 bg-gold text-charcoal font-body text-sm rounded-sm"
            >
              {t("portal.overview.openMandate")}
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-off-white/50">{t("portal.mandate.principal")}</p>
              <p className="text-xl font-heading">{formatUsd(mandate.principalUsd)}</p>
            </div>
            <div>
              <p className="text-xs text-off-white/50">{t("portal.mandate.accrued")}</p>
              <p className="text-xl font-heading text-gold">{formatUsd(liveAccrued(mandate, now))}</p>
            </div>
            <div>
              <p className="text-xs text-off-white/50">{t("portal.overview.vaultHoldings")}</p>
              <p className="text-xl font-heading">
                {data ? formatUsd(data.totalValue) : "—"}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {data ? (
      <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="p-6 bg-white border border-charcoal/10 rounded-lg">
          <p className="text-sm font-body text-charcoal/60 mb-2">{t("portal.overview.netWorth")}</p>
          <p className="text-3xl font-heading font-semibold text-charcoal">
            {formatCurrency(data.totalValue)}
          </p>
          <p className="text-xs font-body text-charcoal/50 mt-2">
            {t("portal.overview.asOf")} {new Date(data.asOfDate).toLocaleDateString()}
          </p>
        </div>
        <div className="p-6 bg-white border border-charcoal/10 rounded-lg">
          <p className="text-sm font-body text-charcoal/60 mb-2">{t("portal.overview.bullionValue")}</p>
          <p className="text-2xl font-heading font-semibold text-gold">
            {formatCurrency(data.bullionValue)}
          </p>
        </div>
        <div className="p-6 bg-white border border-charcoal/10 rounded-lg">
          <p className="text-sm font-body text-charcoal/60 mb-2">{t("portal.overview.financialValue")}</p>
          <p className="text-2xl font-heading font-semibold text-charcoal">
            {formatCurrency(data.financialValue)}
          </p>
        </div>
      </div>

      <div className="p-6 bg-white border border-charcoal/10 rounded-lg">
        <h2 className="text-xl font-heading font-semibold text-charcoal mb-6">
          {t("portal.overview.allocation")}
        </h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      </>
      ) : null}
    </div>
  );
}
