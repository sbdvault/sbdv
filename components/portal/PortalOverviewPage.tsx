"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useTranslations } from "@/hooks/useTranslations";

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
  const { t } = useTranslations();
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/portal/portfolio")
      .then((res) => res.json())
      .then((json) => {
        if (json.portfolio) setData(json.portfolio);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="font-body text-charcoal/60">{t("common.loading")}</p>;
  }

  if (!data) {
    return (
      <p className="font-body text-charcoal/60">
        No portfolio data available. Contact your relationship manager.
      </p>
    );
  }

  const chartData = Object.entries(data.allocation).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: data.currency,
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div>
      <h1 className="text-3xl font-heading font-semibold text-charcoal mb-8">
        {t("portal.overview.title")}
      </h1>

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
    </div>
  );
}
