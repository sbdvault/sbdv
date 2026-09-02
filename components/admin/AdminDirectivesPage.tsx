"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/hooks/useTranslations";

interface Directive {
  id: string;
  entityName: string;
  vehicleName: string | null;
  country: string;
  category: string;
  amountUsdM: number;
  assetClass: string;
  directive: string;
  status: string;
  notes: string | null;
  createdAt: string;
  createdBy: string;
}

export default function AdminDirectivesPage() {
  const { t } = useTranslations();
  const [directives, setDirectives] = useState<Directive[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");

  const loadData = () => {
    setLoading(true);
    fetch("/api/admin/directives")
      .then((res) => res.json())
      .then((json) => {
        if (!json.error) setDirectives(json.directives || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/admin/directives/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadData();
  };

  const filtered =
    filter === "ALL" ? directives : directives.filter((d) => d.status === filter);

  const statuses = ["ALL", "PENDING", "ACTIVE", "EXECUTED", "CANCELLED"];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-semibold text-charcoal mb-2">
          {t("admin.nav.directives")}
        </h1>
        <p className="font-body text-charcoal/60">{t("admin.directives.subtitle")}</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 font-body text-sm rounded-sm transition-colors ${
              filter === s
                ? "bg-gold text-charcoal"
                : "bg-white border border-charcoal/20 text-charcoal/70 hover:border-gold"
            }`}
          >
            {s === "ALL" ? t("admin.directives.all") : t(`admin.directiveStatus.${s.toLowerCase()}`)}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="font-body text-charcoal/60">{t("common.loading")}</p>
      ) : filtered.length === 0 ? (
        <div className="p-12 bg-white border border-charcoal/10 rounded-lg text-center">
          <p className="font-body text-charcoal/60">{t("admin.directives.empty")}</p>
        </div>
      ) : (
        <div className="bg-white border border-charcoal/10 rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-off-white border-b border-charcoal/10">
              <tr>
                <th className="p-4 font-body text-xs uppercase tracking-wide text-charcoal/60">
                  {t("admin.directives.entity")}
                </th>
                <th className="p-4 font-body text-xs uppercase tracking-wide text-charcoal/60">
                  {t("admin.directives.amount")}
                </th>
                <th className="p-4 font-body text-xs uppercase tracking-wide text-charcoal/60">
                  {t("admin.directives.assetClass")}
                </th>
                <th className="p-4 font-body text-xs uppercase tracking-wide text-charcoal/60">
                  {t("admin.directives.investmentDirective")}
                </th>
                <th className="p-4 font-body text-xs uppercase tracking-wide text-charcoal/60">
                  {t("admin.directives.status")}
                </th>
                <th className="p-4 font-body text-xs uppercase tracking-wide text-charcoal/60">
                  {t("admin.directives.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} className="border-b border-charcoal/5 last:border-0 hover:bg-off-white/50">
                  <td className="p-4">
                    <p className="font-heading font-medium text-charcoal text-sm">{d.entityName}</p>
                    <p className="font-body text-xs text-charcoal/50">
                      {d.country}
                      {d.vehicleName ? ` · ${d.vehicleName}` : ""}
                    </p>
                  </td>
                  <td className="p-4 font-heading font-semibold text-charcoal whitespace-nowrap">
                    ${d.amountUsdM.toFixed(1)}M
                  </td>
                  <td className="p-4 font-body text-sm text-charcoal/70 whitespace-nowrap">
                    {t(`admin.assetClasses.${d.assetClass.toLowerCase()}`)}
                  </td>
                  <td className="p-4 font-body text-sm text-charcoal/70 max-w-xs">
                    <p className="line-clamp-2">{d.directive}</p>
                    {d.notes && (
                      <p className="text-xs text-charcoal/40 mt-1 italic">{d.notes}</p>
                    )}
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-xs px-2 py-1 rounded whitespace-nowrap ${
                        d.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : d.status === "EXECUTED"
                            ? "bg-blue-100 text-blue-800"
                            : d.status === "CANCELLED"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {t(`admin.directiveStatus.${d.status.toLowerCase()}`)}
                    </span>
                  </td>
                  <td className="p-4">
                    {d.status === "PENDING" && (
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => updateStatus(d.id, "ACTIVE")}
                          className="text-xs px-2 py-1 bg-gold text-charcoal rounded-sm font-body"
                        >
                          {t("admin.directives.activate")}
                        </button>
                        <button
                          onClick={() => updateStatus(d.id, "CANCELLED")}
                          className="text-xs px-2 py-1 border border-red-200 text-red-700 rounded-sm font-body"
                        >
                          {t("admin.cancel")}
                        </button>
                      </div>
                    )}
                    {d.status === "ACTIVE" && (
                      <button
                        onClick={() => updateStatus(d.id, "EXECUTED")}
                        className="text-xs px-2 py-1 bg-charcoal text-off-white rounded-sm font-body"
                      >
                        {t("admin.directives.markExecuted")}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
