"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { WealthEntityCard, type WealthRow } from "./WealthEntityCard";

export default function AdminPrivateWealthPage() {
  const { t } = useTranslations();
  const [entities, setEntities] = useState<WealthRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    fetch("/api/admin/wealth-entities")
      .then((res) => res.json())
      .then((json) => {
        if (!json.error) setEntities(json.privateWealth || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return <p className="font-body text-charcoal/60">{t("common.loading")}</p>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-semibold text-charcoal mb-2">
          {t("admin.privateWealth")}
        </h1>
        <p className="font-body text-charcoal/60">
          {t("admin.privateWealthNote")} · {entities.length} {t("admin.entities")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {entities.map((entity) => (
          <WealthEntityCard key={entity.id} entity={entity} onInvestSuccess={loadData} />
        ))}
      </div>
    </div>
  );
}
