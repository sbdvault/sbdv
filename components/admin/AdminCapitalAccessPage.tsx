"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import {
  getNextAdminAction,
  hasPaymentSlip,
  hasRequiredDocuments,
  ONBOARDING_PHASES,
  PAYMENT_SLIP_TYPE,
  REQUIRED_DOCUMENT_TYPES,
} from "@/lib/capital-access-onboarding";
import { Building2, ChevronDown, ChevronUp, FileText } from "lucide-react";

interface Application {
  id: string;
  companyName: string;
  country: string;
  industry: string;
  requestedAmountUsd: number;
  interestRatePct: number;
  termYears: number;
  repaymentFrequency: string;
  securityDepositUsd: number;
  investmentAreas: string;
  status: string;
  onboardingPhase: string | null;
  adminNotes: string | null;
  depositReference: string | null;
  depositSubmittedAt: string | null;
  depositConfirmedAt: string | null;
  relationshipManager: string | null;
  poolLabel: string;
  docsComplete?: boolean;
  user: { name: string | null; email: string };
  documents: { id: string; type: string; name: string; uploadedAt?: string }[];
  escrow: {
    bankName: string;
    bankAddress: string | null;
    accountName: string;
    accountNumber: string | null;
    iban: string;
    swift: string;
    reference: string;
    beneficiary: string;
    beneficiaryAddress: string | null;
    configured: boolean;
  };
  createdAt: string;
}

interface EscrowForm {
  bankName: string;
  bankAddress: string;
  accountName: string;
  accountNumber: string;
  iban: string;
  swift: string;
  beneficiary: string;
  beneficiaryAddress: string;
  paymentReference: string;
}

function EscrowFieldsForm({
  form,
  onChange,
  t,
}: {
  form: EscrowForm;
  onChange: (next: EscrowForm) => void;
  t: (key: string) => string;
}) {
  const fields = [
    ["bankName", t("capitalAccess.onboarding.bank")],
    ["bankAddress", t("capitalAccess.onboarding.bankAddress")],
    ["accountName", t("capitalAccess.onboarding.account")],
    ["accountNumber", t("capitalAccess.onboarding.accountNumber")],
    ["iban", "IBAN"],
    ["swift", "SWIFT"],
    ["beneficiary", t("admin.capitalAccess.beneficiary")],
    ["beneficiaryAddress", t("capitalAccess.onboarding.beneficiaryAddress")],
    ["paymentReference", t("capitalAccess.onboarding.wireReference")],
  ] as const;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className="mt-1 w-full px-3 py-2.5 border border-charcoal/20 rounded-sm font-body text-sm focus:outline-none focus:border-gold resize-y"
              />
            ) : (
              <input
                value={form[key]}
                onChange={(e) => onChange({ ...form, [key]: e.target.value })}
                className="mt-1 w-full px-3 py-2.5 border border-charcoal/20 rounded-sm font-body text-sm focus:outline-none focus:border-gold"
                required={key !== "beneficiary" && key !== "paymentReference" && key !== "accountNumber"}
              />
            )}
          </label>
        );
      })}
    </div>
  );
}

export default function AdminCapitalAccessPage() {
  const { t } = useTranslations();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [extraNotes, setExtraNotes] = useState("");
  const [escrowForm, setEscrowForm] = useState<EscrowForm>({
    bankName: "",
    bankAddress: "",
    accountName: "",
    accountNumber: "",
    iban: "",
    swift: "",
    beneficiary: "",
    beneficiaryAddress: "",
    paymentReference: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadData = () => {
    setLoading(true);
    fetch("/api/admin/capital-access")
      .then((res) => res.json())
      .then((json) => setApplications(json.applications || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const openReview = (app: Application) => {
    setError("");
    if (reviewingId === app.id) {
      setReviewingId(null);
      return;
    }
    setReviewingId(app.id);
    setExtraNotes(app.adminNotes || "");
    setEscrowForm({
      bankName: app.escrow.configured ? app.escrow.bankName : "",
      bankAddress: app.escrow.bankAddress || "",
      accountName: app.escrow.configured ? app.escrow.accountName : "",
      accountNumber: app.escrow.accountNumber || "",
      iban: app.escrow.configured ? app.escrow.iban : "",
      swift: app.escrow.configured ? app.escrow.swift : "",
      beneficiary: app.escrow.beneficiary || app.companyName,
      beneficiaryAddress: app.escrow.beneficiaryAddress || "",
      paymentReference: app.escrow.reference || `CAP-${app.id.slice(-8).toUpperCase()}`,
    });
  };

  const updateStatus = async (id: string, status: string) => {
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/capital-access", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setSaving(false);
    if (!res.ok) {
      const json = await res.json();
      setError(json.error || t("admin.capitalAccess.error"));
      return;
    }
    setReviewingId(null);
    loadData();
  };

  const requestExtraDocuments = async (id: string) => {
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/capital-access", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        action: "request_extra_documents",
        adminNotes: extraNotes,
      }),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(json.error || t("admin.capitalAccess.error"));
      return;
    }
    setReviewingId(null);
    loadData();
  };

  const submitApproval = async (id: string) => {
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/capital-access", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        status: "APPROVED",
        escrow: escrowForm,
      }),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(json.error || t("admin.capitalAccess.error"));
      return;
    }
    setReviewingId(null);
    loadData();
  };

  const saveEscrowOnly = async (id: string) => {
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/capital-access", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        action: "update_escrow",
        escrow: escrowForm,
      }),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(json.error || t("admin.capitalAccess.error"));
      return;
    }
    setReviewingId(null);
    loadData();
  };

  const advanceOnboarding = async (id: string, confirmDeposit = false) => {
    setSaving(true);
    setError("");
    const res = await fetch(`/api/admin/capital-access/${id}/onboarding`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: confirmDeposit ? "confirm_deposit" : "advance" }),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(json.error || t("admin.capitalAccess.error"));
      return;
    }
    loadData();
  };

  const formatUsd = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  if (loading) return <p className="font-body text-charcoal/60">{t("common.loading")}</p>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-semibold text-charcoal mb-2">
          {t("admin.capitalAccess.title")}
        </h1>
        <p className="font-body text-charcoal/60">{t("admin.capitalAccess.subtitle")}</p>
      </div>

      {error && (
        <p className="mb-4 font-body text-sm text-red-700 bg-red-50 border border-red-100 p-3 rounded-sm">
          {error}
        </p>
      )}

      {applications.length === 0 ? (
        <div className="p-12 bg-white border border-charcoal/10 rounded-lg text-center">
          <p className="font-body text-charcoal/60">{t("admin.capitalAccess.empty")}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map((app) => {
            const isReviewing = reviewingId === app.id;
            const canApprove = app.status === "PENDING" || app.status === "UNDER_REVIEW";
            const needsEscrow = app.status === "APPROVED" && !app.escrow.configured;
            const nextPhase = app.onboardingPhase ? getNextAdminAction(app.onboardingPhase) : null;
            const docsComplete = hasRequiredDocuments(app.documents.map((d) => d.type));
            const paymentSlip = app.documents.find((d) => d.type === PAYMENT_SLIP_TYPE);
            const slipReady = hasPaymentSlip(app.documents.map((d) => d.type));
            const phaseIndex = app.onboardingPhase
              ? ONBOARDING_PHASES.indexOf(app.onboardingPhase as (typeof ONBOARDING_PHASES)[number])
              : -1;
            const awaitingDeposit = app.onboardingPhase === "AWAITING_DEPOSIT";
            const inDocReview =
              canApprove &&
              (app.onboardingPhase === "AWAITING_DOCUMENTS" ||
                app.onboardingPhase === "DOCUMENTS_REVISION" ||
                app.onboardingPhase === "DOCUMENTS_SUBMITTED" ||
                !app.onboardingPhase);
            const docsSubmitted = app.onboardingPhase === "DOCUMENTS_SUBMITTED";

            return (
              <div
                key={app.id}
                className={`p-6 bg-white border rounded-lg transition-colors ${
                  isReviewing ? "border-gold shadow-sm" : "border-charcoal/10"
                }`}
              >
                <div className="flex flex-wrap justify-between gap-4 mb-4">
                  <div>
                    <p className="font-heading font-semibold text-charcoal text-lg">{app.companyName}</p>
                    <p className="font-body text-sm text-charcoal/60">
                      {app.user.name || app.user.email} · {app.country} · {app.industry}
                    </p>
                    <p className="font-body text-xs text-gold mt-1">{app.poolLabel}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`text-xs px-3 py-1 rounded-full ${
                        app.status === "APPROVED"
                          ? "bg-green-100 text-green-800"
                          : app.status === "REJECTED"
                            ? "bg-red-100 text-red-800"
                            : app.status === "UNDER_REVIEW"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {t(`capitalAccess.status.${app.status.toLowerCase()}`)}
                    </span>
                    {app.onboardingPhase && (
                      <span className="text-xs font-body text-charcoal/50">
                        {t(`capitalAccess.onboarding.phases.${app.onboardingPhase.toLowerCase()}`)}
                      </span>
                    )}
                    <span
                      className={`text-xs font-body ${
                        docsSubmitted
                          ? "text-green-700"
                          : docsComplete
                            ? "text-amber-700"
                            : "text-amber-700"
                      }`}
                    >
                      {docsSubmitted
                        ? t("admin.capitalAccess.docsSubmitted")
                        : docsComplete
                          ? t("admin.capitalAccess.docsUploadedNotSubmitted")
                          : t("admin.capitalAccess.docsIncomplete")}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-charcoal/40">{t("capitalAccess.request.amount")}</p>
                    <p className="font-medium">{formatUsd(app.requestedAmountUsd)}</p>
                  </div>
                  <div>
                    <p className="text-charcoal/40">{t("capitalAccess.request.apr")}</p>
                    <p className="font-medium">{app.interestRatePct}%</p>
                  </div>
                  <div>
                    <p className="text-charcoal/40">{t("capitalAccess.securityDeposit")}</p>
                    <p className="font-medium">{formatUsd(app.securityDepositUsd)}</p>
                  </div>
                  <div>
                    <p className="text-charcoal/40">{t("capitalAccess.request.repayment")}</p>
                    <p className="font-medium capitalize">{app.repaymentFrequency.toLowerCase()}</p>
                  </div>
                </div>

                {/* Document package */}
                <div className="mb-4 p-4 bg-off-white border border-charcoal/5 rounded-lg">
                  <p className="font-body text-xs uppercase tracking-wide text-charcoal/40 mb-3 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" />
                    {t("admin.capitalAccess.documentPackage")}
                  </p>
                  <ul className="space-y-2">
                    {REQUIRED_DOCUMENT_TYPES.map((docType) => {
                      const doc = app.documents.find((d) => d.type === docType);
                      return (
                        <li key={docType} className="flex justify-between gap-3 text-sm font-body">
                          <span className="text-charcoal/70">
                            {t(`capitalAccess.onboarding.docTypes.${docType.toLowerCase()}`)}
                          </span>
                          {doc ? (
                            <a
                              href={`/api/admin/capital-access/${app.id}/documents/${doc.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-gold hover:underline truncate max-w-[50%]"
                            >
                              {doc.name}
                            </a>
                          ) : (
                            <span className="text-amber-700 text-xs">{t("admin.capitalAccess.missingDoc")}</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                  {docsSubmitted && (
                    <p className="mt-3 font-body text-xs text-green-800 bg-green-50 p-2 rounded-sm">
                      {t("admin.capitalAccess.packageReceived")}
                    </p>
                  )}
                </div>

                {(canApprove || needsEscrow) && (
                  <div className="mb-4">
                    <button
                      onClick={() => openReview(app)}
                      className="inline-flex items-center gap-2 px-4 py-2 border border-gold/50 text-charcoal font-body text-sm rounded-sm hover:bg-gold/5"
                    >
                      <Building2 className="w-4 h-4 text-gold" />
                      {needsEscrow
                        ? t("admin.capitalAccess.assignEscrow")
                        : t("admin.capitalAccess.reviewApplication")}
                      {isReviewing ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                )}

                {isReviewing && inDocReview && (
                  <div className="mb-4 p-5 bg-off-white border border-gold/20 rounded-lg space-y-5">
                    <div>
                      <h3 className="font-heading font-semibold text-charcoal mb-1">
                        {t("admin.capitalAccess.requestExtraTitle")}
                      </h3>
                      <p className="font-body text-sm text-charcoal/60 mb-3">
                        {t("admin.capitalAccess.requestExtraDesc")}
                      </p>
                      <textarea
                        value={extraNotes}
                        onChange={(e) => setExtraNotes(e.target.value)}
                        rows={3}
                        placeholder={t("admin.capitalAccess.extraNotesPlaceholder")}
                        className="w-full px-3 py-2.5 border border-charcoal/20 rounded-sm font-body text-sm focus:outline-none focus:border-gold resize-y"
                      />
                      <button
                        onClick={() => requestExtraDocuments(app.id)}
                        disabled={saving || !extraNotes.trim()}
                        className="mt-3 px-4 py-2 border border-amber-400 text-amber-900 font-body text-sm rounded-sm disabled:opacity-50"
                      >
                        {saving ? t("common.loading") : t("admin.capitalAccess.requestExtra")}
                      </button>
                    </div>

                    <div className="border-t border-charcoal/10 pt-5">
                      <h3 className="font-heading font-semibold text-charcoal mb-1">
                        {t("admin.capitalAccess.approveWithEscrowTitle")}
                      </h3>
                      <p className="font-body text-sm text-charcoal/60 mb-4">
                        {t("admin.capitalAccess.approveModalDesc")}{" "}
                        <strong>{formatUsd(app.securityDepositUsd)}</strong>
                      </p>
                      {!docsComplete && (
                        <p className="mb-3 font-body text-sm text-amber-800 bg-amber-50 p-3 rounded-sm">
                          {t("admin.capitalAccess.approveRequiresDocs")}
                        </p>
                      )}
                      {docsComplete && !docsSubmitted && (
                        <p className="mb-3 font-body text-sm text-amber-800 bg-amber-50 p-3 rounded-sm">
                          {t("admin.capitalAccess.approveRequiresSubmit")}
                        </p>
                      )}
                      <EscrowFieldsForm form={escrowForm} onChange={setEscrowForm} t={t} />
                      <div className="flex flex-wrap gap-3 mt-5">
                        <button
                          onClick={() => submitApproval(app.id)}
                          disabled={saving || !docsComplete || !docsSubmitted}
                          className="px-5 py-2.5 bg-gold text-charcoal font-body text-sm rounded-sm disabled:opacity-50"
                        >
                          {saving ? t("common.loading") : t("admin.approve")}
                        </button>
                        <button
                          onClick={() => updateStatus(app.id, "UNDER_REVIEW")}
                          disabled={saving}
                          className="px-4 py-2.5 border border-charcoal/20 font-body text-sm rounded-sm"
                        >
                          {t("admin.capitalAccess.review")}
                        </button>
                        <button
                          onClick={() => updateStatus(app.id, "REJECTED")}
                          disabled={saving}
                          className="px-4 py-2.5 border border-red-300 text-red-700 font-body text-sm rounded-sm"
                        >
                          {t("admin.reject")}
                        </button>
                        <button
                          onClick={() => setReviewingId(null)}
                          className="px-4 py-2.5 border border-charcoal/20 font-body text-sm rounded-sm"
                        >
                          {t("common.cancel")}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {isReviewing && needsEscrow && (
                  <div className="mb-4 p-5 bg-off-white border border-gold/20 rounded-lg">
                    <h3 className="font-heading font-semibold text-charcoal mb-1">
                      {t("admin.capitalAccess.escrowFormTitle")}
                    </h3>
                    <EscrowFieldsForm form={escrowForm} onChange={setEscrowForm} t={t} />
                    <div className="flex flex-wrap gap-3 mt-5">
                      <button
                        onClick={() => saveEscrowOnly(app.id)}
                        disabled={saving}
                        className="px-5 py-2.5 bg-gold text-charcoal font-body text-sm rounded-sm disabled:opacity-50"
                      >
                        {saving ? t("common.loading") : t("admin.capitalAccess.saveEscrow")}
                      </button>
                      <button
                        onClick={() => setReviewingId(null)}
                        className="px-4 py-2.5 border border-charcoal/20 font-body text-sm rounded-sm"
                      >
                        {t("common.cancel")}
                      </button>
                    </div>
                  </div>
                )}

                {app.status === "APPROVED" && app.onboardingPhase && (
                  <div className="mb-4 p-4 bg-off-white rounded-lg border border-charcoal/5">
                    <p className="font-body text-xs uppercase tracking-wide text-charcoal/40 mb-3">
                      {t("admin.capitalAccess.onboarding")}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {ONBOARDING_PHASES.map((phase, i) => (
                        <span
                          key={phase}
                          className={`text-xs px-2 py-1 rounded ${
                            i < phaseIndex
                              ? "bg-green-100 text-green-800"
                              : i === phaseIndex
                                ? "bg-gold/20 text-charcoal font-medium"
                                : "bg-charcoal/5 text-charcoal/40"
                          }`}
                        >
                          {t(`capitalAccess.onboarding.phases.${phase.toLowerCase()}`)}
                        </span>
                      ))}
                    </div>

                    {app.escrow.configured && (
                      <div className="mb-3 p-3 bg-white border border-charcoal/10 rounded-sm text-sm font-body">
                        <p className="text-xs uppercase tracking-wide text-charcoal/40 mb-2">
                          {t("admin.capitalAccess.assignedEscrow")}
                        </p>
                        <p>
                          {app.escrow.bankName} · {app.escrow.accountName}
                        </p>
                        {app.escrow.bankAddress && (
                          <p className="text-charcoal/60 text-xs mt-1 whitespace-pre-line">
                            {app.escrow.bankAddress}
                          </p>
                        )}
                        <p className="font-mono text-xs mt-1">
                          {app.escrow.accountNumber ? `${app.escrow.accountNumber} · ` : ""}
                          {app.escrow.iban} · {app.escrow.swift}
                        </p>
                        <p className="mt-2">
                          {t("admin.capitalAccess.beneficiary")}: {app.escrow.beneficiary}
                        </p>
                        {app.escrow.beneficiaryAddress && (
                          <p className="text-charcoal/60 text-xs mt-1 whitespace-pre-line">
                            {app.escrow.beneficiaryAddress}
                          </p>
                        )}
                        <p className="text-gold font-mono text-xs mt-1">{app.escrow.reference}</p>
                      </div>
                    )}

                    {awaitingDeposit && (
                      <div className="mb-3 space-y-2">
                        {app.depositReference ? (
                          <p className="font-body text-sm text-charcoal/70">
                            {t("capitalAccess.onboarding.wireReference")}:{" "}
                            <code className="text-charcoal">{app.depositReference}</code>
                            {app.depositConfirmedAt
                              ? " ✓"
                              : ` (${t("admin.capitalAccess.pendingVerification")})`}
                          </p>
                        ) : (
                          <p className="font-body text-sm text-charcoal/50">
                            {t("admin.capitalAccess.awaitingBorrowerDeposit")}
                          </p>
                        )}
                        {paymentSlip ? (
                          <p className="font-body text-sm text-charcoal/70">
                            {t("admin.capitalAccess.paymentSlip")}:{" "}
                            <a
                              href={`/api/admin/capital-access/${app.id}/documents/${paymentSlip.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-gold hover:underline"
                            >
                              {paymentSlip.name}
                            </a>
                          </p>
                        ) : (
                          <p className="font-body text-sm text-amber-700">
                            {t("admin.capitalAccess.noPaymentSlip")}
                          </p>
                        )}
                      </div>
                    )}

                    {awaitingDeposit && app.depositSubmittedAt && slipReady && (
                      <button
                        onClick={() => advanceOnboarding(app.id, true)}
                        disabled={saving}
                        className="mt-2 px-4 py-2 bg-gold text-charcoal font-body text-sm rounded-sm disabled:opacity-50"
                      >
                        {t("admin.capitalAccess.confirmPayment")}
                      </button>
                    )}

                    {!awaitingDeposit &&
                      nextPhase &&
                      app.onboardingPhase !== "AWAITING_DOCUMENTS" &&
                      app.onboardingPhase !== "DOCUMENTS_REVISION" && (
                        <button
                          onClick={() => advanceOnboarding(app.id)}
                          disabled={saving}
                          className="mt-2 px-4 py-2 bg-gold text-charcoal font-body text-sm rounded-sm disabled:opacity-50"
                        >
                          {t("admin.capitalAccess.advanceTo")}{" "}
                          {t(`capitalAccess.onboarding.phases.${nextPhase.toLowerCase()}`)}
                        </button>
                      )}

                    {/* Legacy approved apps still collecting docs after deposit */}
                    {app.onboardingPhase === "AWAITING_DOCUMENTS" && (
                      <button
                        onClick={() => advanceOnboarding(app.id)}
                        disabled={saving || !docsComplete}
                        className="mt-2 px-4 py-2 bg-gold text-charcoal font-body text-sm rounded-sm disabled:opacity-50"
                      >
                        {t("admin.capitalAccess.advanceTo")}{" "}
                        {t("capitalAccess.onboarding.phases.kyc_review")}
                      </button>
                    )}
                  </div>
                )}

                {canApprove && !isReviewing && (
                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() => openReview(app)}
                      className="px-4 py-2 bg-gold text-charcoal font-body text-sm rounded-sm"
                    >
                      {t("admin.capitalAccess.reviewApplication")}
                    </button>
                    <button
                      onClick={() => updateStatus(app.id, "REJECTED")}
                      className="px-4 py-2 border border-red-300 text-red-700 font-body text-sm rounded-sm"
                    >
                      {t("admin.reject")}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
