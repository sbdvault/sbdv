"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { CountryWealthGroup, type WealthRow } from "./WealthEntityCard";

interface WealthData {
  sovereignByCountry: Record<string, WealthRow[]>;
  sovereignCountries: string[];
  totals: { sovereignCount: number };
}

export default function AdminSovereignPage() {
  const { t } = useTranslations();
  const [wealth, setWealth] = useState<WealthData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    fetch("/api/admin/wealth-entities")
      .then((res) => res.json())
      .then((json) => {
        if (!json.error) setWealth(json);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return <p className="font-body text-charcoal/60">{t("common.loading")}</p>;
  }

  if (!wealth) {
    return <p className="font-body text-charcoal/60">{t("admin.loadError")}</p>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-semibold text-charcoal mb-2">
          {t("admin.sovereignWealth")}
        </h1>
        <p className="font-body text-charcoal/60">
          {t("admin.disclosedNote")} · {wealth.totals.sovereignCount} {t("admin.entities")}
        </p>
      </div>

      {wealth.sovereignCountries.map((country) => (
        <CountryWealthGroup
          key={country}
          country={country}
          entities={wealth.sovereignByCountry[country]}
          onInvestSuccess={loadData}
        />
      ))}
    </div>
  );
}
