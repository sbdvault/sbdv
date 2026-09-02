"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useTranslations } from "@/hooks/useTranslations";
import {
  calculateCapitalTerms,
  MIN_REQUEST_USD,
  MAX_REQUEST_USD,
  MIN_TERM_YEARS,
  MAX_TERM_YEARS,
  type RepaymentFrequency,
} from "@/lib/capital-access";
import { ChevronLeft, ChevronRight, Calculator } from "lucide-react";

interface Pool {
  id: string;
  label: string;
  region: string;
}

const STEPS = ["pool", "terms", "company", "review"] as const;

export default function CapitalAccessRequestPage() {
  const { t, locale } = useTranslations();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const preselectedPool = searchParams.get("pool");

  const [step, setStep] = useState(0);
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [poolId, setPoolId] = useState(preselectedPool || "");
  const [requestedAmountUsd, setRequestedAmountUsd] = useState("1000000");
  const [termYears, setTermYears] = useState("5");
  const [repaymentFrequency, setRepaymentFrequency] = useState<RepaymentFrequency>("YEARLY");
  const [companyName, setCompanyName] = useState("");
  const [companyRegistration, setCompanyRegistration] = useState("");
  const [country, setCountry] = useState("");
  const [industry, setIndustry] = useState("");
  const [investmentAreas, setInvestmentAreas] = useState("");
  const [financialsSummary, setFinancialsSummary] = useState("");
  const [annualRevenueUsd, setAnnualRevenueUsd] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const getLocalizedHref = (href: string) =>
    `/${(params?.locale as string) || locale || "en"}${href}`;

  useEffect(() => {
    fetch("/api/capital-access/pools")
      .then((res) => res.json())
      .then((json) => {
        setPools(json.pools || []);
        if (preselectedPool) setPoolId(preselectedPool);
      });
  }, [preselectedPool]);

  const terms = useMemo(() => {
    const amount = parseFloat(requestedAmountUsd) || 0;
    const term = parseInt(termYears, 10) || 1;
    if (amount < MIN_REQUEST_USD) return null;
    return calculateCapitalTerms(amount, term, repaymentFrequency);
  }, [requestedAmountUsd, termYears, repaymentFrequency]);

  const selectedPool = pools.find((p) => p.id === poolId);

  const formatUsd = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/capital-access/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poolId,
          companyName,
          companyRegistration,
          country,
          industry,
          investmentAreas,
          financialsSummary,
          annualRevenueUsd,
          requestedAmountUsd: parseFloat(requestedAmountUsd),
          termYears: parseInt(termYears, 10),
          repaymentFrequency,
          termsAccepted,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || t("capitalAccess.request.submitError"));
        return;
      }
      setSubmitted(true);
    } catch {
      setError(t("capitalAccess.request.submitError"));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">✓</span>
        </div>
        <h1 className="text-2xl font-heading font-semibold text-charcoal mb-3">
          {t("capitalAccess.request.submittedTitle")}
        </h1>
        <p className="font-body text-charcoal/60 mb-8">{t("capitalAccess.request.submittedDesc")}</p>
        <button
          onClick={() => router.push(getLocalizedHref("/capital-access/portal/applications"))}
          className="px-6 py-3 bg-gold text-charcoal font-body rounded-sm"
        >
          {t("capitalAccess.request.viewApplications")}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-semibold text-charcoal mb-2">
          {t("capitalAccess.request.title")}
        </h1>
        <p className="font-body text-charcoal/60">{t("capitalAccess.request.subtitle")}</p>
      </div>

      <div className="flex gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`flex-1 h-1 rounded-full ${i <= step ? "bg-gold" : "bg-charcoal/10"}`}
          />
        ))}
      </div>

      <div className="bg-white border border-charcoal/10 rounded-lg p-6 md:p-8">
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="font-heading font-semibold text-charcoal">{t("capitalAccess.request.selectPool")}</h2>
            <div className="space-y-3">
              {pools.map((pool) => (
                <label
                  key={pool.id}
                  className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                    poolId === pool.id ? "border-gold bg-gold/5" : "border-charcoal/10 hover:border-gold/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="pool"
                    value={pool.id}
                    checked={poolId === pool.id}
                    onChange={() => setPoolId(pool.id)}
                    className="accent-gold"
                  />
                  <div>
                    <p className="font-heading font-medium text-charcoal">{pool.label}</p>
                    <p className="font-body text-sm text-charcoal/50">{pool.region}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <h2 className="font-heading font-semibold text-charcoal flex items-center gap-2">
              <Calculator className="w-5 h-5 text-gold" />
              {t("capitalAccess.request.loanTerms")}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-body font-medium text-charcoal mb-2">
                  {t("capitalAccess.request.amount")} (USD)
                </label>
                <input
                  type="number"
                  min={MIN_REQUEST_USD}
                  max={MAX_REQUEST_USD}
                  value={requestedAmountUsd}
                  onChange={(e) => setRequestedAmountUsd(e.target.value)}
                  className="w-full px-4 py-3 border border-charcoal/20 rounded-sm focus:outline-none focus:border-gold font-body"
                />
                <p className="text-xs font-body text-charcoal/40 mt-1">
                  {formatUsd(MIN_REQUEST_USD)} – {formatUsd(MAX_REQUEST_USD)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-body font-medium text-charcoal mb-2">
                  {t("capitalAccess.request.term")}
                </label>
                <select
                  value={termYears}
                  onChange={(e) => setTermYears(e.target.value)}
                  className="w-full px-4 py-3 border border-charcoal/20 rounded-sm focus:outline-none focus:border-gold font-body bg-white"
                >
                  {Array.from({ length: MAX_TERM_YEARS - MIN_TERM_YEARS + 1 }, (_, i) => i + MIN_TERM_YEARS).map(
                    (y) => (
                      <option key={y} value={y}>
                        {y} {y === 1 ? t("capitalAccess.request.year") : t("capitalAccess.request.years")}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-body font-medium text-charcoal mb-2">
                {t("capitalAccess.request.repayment")}
              </label>
              <div className="flex gap-3">
                {(["YEARLY", "MONTHLY"] as const).map((freq) => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => setRepaymentFrequency(freq)}
                    className={`flex-1 py-3 font-body text-sm rounded-sm border transition-colors ${
                      repaymentFrequency === freq
                        ? "bg-gold text-charcoal border-gold"
                        : "border-charcoal/20 text-charcoal/70 hover:border-gold"
                    }`}
                  >
                    {t(`capitalAccess.request.${freq.toLowerCase()}`)}
                  </button>
                ))}
              </div>
            </div>

            {terms && (
              <div className="p-5 bg-off-white rounded-lg border border-gold/20 space-y-3">
                <p className="font-body text-xs uppercase tracking-wide text-gold">
                  {t("capitalAccess.request.calculatedTerms")}
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-body text-charcoal/50">{t("capitalAccess.request.apr")}</p>
                    <p className="font-heading font-semibold text-charcoal">{terms.interestRatePct}%</p>
                  </div>
                  <div>
                    <p className="font-body text-charcoal/50">{t("capitalAccess.securityDeposit")}</p>
                    <p className="font-heading font-semibold text-charcoal">
                      {formatUsd(terms.securityDepositUsd)} ({terms.securityDepositPct}%)
                    </p>
                  </div>
                  <div>
                    <p className="font-body text-charcoal/50">{t("capitalAccess.request.totalInterest")}</p>
                    <p className="font-heading font-semibold text-charcoal">{formatUsd(terms.totalInterestUsd)}</p>
                  </div>
                  <div>
                    <p className="font-body text-charcoal/50">
                      {repaymentFrequency === "MONTHLY"
                        ? t("capitalAccess.request.monthlyPayment")
                        : t("capitalAccess.request.yearlyPayment")}
                    </p>
                    <p className="font-heading font-semibold text-gold">{formatUsd(terms.installmentUsd)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h2 className="font-heading font-semibold text-charcoal">{t("capitalAccess.request.companyDetails")}</h2>
            {[
              { label: t("capitalAccess.request.companyName"), value: companyName, set: setCompanyName },
              { label: t("capitalAccess.request.registration"), value: companyRegistration, set: setCompanyRegistration },
              { label: t("capitalAccess.request.country"), value: country, set: setCountry },
              { label: t("capitalAccess.request.industry"), value: industry, set: setIndustry },
            ].map((field) => (
              <div key={field.label}>
                <label className="block text-sm font-body font-medium text-charcoal mb-2">{field.label}</label>
                <input
                  required
                  value={field.value}
                  onChange={(e) => field.set(e.target.value)}
                  className="w-full px-4 py-3 border border-charcoal/20 rounded-sm focus:outline-none focus:border-gold font-body"
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-body font-medium text-charcoal mb-2">
                {t("capitalAccess.request.annualRevenue")} (USD)
              </label>
              <input
                type="number"
                value={annualRevenueUsd}
                onChange={(e) => setAnnualRevenueUsd(e.target.value)}
                className="w-full px-4 py-3 border border-charcoal/20 rounded-sm focus:outline-none focus:border-gold font-body"
              />
            </div>
            <div>
              <label className="block text-sm font-body font-medium text-charcoal mb-2">
                {t("capitalAccess.request.investmentAreas")}
              </label>
              <textarea
                required
                rows={3}
                value={investmentAreas}
                onChange={(e) => setInvestmentAreas(e.target.value)}
                placeholder={t("capitalAccess.request.investmentAreasPlaceholder")}
                className="w-full px-4 py-3 border border-charcoal/20 rounded-sm focus:outline-none focus:border-gold font-body resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-body font-medium text-charcoal mb-2">
                {t("capitalAccess.request.financials")}
              </label>
              <textarea
                required
                rows={4}
                value={financialsSummary}
                onChange={(e) => setFinancialsSummary(e.target.value)}
                placeholder={t("capitalAccess.request.financialsPlaceholder")}
                className="w-full px-4 py-3 border border-charcoal/20 rounded-sm focus:outline-none focus:border-gold font-body resize-none"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="font-heading font-semibold text-charcoal">{t("capitalAccess.request.review")}</h2>
            <div className="space-y-4 text-sm">
              <div className="p-4 bg-off-white rounded-sm">
                <p className="font-body text-charcoal/50 mb-1">{t("capitalAccess.request.selectedPool")}</p>
                <p className="font-heading font-medium text-charcoal">{selectedPool?.label}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-charcoal/50">{t("capitalAccess.request.amount")}</p><p className="font-medium">{formatUsd(parseFloat(requestedAmountUsd))}</p></div>
                <div><p className="text-charcoal/50">{t("capitalAccess.request.term")}</p><p className="font-medium">{termYears} {t("capitalAccess.request.years")}</p></div>
                <div><p className="text-charcoal/50">{t("capitalAccess.request.apr")}</p><p className="font-medium">{terms?.interestRatePct}%</p></div>
                <div><p className="text-charcoal/50">{t("capitalAccess.securityDeposit")}</p><p className="font-medium">{formatUsd(terms?.securityDepositUsd || 0)}</p></div>
              </div>
              <div><p className="text-charcoal/50">{t("capitalAccess.request.companyName")}</p><p className="font-medium">{companyName}</p></div>
              <div><p className="text-charcoal/50">{t("capitalAccess.request.investmentAreas")}</p><p className="font-medium">{investmentAreas}</p></div>
            </div>

            <label className="flex items-start gap-3 p-4 border border-charcoal/10 rounded-sm cursor-pointer">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 accent-gold"
              />
              <span className="font-body text-sm text-charcoal/80">{t("capitalAccess.request.termsAccept")}</span>
            </label>

            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        )}

        <div className="flex justify-between mt-8 pt-6 border-t border-charcoal/10">
          <button
            type="button"
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="flex items-center gap-1 px-4 py-2 font-body text-sm text-charcoal/60 disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" /> {t("capitalAccess.request.back")}
          </button>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={step === 0 && !poolId}
              className="flex items-center gap-1 px-6 py-2 bg-gold text-charcoal font-body text-sm rounded-sm disabled:opacity-40"
            >
              {t("capitalAccess.request.continue")} <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!termsAccepted || loading}
              className="px-6 py-2 bg-gold text-charcoal font-body text-sm rounded-sm disabled:opacity-40"
            >
              {loading ? t("common.loading") : t("capitalAccess.request.submit")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
