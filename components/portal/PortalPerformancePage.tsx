"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useTranslations } from "@/hooks/useTranslations";

interface PerformanceRecord {
  period: string;
  returnPct: number;
  benchmarkPct?: number;
}

const periodLabels: Record<string, string> = {
  ytd: "portal.performance.ytd",
  "1y": "portal.performance.oneYear",
  "3y": "portal.performance.threeYear",
  all: "portal.performance.allTime",
};

export default function PortalPerformancePage() {
  const { t } = useTranslations();
  const [performance, setPerformance] = useState<PerformanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/portal/portfolio")
      .then((res) => res.json())
      .then((json) => {
        if (json.portfolio?.performance) setPerformance(json.portfolio.performance);
      })
      .finally(() => setLoading(false));
  }, []);

  const chartData = performance.map((p) => ({
    period: t(periodLabels[p.period] || p.period),
    return: p.returnPct,
    benchmark: p.benchmarkPct || 0,
  }));

  return (
    <div>
      <h1 className="text-3xl font-heading font-semibold text-charcoal mb-8">
        {t("portal.performance.title")}
      </h1>

      {loading ? (
        <p className="font-body text-charcoal/60">{t("common.loading")}</p>
      ) : (
        <>
          <div className="h-80 mb-8 p-6 bg-white border border-charcoal/10 rounded-lg">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} unit="%" />
                <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                <Legend />
                <Bar dataKey="return" name={t("portal.performance.return")} fill="#D4AF37" radius={[4, 4, 0, 0]} />
                <Bar dataKey="benchmark" name={t("portal.performance.benchmark")} fill="#1a1a1a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-sm font-body text-charcoal/50 italic">
            {t("portal.performance.disclaimer")}
          </p>
        </>
      )}
    </div>
  );
}
