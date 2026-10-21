"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTranslations } from "@/hooks/useTranslations";
import {
  formatUsd,
  liveAccrued,
  liveTotal,
  type MandateSnapshot,
} from "@/components/portal/wealth-ui";

export default function PortalMandatePage() {
  const { t, locale } = useTranslations();
  const params = useParams();
  const loc = (params?.locale as string) || locale || "en";
  const [mandate, setMandate] = useState<MandateSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState<"WIRE" | "BTC">("WIRE");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [payoutBankName, setPayoutBankName] = useState("");
  const [payoutIban, setPayoutIban] = useState("");
  const [payoutSwift, setPayoutSwift] = useState("");
  const [payoutAccountName, setPayoutAccountName] = useState("");
  const [payoutBtcAddress, setPayoutBtcAddress] = useState("");

  const load = () =>
    fetch("/api/portal/wealth")
      .then((res) => res.json())
      .then((json) => {
        if (json.mandate) setMandate(json.mandate);
      });

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    const refresh = setInterval(() => load(), 15000);
    return () => {
      clearInterval(tick);
      clearInterval(refresh);
    };
  }, []);

  const post = async (url: string, body: Record<string, unknown>) => {
    setBusy(true);
    setError("");
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(json.error || t("portal.mandate.actionError"));
      return;
    }
    if (json.mandate) setMandate(json.mandate);
    setWithdrawOpen(false);
  };

  if (loading) {
    return <p className="font-body text-charcoal/60">{t("common.loading")}</p>;
  }
  if (!mandate) {
    return <p className="font-body text-charcoal/60">{t("portal.mandate.unavailable")}</p>;
  }

  const accrued = liveAccrued(mandate, now);
  const total = liveTotal(mandate, now);
  const paused = mandate.status !== "ACTIVE";
  const chartData = mandate.growth.map((point) => ({
    ...point,
    label: new Date(point.at).toLocaleDateString(),
  }));

  return (
    <div>
      <h1 className="text-3xl font-heading font-semibold text-charcoal mb-2">
        {t("portal.mandate.title")}
      </h1>
      <p className="font-body text-charcoal/60 mb-8 max-w-3xl">
        {t("portal.mandate.subtitle")}
      </p>

      {mandate.principalUsd <= 0 ? (
        <div className="p-6 bg-gold/10 border border-gold/30 rounded-lg mb-8">
          <h2 className="text-xl font-heading font-semibold text-charcoal mb-2">
            {t("portal.mandate.fundTitle")}
          </h2>
          <p className="font-body text-charcoal/70 mb-5 max-w-2xl">
            {t("portal.mandate.fundBody")}
          </p>
          <Link
            href={`/${loc}/portal/funding`}
            className="gold-shimmer inline-flex items-center justify-center px-6 py-3 bg-gold text-charcoal font-body font-medium rounded-sm hover:bg-gold/90"
          >
            {t("portal.mandate.fundCta")}
          </Link>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Stat label={t("portal.mandate.principal")} value={formatUsd(mandate.principalUsd)} />
        <Stat label={t("portal.mandate.accrued")} value={formatUsd(accrued)} gold />
        <Stat label={t("portal.mandate.total")} value={formatUsd(total)} />
        <Stat
          label={t("portal.mandate.yield")}
          value={`${mandate.annualYieldPct.toFixed(2)}%`}
          hint={paused ? t("portal.mandate.paused") : t("portal.mandate.live")}
        />
      </div>

      <p className="text-xs font-body text-charcoal/50 mb-8">
        {t("portal.overview.asOf")} {new Date(now).toLocaleString()} · {t("portal.mandate.disclaimer")}
      </p>

      <div className="p-6 bg-white border border-charcoal/10 rounded-lg mb-8">
        <h2 className="text-xl font-heading font-semibold text-charcoal mb-4">
          {t("portal.mandate.growth")}
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `$${Math.round(Number(v) / 1000)}k`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => formatUsd(Number(value))} />
              <Line type="monotone" dataKey="totalUsd" stroke="#D4AF37" strokeWidth={2} dot={false} name={t("portal.mandate.total")} />
              <Line type="monotone" dataKey="principalUsd" stroke="#1a1a1a" strokeWidth={1.5} dot={false} name={t("portal.mandate.principal")} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {error ? <p className="font-body text-sm text-red-700 mb-4">{error}</p> : null}

      <div className="flex flex-wrap gap-3 mb-10">
        <button
          disabled={busy || accrued < 0.01}
          onClick={() =>
            post("/api/portal/wealth/reinvest", { amountUsd: accrued })
          }
          className="px-5 py-3 bg-gold text-charcoal font-body text-sm rounded-sm hover:bg-gold/90 disabled:opacity-50"
        >
          {t("portal.mandate.reinvest")}
        </button>
        <button
          disabled={busy || accrued < 0.01}
          onClick={() => {
            setWithdrawAmount(accrued.toFixed(2));
            setWithdrawOpen(true);
          }}
          className="px-5 py-3 border border-gold text-gold font-body text-sm rounded-sm hover:bg-gold hover:text-charcoal disabled:opacity-50"
        >
          {t("portal.mandate.withdraw")}
        </button>
      </div>

      {withdrawOpen ? (
        <form
          className="p-6 bg-white border border-charcoal/10 rounded-lg mb-10 space-y-4 max-w-xl"
          onSubmit={(e) => {
            e.preventDefault();
            post("/api/portal/wealth/withdraw", {
              amountUsd: Number(withdrawAmount),
              payoutMethod,
              payoutBankName,
              payoutIban,
              payoutSwift,
              payoutAccountName,
              payoutBtcAddress,
            });
          }}
        >
          <h3 className="font-heading text-lg text-charcoal">{t("portal.mandate.withdrawTitle")}</h3>
          <label className="block font-body text-sm text-charcoal/70">
            {t("portal.mandate.amount")}
            <input
              type="number"
              min="0.01"
              step="0.01"
              max={accrued}
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="mt-1 w-full border border-charcoal/20 rounded-sm px-3 py-2"
              required
            />
          </label>
          <div className="flex gap-4 font-body text-sm">
            <label className="flex items-center gap-2">
              <input type="radio" checked={payoutMethod === "WIRE"} onChange={() => setPayoutMethod("WIRE")} />
              {t("portal.funding.wire")}
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" checked={payoutMethod === "BTC"} onChange={() => setPayoutMethod("BTC")} />
              {t("portal.funding.btc")}
            </label>
          </div>
          {payoutMethod === "WIRE" ? (
            <>
              <input placeholder={t("portal.mandate.accountName")} value={payoutAccountName} onChange={(e) => setPayoutAccountName(e.target.value)} className="w-full border border-charcoal/20 rounded-sm px-3 py-2 font-body text-sm" />
              <input placeholder={t("portal.mandate.bankName")} value={payoutBankName} onChange={(e) => setPayoutBankName(e.target.value)} className="w-full border border-charcoal/20 rounded-sm px-3 py-2 font-body text-sm" />
              <input placeholder="IBAN" value={payoutIban} onChange={(e) => setPayoutIban(e.target.value)} className="w-full border border-charcoal/20 rounded-sm px-3 py-2 font-body text-sm" />
              <input placeholder="SWIFT" value={payoutSwift} onChange={(e) => setPayoutSwift(e.target.value)} className="w-full border border-charcoal/20 rounded-sm px-3 py-2 font-body text-sm" />
            </>
          ) : (
            <input placeholder={t("portal.mandate.btcAddress")} value={payoutBtcAddress} onChange={(e) => setPayoutBtcAddress(e.target.value)} className="w-full border border-charcoal/20 rounded-sm px-3 py-2 font-body text-sm" required />
          )}
          <div className="flex gap-3">
            <button type="submit" disabled={busy} className="px-4 py-2 bg-gold text-charcoal font-body text-sm rounded-sm disabled:opacity-50">
              {t("portal.mandate.submitWithdraw")}
            </button>
            <button type="button" onClick={() => setWithdrawOpen(false)} className="px-4 py-2 font-body text-sm text-charcoal/60">
              {t("admin.cancel")}
            </button>
          </div>
        </form>
      ) : null}

      <h2 className="text-xl font-heading font-semibold text-charcoal mb-4">
        {t("portal.mandate.activity")}
      </h2>
      <div className="bg-white border border-charcoal/10 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-off-white border-b border-charcoal/10">
            <tr>
              <th className="text-left p-3 font-body text-xs uppercase text-charcoal/60">{t("portal.mandate.when")}</th>
              <th className="text-left p-3 font-body text-xs uppercase text-charcoal/60">{t("portal.mandate.type")}</th>
              <th className="text-left p-3 font-body text-xs uppercase text-charcoal/60">{t("portal.mandate.status")}</th>
              <th className="text-right p-3 font-body text-xs uppercase text-charcoal/60">{t("portal.mandate.amount")}</th>
            </tr>
          </thead>
          <tbody>
            {mandate.entries.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 font-body text-sm text-charcoal/50">
                  {t("portal.mandate.emptyActivity")}
                </td>
              </tr>
            ) : (
              mandate.entries.map((entry) => (
                <tr key={entry.id} className="border-b border-charcoal/5 last:border-0">
                  <td className="p-3 font-body text-sm text-charcoal/70">
                    {new Date(entry.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3 font-body text-sm">{t(`portal.mandate.types.${entry.type}`)}</td>
                  <td className="p-3 font-body text-xs uppercase tracking-wide text-charcoal/60">
                    {entry.status}
                  </td>
                  <td className="p-3 font-body text-sm text-right">{formatUsd(entry.amountUsd)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  gold,
}: {
  label: string;
  value: string;
  hint?: string;
  gold?: boolean;
}) {
  return (
    <div className="p-5 bg-white border border-charcoal/10 rounded-lg">
      <p className="text-sm font-body text-charcoal/60 mb-2">{label}</p>
      <p className={`text-2xl font-heading font-semibold ${gold ? "text-gold" : "text-charcoal"}`}>
        {value}
      </p>
      {hint ? <p className="text-xs font-body text-charcoal/50 mt-2">{hint}</p> : null}
    </div>
  );
}
