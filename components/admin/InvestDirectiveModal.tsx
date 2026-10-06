"use client";

import { useState } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { X } from "lucide-react";
import type { WealthRow } from "./WealthEntityCard";

const ASSET_CLASSES = [
  "GLOBAL_EQUITIES",
  "FIXED_INCOME",
  "REAL_ESTATE",
  "INFRASTRUCTURE",
  "PRIVATE_EQUITY",
  "ALTERNATIVES",
  "BULLION_CUSTODY",
] as const;

interface Props {
  entity: WealthRow;
  onClose: () => void;
  onSuccess: () => void;
}

export default function InvestDirectiveModal({ entity, onClose, onSuccess }: Props) {
  const { t } = useTranslations();
  const [amountUsdM, setAmountUsdM] = useState("");
  const [assetClass, setAssetClass] = useState<string>(ASSET_CLASSES[0]);
  const [directive, setDirective] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const maxAmount = entity.availableUsdM;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const amount = parseFloat(amountUsdM);
    if (!amount || amount <= 0) {
      setError(t("admin.directives.invalidAmount"));
      return;
    }
    if (amount > maxAmount) {
      setError(t("admin.directives.exceedsAvailable"));
      return;
    }
    if (!directive.trim()) {
      setError(t("admin.directives.directiveRequired"));
      return;
    }

    setLoading(true);
    const res = await fetch("/api/admin/directives", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entityId: entity.id,
        amountUsdM: amount,
        assetClass,
        directive: directive.trim(),
        notes: notes.trim() || undefined,
      }),
    });
    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(json.error || t("admin.directives.submitError"));
      return;
    }
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between p-6 border-b border-charcoal/10">
          <div>
            <p className="font-body text-xs uppercase tracking-wide text-gold mb-1">
              {t("admin.allocateCapital")}
            </p>
            <h2 className="text-xl font-heading font-semibold text-charcoal">{entity.name}</h2>
            <p className="font-body text-sm text-charcoal/60 mt-1">
              {entity.vehicleName} · {entity.country}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-charcoal/50 hover:text-charcoal rounded-sm"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="p-4 bg-off-white rounded-sm border border-charcoal/5">
            <p className="font-body text-xs text-charcoal/50 mb-1">{t("admin.directives.available")}</p>
            <p className="font-heading font-semibold text-charcoal">
              ${maxAmount.toFixed(1)}M
            </p>
            <p className="font-body text-xs text-charcoal/50 mt-2 line-clamp-2">{entity.mandate}</p>
          </div>

          <div>
            <label className="block text-sm font-body font-medium text-charcoal mb-2">
              {t("admin.directives.amount")} (USD M)
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              max={maxAmount}
              required
              value={amountUsdM}
              onChange={(e) => setAmountUsdM(e.target.value)}
              className="w-full px-4 py-3 border border-charcoal/20 rounded-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold font-body"
              placeholder={`Max ${maxAmount.toFixed(1)}`}
            />
          </div>

          <div>
            <label className="block text-sm font-body font-medium text-charcoal mb-2">
              {t("admin.directives.assetClass")}
            </label>
            <select
              value={assetClass}
              onChange={(e) => setAssetClass(e.target.value)}
              className="w-full px-4 py-3 border border-charcoal/20 rounded-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold font-body bg-white"
            >
              {ASSET_CLASSES.map((ac) => (
                <option key={ac} value={ac}>
                  {t(`admin.assetClasses.${ac.toLowerCase()}`)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-body font-medium text-charcoal mb-2">
              {t("admin.directives.investmentDirective")}
            </label>
            <textarea
              required
              rows={3}
              value={directive}
              onChange={(e) => setDirective(e.target.value)}
              placeholder={t("admin.directives.directivePlaceholder")}
              className="w-full px-4 py-3 border border-charcoal/20 rounded-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold font-body resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-body font-medium text-charcoal mb-2">
              {t("admin.directives.notes")} ({t("admin.optional")})
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 border border-charcoal/20 rounded-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold font-body"
            />
          </div>

          {error && (
            <p className="text-sm font-body text-red-600 bg-red-50 px-4 py-2 rounded-sm">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gold text-charcoal font-body font-medium rounded-sm hover:bg-gold/90 disabled:opacity-50"
            >
              {loading ? t("common.loading") : t("admin.directives.submit")}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-charcoal/20 text-charcoal font-body rounded-sm hover:bg-off-white"
            >
              {t("admin.cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
