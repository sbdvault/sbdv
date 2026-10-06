"use client";

import { useState } from "react";
import { buildRepaymentSchedule, repaymentReference } from "@/lib/repayment-schedule";
import { ALLOWED_UPLOAD_ACCEPT, validateUploadFile } from "@/lib/upload-validation";
import { Building2, CheckCircle2 } from "lucide-react";

type EscrowAccount = {
  bankName: string;
  bankAddress: string | null;
  accountName: string;
  accountNumber: string | null;
  iban: string;
  swift: string;
  routing?: string | null;
  reference: string;
  beneficiary: string;
  beneficiaryAddress: string | null;
  configured: boolean;
};

type FacilityAccount = {
  id: string;
  disbursedAt: string | null;
  termYears: number;
  repaymentFrequency: string;
  requestedAmountUsd: number;
  installmentUsd: number;
  interestRatePct: number;
  installmentPayments?: unknown;
  disburseBankName?: string | null;
  disburseBankAddress?: string | null;
  disburseAccountName?: string | null;
  disburseAccountNumber?: string | null;
  disburseIban?: string | null;
  disburseSwift?: string | null;
  disburseBeneficiary?: string | null;
  disburseBeneficiaryAddress?: string | null;
  companyName: string;
  escrow: EscrowAccount;
};

function formatUsd(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function FacilityRepaymentStatement({
  facility,
  t,
  onSubmitted,
}: {
  facility: FacilityAccount;
  t: (key: string) => string;
  onSubmitted: () => void;
}) {
  const [wireRef, setWireRef] = useState("");
  const [slipName, setSlipName] = useState("");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");

  if (!facility.disbursedAt) return null;

  const schedule = buildRepaymentSchedule({
    disbursedAt: facility.disbursedAt,
    termYears: facility.termYears,
    repaymentFrequency: facility.repaymentFrequency,
    principalUsd: facility.requestedAmountUsd,
    installmentUsd: facility.installmentUsd,
    payments: facility.installmentPayments,
  });
  const paid = schedule.filter((row) => row.status === "PAID");
  const next = schedule.find((row) => row.status !== "PAID") ?? null;
  const principalPaid = paid.reduce((sum, row) => sum + row.principalUsd, 0);
  const outstanding = Math.max(0, facility.requestedAmountUsd - principalPaid);
  const payable = schedule.find((row) => row.status === "DUE" || row.status === "UPCOMING") ?? null;
  const payRef = payable ? repaymentReference(facility.id, payable.installment) : "";

  const uploadSlip = async (file: File) => {
    const check = validateUploadFile({ name: file.name, type: file.type });
    if (!check.ok) {
      setFormError(check.error);
      return;
    }
    setBusy(true);
    setFormError("");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "REPAYMENT_SLIP");
    formData.append("name", file.name);
    const res = await fetch(`/api/capital-access/facility/${facility.id}/documents`, {
      method: "POST",
      body: formData,
    });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setFormError(json.error || t("capitalAccess.statement.repayFailed"));
      return;
    }
    setSlipName(file.name);
  };

  const submitRepayment = async () => {
    setBusy(true);
    setFormError("");
    const res = await fetch(`/api/capital-access/facility/${facility.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "submit_repayment", reference: wireRef }),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setFormError(json.error || t("capitalAccess.statement.repayFailed"));
      return;
    }
    setWireRef("");
    setSlipName("");
    onSubmitted();
  };

  const frequencyLabel =
    facility.repaymentFrequency === "MONTHLY"
      ? t("capitalAccess.request.monthly")
      : t("capitalAccess.request.yearly");

  return (
    <div className="space-y-6">
      <div className="p-6 bg-charcoal text-off-white rounded-lg">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-body text-xs uppercase tracking-widest text-gold mb-2">
              {t("capitalAccess.statement.liveFacility")}
            </p>
            <h2 className="font-heading text-2xl font-semibold">
              {t("capitalAccess.onboarding.facilityActive")}
            </h2>
            <p className="font-body text-sm text-off-white/70 mt-2">
              {t("capitalAccess.onboarding.disbursedOn")} {formatDate(facility.disbursedAt)}
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-green-500/15 text-green-300 font-body text-xs">
            {t("capitalAccess.onboarding.phases.active")}
          </span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {[
            [t("capitalAccess.statement.principal"), formatUsd(facility.requestedAmountUsd)],
            [t("capitalAccess.statement.outstanding"), formatUsd(outstanding)],
            [t("capitalAccess.statement.nextDue"), next ? formatDate(next.dueAt) : t("capitalAccess.statement.complete")],
            [t("capitalAccess.statement.paidCount"), `${paid.length} / ${schedule.length}`],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="font-body text-xs text-off-white/50">{label}</p>
              <p className="font-heading font-semibold text-lg mt-1">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 p-6 bg-white border border-charcoal/10 rounded-lg">
          <h3 className="font-heading font-semibold text-charcoal mb-1 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-gold" />
            {t("capitalAccess.statement.disbursedAccount")}
          </h3>
          <p className="font-body text-xs text-charcoal/50 mb-5">
            {t("capitalAccess.statement.disbursedAccountDesc")}
          </p>
          <dl className="space-y-3 font-body text-sm">
            <div>
              <dt className="text-charcoal/45">{t("capitalAccess.onboarding.bank")}</dt>
              <dd className="font-medium">{facility.disburseBankName || "—"}</dd>
              {facility.disburseBankAddress && (
                <dd className="text-charcoal/60 text-xs mt-1 whitespace-pre-line">
                  {facility.disburseBankAddress}
                </dd>
              )}
            </div>
            <div>
              <dt className="text-charcoal/45">{t("capitalAccess.onboarding.account")}</dt>
              <dd className="font-medium">{facility.disburseAccountName || "—"}</dd>
            </div>
            {facility.disburseAccountNumber && (
              <div>
                <dt className="text-charcoal/45">{t("capitalAccess.onboarding.accountNumber")}</dt>
                <dd className="font-mono">{facility.disburseAccountNumber}</dd>
              </div>
            )}
            <div>
              <dt className="text-charcoal/45">IBAN</dt>
              <dd className="font-mono break-all">{facility.disburseIban || "—"}</dd>
            </div>
            <div>
              <dt className="text-charcoal/45">SWIFT / BIC</dt>
              <dd className="font-mono">{facility.disburseSwift || "—"}</dd>
            </div>
            <div>
              <dt className="text-charcoal/45">{t("admin.capitalAccess.beneficiary")}</dt>
              <dd className="font-medium">{facility.disburseBeneficiary || facility.companyName}</dd>
              {facility.disburseBeneficiaryAddress && (
                <dd className="text-charcoal/60 text-xs mt-1 whitespace-pre-line">
                  {facility.disburseBeneficiaryAddress}
                </dd>
              )}
            </div>
          </dl>
        </div>

        <div className="lg:col-span-3 p-6 bg-white border border-charcoal/10 rounded-lg">
          <div className="flex flex-wrap justify-between gap-3 mb-4">
            <div>
              <h3 className="font-heading font-semibold text-charcoal">
                {t("capitalAccess.statement.scheduleTitle")}
              </h3>
              <p className="font-body text-xs text-charcoal/50 mt-1">
                {facility.termYears} {t("capitalAccess.request.years")} · {frequencyLabel} ·{" "}
                {facility.interestRatePct}% {t("capitalAccess.request.apr")}
              </p>
            </div>
            <div className="text-right">
              <p className="font-body text-xs text-charcoal/45">{t("capitalAccess.onboarding.installment")}</p>
              <p className="font-heading font-semibold text-gold">{formatUsd(facility.installmentUsd)}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-body text-sm">
              <thead>
                <tr className="border-b border-charcoal/10 text-xs uppercase tracking-wide text-charcoal/40">
                  <th className="py-2 pr-3 font-medium">{t("capitalAccess.statement.installment")}</th>
                  <th className="py-2 pr-3 font-medium">{t("capitalAccess.statement.due")}</th>
                  <th className="py-2 pr-3 font-medium">{t("capitalAccess.statement.amount")}</th>
                  <th className="py-2 pr-3 font-medium">{t("capitalAccess.statement.status")}</th>
                  <th className="py-2 font-medium">{t("capitalAccess.statement.paidOn")}</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((row) => (
                  <tr key={row.installment} className="border-b border-charcoal/5">
                    <td className="py-3 pr-3 font-medium">{row.ordinal}</td>
                    <td className="py-3 pr-3">{formatDate(row.dueAt)}</td>
                    <td className="py-3 pr-3">{formatUsd(row.amountUsd)}</td>
                    <td className="py-3 pr-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                          row.status === "PAID"
                            ? "bg-green-100 text-green-800"
                            : row.status === "SUBMITTED"
                              ? "bg-blue-100 text-blue-800"
                              : row.status === "DUE"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-charcoal/5 text-charcoal/50"
                        }`}
                      >
                        {row.status === "PAID" && <CheckCircle2 className="w-3 h-3" />}
                        {t(`capitalAccess.statement.statuses.${row.status.toLowerCase()}`)}
                      </span>
                    </td>
                    <td className="py-3">{row.paidAt ? formatDate(row.paidAt) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {payable && (
            <div className="mt-6 p-4 border border-gold/30 bg-off-white rounded-sm">
              <p className="font-heading font-semibold text-charcoal">
                {t("capitalAccess.statement.makePayment")} · {payable.ordinal}
              </p>
              <p className="font-body text-sm text-charcoal/60 mt-1 mb-4">
                {t("capitalAccess.statement.makePaymentDesc")} {formatUsd(payable.amountUsd)}
              </p>
              {facility.escrow.configured && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 font-body text-sm">
                  <div>
                    <p className="text-charcoal/45">{t("capitalAccess.onboarding.bank")}</p>
                    <p className="font-medium">{facility.escrow.bankName}</p>
                  </div>
                  <div>
                    <p className="text-charcoal/45">{t("capitalAccess.onboarding.account")}</p>
                    <p className="font-medium">{facility.escrow.accountName}</p>
                  </div>
                  <div>
                    <p className="text-charcoal/45">IBAN</p>
                    <p className="font-mono break-all">{facility.escrow.iban}</p>
                  </div>
                  <div>
                    <p className="text-charcoal/45">SWIFT</p>
                    <p className="font-mono">{facility.escrow.swift}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-charcoal/45">{t("capitalAccess.onboarding.wireReference")}</p>
                    <p className="font-mono font-medium">{payRef}</p>
                  </div>
                </div>
              )}
              {formError && <p className="font-body text-sm text-red-700 mb-3">{formError}</p>}
              <div className="flex flex-col sm:flex-row gap-3">
                <label className="px-4 py-2.5 border border-charcoal/20 bg-white font-body text-sm rounded-sm cursor-pointer">
                  {slipName || t("capitalAccess.onboarding.uploadSlip")}
                  <input
                    type="file"
                    accept={ALLOWED_UPLOAD_ACCEPT}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      if (file) uploadSlip(file);
                    }}
                  />
                </label>
                <input
                  value={wireRef}
                  onChange={(e) => setWireRef(e.target.value)}
                  placeholder={t("capitalAccess.onboarding.wireRefPlaceholder")}
                  className="flex-1 px-3 py-2.5 border border-charcoal/20 bg-white font-body text-sm rounded-sm"
                />
                <button
                  type="button"
                  onClick={submitRepayment}
                  disabled={busy || !wireRef.trim() || !slipName}
                  className="px-4 py-2.5 bg-gold text-charcoal font-body text-sm rounded-sm disabled:opacity-40"
                >
                  {busy ? t("common.loading") : t("capitalAccess.statement.submitRepayment")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
