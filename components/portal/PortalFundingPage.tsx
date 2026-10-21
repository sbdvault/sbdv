"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { formatUsd, type MandateSnapshot } from "@/components/portal/wealth-ui";
import { ALLOWED_UPLOAD_ACCEPT } from "@/lib/upload-validation";

export default function PortalFundingPage() {
  const { t } = useTranslations();
  const [mandate, setMandate] = useState<MandateSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState<"WIRE" | "BTC">("WIRE");
  const [amountUsd, setAmountUsd] = useState("");
  const [btcAmount, setBtcAmount] = useState("");
  const [btcTxid, setBtcTxid] = useState("");
  const [clientNote, setClientNote] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [proofBusy, setProofBusy] = useState<string | null>(null);

  const load = () =>
    fetch("/api/portal/wealth")
      .then((res) => res.json())
      .then((json) => {
        if (json.mandate) setMandate(json.mandate);
      });

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="font-body text-charcoal/60">{t("common.loading")}</p>;
  }
  if (!mandate) {
    return <p className="font-body text-charcoal/60">{t("portal.mandate.unavailable")}</p>;
  }

  const fundings = mandate.entries.filter(
    (entry) => entry.type === "DEPOSIT_WIRE" || entry.type === "DEPOSIT_BTC"
  );
  const matchingNotice = fundings.find((entry) => {
    const released =
      entry.status === "INSTRUCTED" ||
      entry.status === "PROOF_UPLOADED" ||
      entry.status === "CONFIRMED";
    if (!released) return false;
    return method === "BTC" ? entry.type === "DEPOSIT_BTC" : entry.type === "DEPOSIT_WIRE";
  });
  const matchingFunding = matchingNotice?.funding;
  const instructionsReady = Boolean(
    matchingFunding &&
      (matchingFunding.wire.configured || matchingFunding.btcReceiveAddress)
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    const res = await fetch("/api/portal/wealth/funding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        method,
        amountUsd: Number(amountUsd),
        btcAmount: btcAmount ? Number(btcAmount) : null,
        btcTxid,
        clientNote,
      }),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(json.error || t("portal.mandate.actionError"));
      return;
    }
    if (json.mandate) setMandate(json.mandate);
    setNotice(
      json.reference
        ? `${t("portal.funding.submitted")} ${json.reference}`
        : t("portal.funding.submitted")
    );
    setAmountUsd("");
    setBtcAmount("");
    setBtcTxid("");
    setClientNote("");
  };

  const uploadProof = async (entryId: string, form: HTMLFormElement) => {
    setProofBusy(entryId);
    setError("");
    const res = await fetch(`/api/portal/wealth/funding/${entryId}/proof`, {
      method: "POST",
      body: new FormData(form),
    });
    const json = await res.json().catch(() => ({}));
    setProofBusy(null);
    if (!res.ok) {
      setError(json.error || t("portal.mandate.actionError"));
      return;
    }
    if (json.mandate) setMandate(json.mandate);
  };

  return (
    <div>
      <h1 className="text-3xl font-heading font-semibold text-charcoal mb-2">
        {t("portal.funding.title")}
      </h1>
      <p className="font-body text-charcoal/60 mb-8 max-w-3xl">{t("portal.funding.subtitle")}</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <form onSubmit={submit} className="p-6 bg-white border border-charcoal/10 rounded-lg space-y-4">
          <div className="flex gap-4 font-body text-sm">
            <label className="flex items-center gap-2">
              <input type="radio" checked={method === "WIRE"} onChange={() => setMethod("WIRE")} />
              {t("portal.funding.wire")}
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" checked={method === "BTC"} onChange={() => setMethod("BTC")} />
              {t("portal.funding.btc")}
            </label>
          </div>
          <label className="block font-body text-sm text-charcoal/70">
            {t("portal.mandate.amount")} (USD)
            <input
              type="number"
              min="1"
              step="0.01"
              required
              value={amountUsd}
              onChange={(e) => setAmountUsd(e.target.value)}
              className="mt-1 w-full border border-charcoal/20 rounded-sm px-3 py-2"
            />
          </label>
          {method === "BTC" ? (
            <>
              <label className="block font-body text-sm text-charcoal/70">
                {t("portal.funding.btcAmount")}
                <input
                  type="number"
                  min="0"
                  step="0.00000001"
                  value={btcAmount}
                  onChange={(e) => setBtcAmount(e.target.value)}
                  className="mt-1 w-full border border-charcoal/20 rounded-sm px-3 py-2"
                />
              </label>
              <label className="block font-body text-sm text-charcoal/70">
                {t("portal.funding.txid")}
                <input
                  value={btcTxid}
                  onChange={(e) => setBtcTxid(e.target.value)}
                  className="mt-1 w-full border border-charcoal/20 rounded-sm px-3 py-2"
                />
              </label>
            </>
          ) : null}
          <label className="block font-body text-sm text-charcoal/70">
            {t("portal.funding.note")}
            <textarea
              value={clientNote}
              onChange={(e) => setClientNote(e.target.value)}
              className="mt-1 w-full border border-charcoal/20 rounded-sm px-3 py-2 min-h-20"
            />
          </label>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          {notice ? <p className="text-sm text-charcoal">{notice}</p> : null}
          <button
            type="submit"
            disabled={busy}
            className="px-5 py-3 bg-gold text-charcoal font-body text-sm rounded-sm hover:bg-gold/90 disabled:opacity-50"
          >
            {t("portal.funding.submit")}
          </button>
        </form>

        <div className="p-6 bg-white border border-gold/30 rounded-lg">
          <h2 className="font-heading text-lg text-charcoal mb-4">{t("portal.funding.instructions")}</h2>
          {!instructionsReady ? (
            <p className="font-body text-sm text-charcoal/60">{t("portal.funding.waitingApprove")}</p>
          ) : method === "WIRE" ? (
            matchingFunding?.wire.configured ? (
              <WireDetails wire={matchingFunding.wire} t={t} />
            ) : (
              <p className="font-body text-sm text-charcoal/60">{t("portal.funding.wireFallback")}</p>
            )
          ) : matchingFunding?.btcReceiveAddress ? (
            <BtcDetails address={matchingFunding.btcReceiveAddress} t={t} />
          ) : (
            <p className="font-body text-sm text-charcoal/60">{t("portal.funding.btcFallback")}</p>
          )}
        </div>
      </div>

      <h2 className="text-xl font-heading font-semibold text-charcoal mb-4">
        {t("portal.funding.history")}
      </h2>
      <div className="space-y-4">
        {fundings.length === 0 ? (
          <div className="bg-white border border-charcoal/10 rounded-lg p-4 font-body text-sm text-charcoal/50">
            {t("portal.funding.empty")}
          </div>
        ) : (
          fundings.map((entry) => {
            const isBtc = entry.type === "DEPOSIT_BTC";
            const showCoords =
              entry.status === "INSTRUCTED" ||
              entry.status === "PROOF_UPLOADED" ||
              entry.status === "CONFIRMED";
            return (
              <div key={entry.id} className="bg-white border border-charcoal/10 rounded-lg p-4 space-y-3">
                <div className="flex flex-wrap justify-between gap-2">
                  <p className="font-body text-sm text-charcoal">
                    {isBtc ? t("portal.funding.btc") : t("portal.funding.wire")} ·{" "}
                    {formatUsd(entry.amountUsd)}
                  </p>
                  <p className="font-body text-xs uppercase tracking-wide text-charcoal/60">
                    {entry.status}
                  </p>
                </div>
                <p className="font-mono text-xs text-charcoal/60">
                  {entry.paymentReference || "—"} · {new Date(entry.createdAt).toLocaleString()}
                </p>
                {entry.status === "PENDING" ? (
                  <p className="font-body text-sm text-charcoal/70">{t("portal.funding.waitingApprove")}</p>
                ) : null}
                {entry.status === "REJECTED" ? (
                  <p className="font-body text-sm text-charcoal/70">{t("portal.funding.rejected")}</p>
                ) : null}
                {entry.status === "CONFIRMED" ? (
                  <p className="font-body text-sm text-charcoal/70">{t("portal.funding.credited")}</p>
                ) : null}
                {entry.status === "PROOF_UPLOADED" ? (
                  <p className="font-body text-sm text-charcoal/70">
                    {t("portal.funding.proofUploaded")}
                    {entry.paymentProof?.name ? ` — ${entry.paymentProof.name}` : ""}
                  </p>
                ) : null}
                {showCoords ? (
                  <div className="border border-gold/30 rounded-sm p-3">
                    {isBtc ? (
                      entry.funding?.btcReceiveAddress ? (
                        <BtcDetails address={entry.funding.btcReceiveAddress} t={t} />
                      ) : (
                        <p className="font-body text-sm text-charcoal/60">{t("portal.funding.btcFallback")}</p>
                      )
                    ) : entry.funding?.wire.configured ? (
                      <WireDetails wire={entry.funding.wire} t={t} />
                    ) : (
                      <p className="font-body text-sm text-charcoal/60">{t("portal.funding.wireFallback")}</p>
                    )}
                  </div>
                ) : null}
                {entry.status === "INSTRUCTED" ? (
                  <form
                    className="space-y-3 border border-charcoal/10 rounded-sm p-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      uploadProof(entry.id, e.currentTarget);
                    }}
                  >
                    <p className="font-body text-sm text-charcoal">{t("portal.funding.uploadProof")}</p>
                    <p className="font-body text-xs text-charcoal/60">{t("portal.funding.uploadHint")}</p>
                    <input
                      type="file"
                      name="file"
                      required
                      accept={ALLOWED_UPLOAD_ACCEPT}
                      className="block w-full font-body text-sm"
                    />
                    {isBtc ? (
                      <label className="block font-body text-sm text-charcoal/70">
                        {t("portal.funding.txid")}
                        <input
                          name="btcTxid"
                          defaultValue={entry.btcTxid || ""}
                          className="mt-1 w-full border border-charcoal/20 rounded-sm px-3 py-2"
                        />
                      </label>
                    ) : null}
                    <label className="block font-body text-sm text-charcoal/70">
                      {t("portal.funding.note")}
                      <input
                        name="clientNote"
                        defaultValue={entry.clientNote || ""}
                        className="mt-1 w-full border border-charcoal/20 rounded-sm px-3 py-2"
                      />
                    </label>
                    <button
                      type="submit"
                      disabled={proofBusy === entry.id}
                      className="px-4 py-2 bg-gold text-charcoal font-body text-sm rounded-sm disabled:opacity-50"
                    >
                      {t("portal.funding.uploadSubmit")}
                    </button>
                  </form>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function WireDetails({
  wire,
  t,
}: {
  wire: NonNullable<MandateSnapshot["entries"][number]["funding"]>["wire"];
  t: (key: string) => string;
}) {
  return (
    <dl className="space-y-2 font-body text-sm text-charcoal/80">
      {wire.bankName ? <Row label={t("portal.mandate.bankName")} value={wire.bankName} /> : null}
      {wire.beneficiary ? <Row label={t("portal.funding.beneficiary")} value={wire.beneficiary} /> : null}
      {wire.beneficiaryAddress ? (
        <Row label={t("portal.funding.beneficiaryAddress")} value={wire.beneficiaryAddress} />
      ) : null}
      {wire.accountName ? <Row label={t("portal.mandate.accountName")} value={wire.accountName} /> : null}
      {wire.iban ? <Row label="IBAN" value={wire.iban} /> : null}
      {wire.accountNumber ? <Row label={t("portal.funding.accountNumber")} value={wire.accountNumber} /> : null}
      {wire.swift ? <Row label="SWIFT" value={wire.swift} /> : null}
      {wire.routing ? <Row label={t("portal.funding.routing")} value={wire.routing} /> : null}
      {wire.bankAddress ? <Row label={t("portal.funding.bankAddress")} value={wire.bankAddress} /> : null}
    </dl>
  );
}

function BtcDetails({ address, t }: { address: string; t: (key: string) => string }) {
  return (
    <div>
      <p className="font-body text-xs uppercase tracking-wide text-charcoal/50 mb-2">
        {t("portal.funding.btcAddress")}
      </p>
      <p className="font-mono text-sm break-all text-charcoal bg-off-white p-3 rounded-sm">{address}</p>
      <p className="font-body text-xs text-charcoal/50 mt-3">{t("portal.funding.btcNote")}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-charcoal/50">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
