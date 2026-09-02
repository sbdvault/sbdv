"use client";

import { useState } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { countryFlag } from "@/lib/wealth-format";
import { ChevronDown, ChevronUp, ArrowUpRight } from "lucide-react";
import InvestDirectiveModal from "./InvestDirectiveModal";

export interface WealthRow {
  id: string;
  country: string;
  region: string | null;
  name: string;
  vehicleName: string | null;
  mandate: string;
  category?: string;
  categoryLabel: string;
  disclosedAum: string;
  disclosedMid: number;
  disclosedMax: number;
  fractionPct: number;
  allocatedUsdM: number;
  availableUsdM: number;
}

interface WealthEntityCardProps {
  entity: WealthRow;
  onInvestSuccess: () => void;
}

export function WealthEntityCard({ entity, onInvestSuccess }: WealthEntityCardProps) {
  const { t } = useTranslations();
  const [expanded, setExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const allocationPct =
    entity.disclosedMax > 0
      ? Math.min(100, (entity.allocatedUsdM / (entity.disclosedMax * 1000)) * 100)
      : 0;

  return (
    <>
      <div className="bg-white border border-charcoal/10 rounded-lg overflow-hidden hover:border-gold/30 transition-colors">
        <div className="p-5">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="min-w-0">
              <p className="font-heading font-semibold text-charcoal">{entity.name}</p>
              {entity.vehicleName && (
                <p className="font-body text-sm text-gold mt-0.5">{entity.vehicleName}</p>
              )}
              {entity.categoryLabel && entity.category !== "SOVEREIGN" && (
                <span className="inline-block mt-2 text-xs px-2 py-0.5 bg-charcoal/5 text-charcoal/70 rounded">
                  {entity.categoryLabel}
                </span>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="font-heading font-semibold text-charcoal">{entity.disclosedAum}</p>
              <p className="font-body text-xs text-charcoal/50 mt-0.5">
                {entity.fractionPct}% {t("admin.disclosedSlice")}
              </p>
            </div>
          </div>

          <p className="font-body text-sm text-charcoal/70 line-clamp-2 mb-4">{entity.mandate}</p>

          <div className="mb-4">
            <div className="flex justify-between text-xs font-body text-charcoal/50 mb-1">
              <span>{t("admin.allocated")}</span>
              <span>
                ${entity.allocatedUsdM.toFixed(1)}M / ${(entity.disclosedMax * 1000).toFixed(0)}M
              </span>
            </div>
            <div className="h-1.5 bg-charcoal/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gold rounded-full transition-all"
                style={{ width: `${allocationPct}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowModal(true)}
              disabled={entity.availableUsdM <= 0}
              className="flex items-center gap-2 px-4 py-2 bg-gold text-charcoal font-body text-sm rounded-sm hover:bg-gold/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ArrowUpRight className="w-4 h-4" />
              {t("admin.allocateCapital")}
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 px-3 py-2 font-body text-sm text-charcoal/60 hover:text-charcoal"
            >
              {expanded ? (
                <>
                  {t("admin.hideMandate")} <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  {t("admin.viewMandate")} <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {expanded && (
          <div className="px-5 pb-5 pt-0 border-t border-charcoal/5 mt-0">
            <p className="font-body text-xs uppercase tracking-wide text-charcoal/40 mb-2 mt-4">
              {t("admin.fullMandate")}
            </p>
            <p className="font-body text-sm text-charcoal/80 leading-relaxed">{entity.mandate}</p>
            {entity.region && (
              <p className="font-body text-xs text-charcoal/50 mt-3">
                {t("admin.region")}: {entity.region}
              </p>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <InvestDirectiveModal
          entity={entity}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            onInvestSuccess();
          }}
        />
      )}
    </>
  );
}

interface CountryGroupProps {
  country: string;
  entities: WealthRow[];
  onInvestSuccess: () => void;
}

export function CountryWealthGroup({ country, entities, onInvestSuccess }: CountryGroupProps) {
  const { t } = useTranslations();
  const totalDisclosed = entities.reduce((s, e) => s + e.disclosedMid, 0);

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-charcoal/10">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{countryFlag(country)}</span>
          <div>
            <h2 className="text-xl font-heading font-semibold text-charcoal">{country}</h2>
            <p className="font-body text-sm text-charcoal/50">
              {entities.length} {entities.length === 1 ? t("admin.entitySingular") : t("admin.entities")}
            </p>
          </div>
        </div>
        <p className="font-heading font-semibold text-gold hidden sm:block">
          ${(totalDisclosed * 1000).toFixed(0)}M disclosed
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {entities.map((entity) => (
          <WealthEntityCard key={entity.id} entity={entity} onInvestSuccess={onInvestSuccess} />
        ))}
      </div>
    </section>
  );
}
