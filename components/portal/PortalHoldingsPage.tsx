"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/hooks/useTranslations";

interface Holding {
  id: string;
  type: string;
  name: string;
  symbol?: string;
  quantity: number;
  unit?: string;
  costBasis: number;
  marketValue: number;
  purity?: string;
  vaultLocation?: string;
  auditStatus?: string;
}

export default function PortalHoldingsPage() {
  const { t } = useTranslations();
  const [bullion, setBullion] = useState<Holding[]>([]);
  const [financial, setFinancial] = useState<Holding[]>([]);
  const [tab, setTab] = useState<"bullion" | "financial">("bullion");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/portal/portfolio")
      .then((res) => res.json())
      .then((json) => {
        if (json.portfolio) {
          setBullion(json.portfolio.bullionHoldings || []);
          setFinancial(json.portfolio.financialHoldings || []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);

  const holdings = tab === "bullion" ? bullion : financial;

  return (
    <div>
      <h1 className="text-3xl font-heading font-semibold text-charcoal mb-8">
        {t("portal.holdings.title")}
      </h1>

      <div className="flex gap-4 mb-8">
        {(["bullion", "financial"] as const).map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-6 py-2 font-body text-sm rounded-sm transition-colors ${
              tab === key
                ? "bg-gold text-charcoal"
                : "bg-white border border-charcoal/20 text-charcoal/70 hover:border-gold"
            }`}
          >
            {t(`portal.holdings.${key}Tab`)}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="font-body text-charcoal/60">{t("common.loading")}</p>
      ) : (
        <div className="bg-white border border-charcoal/10 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-off-white">
              <tr>
                <th className="text-left p-4 font-body text-sm text-charcoal/60">Name</th>
                {tab === "bullion" ? (
                  <>
                    <th className="text-left p-4 font-body text-sm text-charcoal/60">{t("portal.holdings.weight")}</th>
                    <th className="text-left p-4 font-body text-sm text-charcoal/60">{t("portal.holdings.location")}</th>
                    <th className="text-left p-4 font-body text-sm text-charcoal/60">{t("portal.holdings.auditStatus")}</th>
                  </>
                ) : (
                  <>
                    <th className="text-left p-4 font-body text-sm text-charcoal/60">{t("portal.holdings.quantity")}</th>
                    <th className="text-left p-4 font-body text-sm text-charcoal/60">{t("portal.holdings.costBasis")}</th>
                  </>
                )}
                <th className="text-right p-4 font-body text-sm text-charcoal/60">{t("portal.holdings.marketValue")}</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((h) => (
                <tr key={h.id} className="border-t border-charcoal/10">
                  <td className="p-4 font-body text-charcoal">
                    {h.name}
                    {h.symbol && <span className="text-charcoal/50 ml-2">({h.symbol})</span>}
                  </td>
                  {tab === "bullion" ? (
                    <>
                      <td className="p-4 font-body text-charcoal/70">
                        {h.quantity} {h.unit} {h.purity && `· ${h.purity}`}
                      </td>
                      <td className="p-4 font-body text-charcoal/70">{h.vaultLocation}</td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded ${
                          h.auditStatus === "verified"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {h.auditStatus === "verified"
                            ? t("portal.holdings.verified")
                            : t("portal.holdings.pending")}
                        </span>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-4 font-body text-charcoal/70">{h.quantity}</td>
                      <td className="p-4 font-body text-charcoal/70">{formatCurrency(h.costBasis)}</td>
                    </>
                  )}
                  <td className="p-4 font-body text-charcoal text-right font-medium">
                    {formatCurrency(h.marketValue)}
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
