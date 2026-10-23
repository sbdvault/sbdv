"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import BtcReceiveDetails from "@/components/portal/BtcReceiveDetails";
import { formatUsd, type EntryFunding, type MandateSnapshot } from "@/components/portal/wealth-ui";

type WireDraft = {
  bankName: string;
  bankAddress: string;
  accountName: string;
  accountNumber: string;
  iban: string;
  swift: string;
  routing: string;
  beneficiary: string;
  beneficiaryAddress: string;
};

const emptyWire = (): WireDraft => ({
  bankName: "",
  bankAddress: "",
  accountName: "",
  accountNumber: "",
  iban: "",
  swift: "",
  routing: "",
  beneficiary: "",
  beneficiaryAddress: "",
});

type AdminMandate = MandateSnapshot & {
  client: { id: string; email: string; name: string | null };
};

const QUEUE_STATUSES = new Set(["PENDING", "INSTRUCTED", "PROOF_UPLOADED"]);

export default function AdminWealthMandatesPage() {
  const { t } = useTranslations();
  const [mandates, setMandates] = useState<AdminMandate[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [yieldDraft, setYieldDraft] = useState("");
  const [adjustDraft, setAdjustDraft] = useState("");
  const [btcRate, setBtcRate] = useState("");
  const [btcTxid, setBtcTxid] = useState("");
  const [wireDrafts, setWireDrafts] = useState<Record<string, WireDraft>>({});
  const [btcDrafts, setBtcDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  const load = () =>
    fetch("/api/admin/wealth-mandates")
      .then((res) => res.json())
      .then((json) => setMandates(json.mandates || []));

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const selected = mandates.find((row) => row.id === openId) || null;

  const act = async (id: string, body: Record<string, unknown>, method: "POST" | "PATCH" = "POST") => {
    setError("");
    const res = await fetch(`/api/admin/wealth-mandates/${id}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(json.error || t("admin.wealthMandates.actionError"));
      return;
    }
    await load();
  };

  if (loading) {
    return <p className="font-body text-charcoal/60">{t("common.loading")}</p>;
  }

  const queue = selected
    ? selected.entries.filter((entry) => {
        if (entry.type.startsWith("DEPOSIT")) return QUEUE_STATUSES.has(entry.status);
        return entry.status === "PENDING";
      })
    : [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-semibold text-charcoal mb-2">
          {t("admin.wealthMandates.title")}
        </h1>
        <p className="font-body text-charcoal/60">{t("admin.wealthMandates.subtitle")}</p>
      </div>

      {error ? <p className="font-body text-sm text-red-700 mb-4">{error}</p> : null}

      <div className="bg-white border border-charcoal/10 rounded-lg overflow-hidden mb-8">
        <table className="w-full">
          <thead className="bg-off-white border-b border-charcoal/10">
            <tr>
              <th className="text-left p-4 font-body text-xs uppercase text-charcoal/60">{t("admin.clientsName")}</th>
              <th className="text-left p-4 font-body text-xs uppercase text-charcoal/60">{t("portal.mandate.yield")}</th>
              <th className="text-right p-4 font-body text-xs uppercase text-charcoal/60">{t("portal.mandate.principal")}</th>
              <th className="text-right p-4 font-body text-xs uppercase text-charcoal/60">{t("portal.mandate.accrued")}</th>
              <th className="text-left p-4 font-body text-xs uppercase text-charcoal/60">{t("portal.mandate.status")}</th>
            </tr>
          </thead>
          <tbody>
            {mandates.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 font-body text-sm text-charcoal/50">
                  {t("admin.wealthMandates.empty")}
                </td>
              </tr>
            ) : (
              mandates.map((row) => (
                <tr
                  key={row.id}
                  className={`border-b border-charcoal/5 last:border-0 cursor-pointer ${openId === row.id ? "bg-gold/5" : ""}`}
                  onClick={() => {
                    setOpenId(row.id);
                    setYieldDraft(String(row.annualYieldPct));
                    setAdjustDraft("");
                    setBtcRate("");
                    setBtcTxid("");
                    setWireDrafts({});
                    setBtcDrafts({});
                  }}
                >
                  <td className="p-4">
                    <p className="font-body text-charcoal">{row.client.name || row.client.email}</p>
                    <p className="font-body text-xs text-charcoal/50">{row.client.email}</p>
                  </td>
                  <td className="p-4 font-body text-sm">{row.annualYieldPct}%</td>
                  <td className="p-4 font-body text-sm text-right">{formatUsd(row.principalUsd)}</td>
                  <td className="p-4 font-body text-sm text-right text-gold">{formatUsd(row.accruedInterestUsd)}</td>
                  <td className="p-4 font-body text-xs uppercase tracking-wide">{row.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected ? (
        <div className="p-6 bg-white border border-charcoal/10 rounded-lg space-y-6">
          <div className="flex flex-wrap justify-between gap-4">
            <div>
              <h2 className="font-heading text-xl text-charcoal">
                {selected.client.name || selected.client.email}
              </h2>
              <p className="font-body text-sm text-charcoal/60">
                {t("portal.mandate.total")}: {formatUsd(selected.totalValueUsd)}
              </p>
            </div>
            <button
              onClick={() =>
                act(
                  selected.id,
                  { status: selected.status === "ACTIVE" ? "PAUSED" : "ACTIVE" },
                  "PATCH"
                )
              }
              className="px-4 py-2 border border-gold text-gold font-body text-sm rounded-sm hover:bg-gold hover:text-charcoal"
            >
              {selected.status === "ACTIVE"
                ? t("admin.wealthMandates.pause")
                : t("admin.wealthMandates.resume")}
            </button>
          </div>

          <form
            className="flex flex-wrap items-end gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              act(selected.id, { annualYieldPct: Number(yieldDraft) }, "PATCH");
            }}
          >
            <label className="font-body text-sm text-charcoal/70">
              {t("admin.wealthMandates.setYield")}
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={yieldDraft}
                onChange={(e) => setYieldDraft(e.target.value)}
                className="mt-1 block border border-charcoal/20 rounded-sm px-3 py-2"
              />
            </label>
            <button type="submit" className="px-4 py-2 bg-gold text-charcoal font-body text-sm rounded-sm">
              {t("admin.wealthMandates.saveYield")}
            </button>
          </form>

          <form
            className="flex flex-wrap items-end gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              act(selected.id, { action: "adjustment", amountUsd: Number(adjustDraft) });
              setAdjustDraft("");
            }}
          >
            <label className="font-body text-sm text-charcoal/70">
              {t("admin.wealthMandates.adjustment")}
              <input
                type="number"
                step="0.01"
                value={adjustDraft}
                onChange={(e) => setAdjustDraft(e.target.value)}
                className="mt-1 block border border-charcoal/20 rounded-sm px-3 py-2"
                placeholder="± USD"
              />
            </label>
            <button type="submit" className="px-4 py-2 border border-charcoal/20 font-body text-sm rounded-sm">
              {t("admin.wealthMandates.applyAdjustment")}
            </button>
          </form>

          <div>
            <h3 className="font-heading text-lg mb-3">{t("admin.wealthMandates.pending")}</h3>
            {queue.length === 0 ? (
              <p className="font-body text-sm text-charcoal/50">{t("admin.wealthMandates.noPending")}</p>
            ) : (
              <ul className="space-y-3">
                {queue.map((entry) => {
                  const isDeposit = entry.type.startsWith("DEPOSIT");
                  const isJpeg = /\.jpe?g$/i.test(entry.paymentProof?.name || "");
                  return (
                    <li key={entry.id} className="border border-charcoal/10 rounded-sm p-4">
                      <p className="font-body text-sm text-charcoal mb-1">
                        {t(`portal.mandate.types.${entry.type}`)} · {formatUsd(entry.amountUsd)} · {entry.status}
                      </p>
                      {entry.paymentReference ? (
                        <p className="font-mono text-xs text-charcoal/60 mb-2">{entry.paymentReference}</p>
                      ) : null}
                      {entry.clientNote ? (
                        <p className="font-body text-xs text-charcoal/60 mb-2">{entry.clientNote}</p>
                      ) : null}
                      {isDeposit && entry.status === "PENDING" ? (
                        <div className="mb-3 space-y-3">
                          {entry.type === "DEPOSIT_BTC" ? (
                            <>
                              <p className="font-body text-xs text-charcoal/60">{t("admin.wealthMandates.enterBtc")}</p>
                              <label className="block">
                                <span className="font-body text-xs text-charcoal/50 uppercase tracking-wide">
                                  {t("portal.funding.btcAddress")}
                                </span>
                                <input
                                  value={btcDrafts[entry.id] || ""}
                                  onChange={(e) =>
                                    setBtcDrafts((prev) => ({ ...prev, [entry.id]: e.target.value }))
                                  }
                                  className="mt-1 w-full border border-charcoal/20 rounded-sm px-3 py-2 font-mono text-sm"
                                />
                              </label>
                            </>
                          ) : (
                            <>
                              <p className="font-body text-xs text-charcoal/60">{t("admin.wealthMandates.enterWire")}</p>
                              <p className="font-body text-xs text-charcoal/50">
                                {t("admin.wealthMandates.quoteReference")}:{" "}
                                <span className="font-mono">{entry.paymentReference}</span>
                              </p>
                              <WireInstructionForm
                                form={wireDrafts[entry.id] || emptyWire()}
                                onChange={(next) =>
                                  setWireDrafts((prev) => ({ ...prev, [entry.id]: next }))
                                }
                                t={t}
                              />
                            </>
                          )}
                        </div>
                      ) : null}
                      {isDeposit &&
                      (entry.status === "INSTRUCTED" ||
                        entry.status === "PROOF_UPLOADED" ||
                        entry.status === "CONFIRMED") &&
                      entry.funding &&
                      (entry.funding.wire.configured || entry.funding.btcReceiveAddress) ? (
                        <div className="mb-3 border border-gold/30 rounded-sm p-3">
                          <p className="font-body text-xs uppercase tracking-wide text-charcoal/50 mb-2">
                            {t("admin.wealthMandates.savedInstructions")}
                          </p>
                          <SavedFunding funding={entry.funding} t={t} />
                        </div>
                      ) : null}
                      {entry.status === "PROOF_UPLOADED" && entry.paymentProof ? (
                        <div className="mb-3 space-y-2">
                          <p className="font-body text-xs text-charcoal/70">
                            {entry.paymentProof.name}
                          </p>
                          {isJpeg ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={`/api/admin/wealth-mandates/${selected.id}/proof/${entry.id}`}
                              alt={entry.paymentProof.name}
                              className="max-h-48 border border-charcoal/10 rounded-sm"
                            />
                          ) : null}
                          <a
                            href={`/api/admin/wealth-mandates/${selected.id}/proof/${entry.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block font-body text-xs text-gold underline"
                          >
                            {t("admin.wealthMandates.openProof")}
                          </a>
                        </div>
                      ) : null}
                      {entry.type === "DEPOSIT_BTC" &&
                      (entry.status === "INSTRUCTED" || entry.status === "PROOF_UPLOADED") ? (
                        <div className="flex flex-wrap gap-2 mb-3">
                          <input
                            placeholder={t("portal.funding.txid")}
                            defaultValue={entry.btcTxid || ""}
                            onChange={(e) => setBtcTxid(e.target.value)}
                            className="border border-charcoal/20 rounded-sm px-3 py-2 font-body text-sm"
                          />
                          <input
                            placeholder="USD / BTC"
                            value={btcRate}
                            onChange={(e) => setBtcRate(e.target.value)}
                            className="border border-charcoal/20 rounded-sm px-3 py-2 font-body text-sm w-32"
                          />
                        </div>
                      ) : null}
                      <div className="flex flex-wrap gap-2">
                        {isDeposit && entry.status === "PENDING" ? (
                          <>
                            <button
                              onClick={() =>
                                act(selected.id, {
                                  action: "send_instructions",
                                  entryId: entry.id,
                                  ...(entry.type === "DEPOSIT_BTC"
                                    ? { btcReceiveAddress: btcDrafts[entry.id] || "" }
                                    : { wire: wireDrafts[entry.id] || emptyWire() }),
                                })
                              }
                              className="px-3 py-2 bg-gold text-charcoal font-body text-xs rounded-sm"
                            >
                              {t("admin.wealthMandates.approve")}
                            </button>
                            <button
                              onClick={() =>
                                act(selected.id, { action: "reject_deposit", entryId: entry.id })
                              }
                              className="px-3 py-2 border font-body text-xs rounded-sm"
                            >
                              {t("admin.reject")}
                            </button>
                          </>
                        ) : null}
                        {isDeposit && entry.status === "INSTRUCTED" ? (
                          <>
                            <p className="font-body text-xs text-charcoal/60 w-full">
                              {t("admin.wealthMandates.waitingProof")}
                            </p>
                            <button
                              onClick={() =>
                                act(selected.id, {
                                  action: "confirm_deposit",
                                  entryId: entry.id,
                                  amountUsd: entry.amountUsd,
                                  btcTxid: btcTxid || entry.btcTxid,
                                  usdPerBtc: btcRate ? Number(btcRate) : undefined,
                                })
                              }
                              className="px-3 py-2 bg-gold text-charcoal font-body text-xs rounded-sm"
                            >
                              {t("admin.wealthMandates.confirm")}
                            </button>
                            <button
                              onClick={() =>
                                act(selected.id, { action: "reject_deposit", entryId: entry.id })
                              }
                              className="px-3 py-2 border font-body text-xs rounded-sm"
                            >
                              {t("admin.reject")}
                            </button>
                          </>
                        ) : null}
                        {isDeposit && entry.status === "PROOF_UPLOADED" ? (
                          <>
                            <button
                              onClick={() =>
                                act(selected.id, {
                                  action: "confirm_deposit",
                                  entryId: entry.id,
                                  amountUsd: entry.amountUsd,
                                  btcTxid: btcTxid || entry.btcTxid,
                                  usdPerBtc: btcRate ? Number(btcRate) : undefined,
                                })
                              }
                              className="px-3 py-2 bg-gold text-charcoal font-body text-xs rounded-sm"
                            >
                              {t("admin.wealthMandates.confirm")}
                            </button>
                            <button
                              onClick={() =>
                                act(selected.id, { action: "reject_deposit", entryId: entry.id })
                              }
                              className="px-3 py-2 border font-body text-xs rounded-sm"
                            >
                              {t("admin.reject")}
                            </button>
                          </>
                        ) : null}
                        {!isDeposit ? (
                          <>
                            <p className="font-body text-xs text-charcoal/60 w-full">
                              {entry.payoutMethod === "BTC"
                                ? entry.payoutBtcAddress
                                : [entry.payoutAccountName, entry.payoutIban, entry.payoutSwift]
                                    .filter(Boolean)
                                    .join(" · ")}
                            </p>
                            <button
                              onClick={() =>
                                act(selected.id, { action: "pay_withdrawal", entryId: entry.id })
                              }
                              className="px-3 py-2 bg-gold text-charcoal font-body text-xs rounded-sm"
                            >
                              {t("admin.wealthMandates.markPaid")}
                            </button>
                            <button
                              onClick={() =>
                                act(selected.id, { action: "reject_withdrawal", entryId: entry.id })
                              }
                              className="px-3 py-2 border font-body text-xs rounded-sm"
                            >
                              {t("admin.reject")}
                            </button>
                          </>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function WireInstructionForm({
  form,
  onChange,
  t,
}: {
  form: WireDraft;
  onChange: (next: WireDraft) => void;
  t: (key: string) => string;
}) {
  const fields = [
    ["bankName", t("capitalAccess.onboarding.bank")],
    ["bankAddress", t("capitalAccess.onboarding.bankAddress")],
    ["accountName", t("capitalAccess.onboarding.account")],
    ["accountNumber", t("capitalAccess.onboarding.accountNumber")],
    ["iban", t("capitalAccess.onboarding.ibanOptional")],
    ["swift", t("capitalAccess.onboarding.swiftRequired")],
    ["routing", t("capitalAccess.onboarding.routing")],
    ["beneficiary", t("admin.capitalAccess.beneficiary")],
    ["beneficiaryAddress", t("capitalAccess.onboarding.beneficiaryAddress")],
  ] as const;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {fields.map(([key, label]) => {
        const isAddress = key === "bankAddress" || key === "beneficiaryAddress";
        return (
          <label key={key} className={`block ${isAddress ? "md:col-span-2" : ""}`}>
            <span className="font-body text-xs text-charcoal/50 uppercase tracking-wide">{label}</span>
            {isAddress ? (
              <textarea
                value={form[key]}
                onChange={(e) => onChange({ ...form, [key]: e.target.value })}
                rows={2}
                className="mt-1 w-full px-3 py-2 border border-charcoal/20 rounded-sm font-body text-sm"
              />
            ) : (
              <input
                value={form[key]}
                onChange={(e) => onChange({ ...form, [key]: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-charcoal/20 rounded-sm font-body text-sm"
              />
            )}
          </label>
        );
      })}
    </div>
  );
}

function SavedFunding({
  funding,
  t,
}: {
  funding: EntryFunding;
  t: (key: string) => string;
}) {
  if (funding.btcReceiveAddress) {
    return <BtcReceiveDetails address={funding.btcReceiveAddress} t={t} />;
  }
  const wire = funding.wire;
  return (
    <dl className="space-y-1 font-body text-sm text-charcoal/80">
      {wire.bankName ? (
        <div>
          <dt className="text-xs uppercase text-charcoal/50">{t("capitalAccess.onboarding.bank")}</dt>
          <dd>{wire.bankName}</dd>
        </div>
      ) : null}
      {wire.iban ? (
        <div>
          <dt className="text-xs uppercase text-charcoal/50">IBAN</dt>
          <dd className="font-mono">{wire.iban}</dd>
        </div>
      ) : null}
      {wire.accountNumber ? (
        <div>
          <dt className="text-xs uppercase text-charcoal/50">{t("portal.funding.accountNumber")}</dt>
          <dd className="font-mono">{wire.accountNumber}</dd>
        </div>
      ) : null}
      {wire.swift ? (
        <div>
          <dt className="text-xs uppercase text-charcoal/50">SWIFT</dt>
          <dd className="font-mono">{wire.swift}</dd>
        </div>
      ) : null}
      {wire.beneficiary ? (
        <div>
          <dt className="text-xs uppercase text-charcoal/50">{t("portal.funding.beneficiary")}</dt>
          <dd>{wire.beneficiary}</dd>
        </div>
      ) : null}
    </dl>
  );
}
