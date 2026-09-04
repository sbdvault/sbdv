"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "@/hooks/useTranslations";
import {
  CheckCircle2,
  Circle,
  Upload,
  Building2,
  FileText,
  Shield,
  Banknote,
  ArrowRightLeft,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { REQUIRED_DOCUMENT_TYPES } from "@/lib/capital-access-onboarding";
import { ALLOWED_UPLOAD_ACCEPT, validateUploadFile } from "@/lib/upload-validation";

interface Facility {
  id: string;
  status: string;
  companyName: string;
  requestedAmountUsd: number;
  securityDepositUsd: number;
  interestRatePct: number;
  termYears: number;
  repaymentFrequency: string;
  installmentUsd: number;
  onboardingPhase: string;
  adminNotes: string | null;
  depositReference: string | null;
  depositSubmittedAt: string | null;
  depositConfirmedAt: string | null;
  kycCompletedAt: string | null;
  disbursedAt: string | null;
  relationshipManager: string | null;
  poolLabel: string;
  docsComplete: boolean;
  canUploadDocuments: boolean;
  bankDetailsComplete?: boolean;
  bankDetailsSubmittedAt?: string | null;
  disburseBankName?: string | null;
  disburseBankAddress?: string | null;
  disburseAccountName?: string | null;
  disburseAccountNumber?: string | null;
  disburseIban?: string | null;
  disburseSwift?: string | null;
  disburseBeneficiary?: string | null;
  disburseBeneficiaryAddress?: string | null;
  phases: string[];
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
  paymentSlip: { id: string; name: string; type: string; uploadedAt: string } | null;
  documents: { id: string; name: string; type: string; uploadedAt: string }[];
}

const phaseIcons: Record<string, typeof Circle> = {
  AWAITING_DOCUMENTS: FileText,
  DOCUMENTS_REVISION: FileText,
  DOCUMENTS_SUBMITTED: FileText,
  AWAITING_DEPOSIT: Banknote,
  KYC_REVIEW: Shield,
  AWAITING_BANK_DETAILS: Building2,
  READY_FOR_DISBURSEMENT: ArrowRightLeft,
  DISBURSED: CheckCircle2,
  ACTIVE: CheckCircle2,
};

export default function CapitalAccessFacilityPage() {
  const { t, locale } = useTranslations();
  const params = useParams();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [wireRef, setWireRef] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [bankForm, setBankForm] = useState({
    bankName: "",
    bankAddress: "",
    accountName: "",
    accountNumber: "",
    iban: "",
    swift: "",
    beneficiary: "",
    beneficiaryAddress: "",
  });

  const getLocalizedHref = (href: string) =>
    `/${(params?.locale as string) || locale || "en"}${href}`;

  const loadData = () => {
    const idFromQuery =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("id")
        : null;
    fetch("/api/capital-access/facility")
      .then((res) => res.json())
      .then((json) => {
        const list = json.facilities || [];
        setFacilities(list);
        if (list.length > 0) {
          setSelectedId((prev) => {
            if (idFromQuery && list.some((f: Facility) => f.id === idFromQuery)) {
              return idFromQuery;
            }
            if (prev && list.some((f: Facility) => f.id === prev)) return prev;
            // Prefer apps that still need document action
            const needsDocs = list.find(
              (f: Facility) =>
                f.onboardingPhase === "AWAITING_DOCUMENTS" ||
                f.onboardingPhase === "DOCUMENTS_REVISION"
            );
            return needsDocs?.id || list[0].id;
          });
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const facility = facilities.find((f) => f.id === selectedId);
  const formatUsd = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  const currentPhaseIndex = facility
    ? facility.phases.indexOf(facility.onboardingPhase)
    : -1;

  const submitDepositRef = async () => {
    if (!facility) return;
    setSubmitting(true);
    setMessage("");
    setError("");
    const res = await fetch(`/api/capital-access/facility/${facility.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ depositReference: wireRef }),
    });
    const json = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(json.error || t("capitalAccess.onboarding.error"));
      return;
    }
    setMessage(t("capitalAccess.onboarding.depositSubmitted"));
    setWireRef("");
    loadData();
  };

  const uploadDoc = async (type: string, file: File) => {
    if (!facility) return;
    setError("");
    setMessage("");
    const check = validateUploadFile({ name: file.name, type: file.type });
    if (!check.ok) {
      setError(check.error);
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    formData.append("name", file.name);
    const res = await fetch(`/api/capital-access/facility/${facility.id}/documents`, {
      method: "POST",
      body: formData,
    });
    const json = await res.json().catch(() => ({}));
    setUploading(false);
    if (!res.ok) {
      setError(json.error || t("capitalAccess.onboarding.uploadFailed"));
      return;
    }
    setMessage(t("capitalAccess.onboarding.uploadSuccess"));
    loadData();
  };

  const deleteDoc = async (docId: string) => {
    if (!facility) return;
    setError("");
    setMessage("");
    const res = await fetch(`/api/capital-access/facility/${facility.id}/documents/${docId}`, {
      method: "DELETE",
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(json.error || t("capitalAccess.onboarding.deleteFailed"));
      return;
    }
    setMessage(t("capitalAccess.onboarding.deleteSuccess"));
    loadData();
  };

  const submitDocuments = async () => {
    if (!facility) return;
    setSubmitting(true);
    setError("");
    setMessage("");
    const res = await fetch(`/api/capital-access/facility/${facility.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "submit_documents" }),
    });
    const json = await res.json().catch(() => ({}));
    setSubmitting(false);
    if (!res.ok) {
      setError(json.error || t("capitalAccess.onboarding.submitDocsFailed"));
      return;
    }
    setMessage(t("capitalAccess.onboarding.submitDocsSuccess"));
    loadData();
  };

  const submitBankDetails = async () => {
    if (!facility) return;
    setSubmitting(true);
    setError("");
    setMessage("");
    const res = await fetch(`/api/capital-access/facility/${facility.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "submit_bank_details", bank: bankForm }),
    });
    const json = await res.json().catch(() => ({}));
    setSubmitting(false);
    if (!res.ok) {
      setError(json.error || t("capitalAccess.onboarding.bankSubmitFailed"));
      return;
    }
    setMessage(t("capitalAccess.onboarding.bankSubmitSuccess"));
    loadData();
  };

  if (loading) {
    return <p className="font-body text-charcoal/60">{t("common.loading")}</p>;
  }

  if (facilities.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <Building2 className="w-12 h-12 text-charcoal/30 mx-auto mb-4" />
        <h1 className="text-2xl font-heading font-semibold text-charcoal mb-3">
          {t("capitalAccess.onboarding.noFacility")}
        </h1>
        <p className="font-body text-charcoal/60 mb-6">{t("capitalAccess.onboarding.noFacilityDesc")}</p>
        <Link href={getLocalizedHref("/capital-access/portal/applications")} className="text-gold hover:underline font-body">
          {t("capitalAccess.request.viewApplications")}
        </Link>
      </div>
    );
  }

  const showDocs =
    facility &&
    (facility.onboardingPhase === "AWAITING_DOCUMENTS" ||
      facility.onboardingPhase === "DOCUMENTS_REVISION" ||
      facility.onboardingPhase === "DOCUMENTS_SUBMITTED" ||
      (facility.onboardingPhase === "KYC_REVIEW" && facility.docsComplete));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-semibold text-charcoal mb-2">
          {t("capitalAccess.onboarding.title")}
        </h1>
        <p className="font-body text-charcoal/60">{t("capitalAccess.onboarding.subtitle")}</p>
      </div>

      {facilities.length > 1 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {facilities.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedId(f.id)}
              className={`px-4 py-2 font-body text-sm rounded-sm border ${
                selectedId === f.id ? "bg-gold text-charcoal border-gold" : "border-charcoal/20 text-charcoal/70"
              }`}
            >
              {f.companyName}
            </button>
          ))}
        </div>
      )}

      {facility && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: t("capitalAccess.request.amount"), value: formatUsd(facility.requestedAmountUsd) },
              { label: t("capitalAccess.request.apr"), value: `${facility.interestRatePct}%` },
              { label: t("capitalAccess.securityDeposit"), value: formatUsd(facility.securityDepositUsd) },
              { label: t("capitalAccess.onboarding.rm"), value: facility.relationshipManager || "—" },
            ].map((stat) => (
              <div key={stat.label} className="p-4 bg-white border border-charcoal/10 rounded-lg">
                <p className="font-body text-xs text-charcoal/50">{stat.label}</p>
                <p className="font-heading font-semibold text-charcoal">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="mb-10 p-6 bg-white border border-charcoal/10 rounded-lg">
            <h2 className="font-heading font-semibold text-charcoal mb-6">{t("capitalAccess.onboarding.progress")}</h2>
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-0">
              {facility.phases.map((phase, i) => {
                const Icon = phaseIcons[phase] || Circle;
                const done = i < currentPhaseIndex;
                const current = i === currentPhaseIndex;
                return (
                  <div key={phase} className="flex items-center flex-1 min-w-0">
                    <div className="flex items-center gap-2 shrink-0">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          done ? "bg-green-100 text-green-700" : current ? "bg-gold text-charcoal" : "bg-charcoal/10 text-charcoal/40"
                        }`}
                      >
                        {done ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                      </div>
                      <span className={`font-body text-xs hidden lg:block ${current ? "text-charcoal font-medium" : "text-charcoal/50"}`}>
                        {t(`capitalAccess.onboarding.phases.${phase.toLowerCase()}`)}
                      </span>
                    </div>
                    {i < facility.phases.length - 1 && (
                      <div className={`hidden md:block flex-1 h-0.5 mx-2 ${done ? "bg-gold" : "bg-charcoal/10"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-800 font-body text-sm">{error}</p>
            </div>
          )}

          {facility.onboardingPhase === "DOCUMENTS_REVISION" && facility.adminNotes && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="font-body font-medium text-amber-900 mb-1">
                {t("capitalAccess.onboarding.revisionRequested")}
              </p>
              <p className="font-body text-sm text-amber-900/80 whitespace-pre-line">{facility.adminNotes}</p>
            </div>
          )}

          {showDocs && (
            <div className="mb-8 p-6 bg-white border border-charcoal/10 rounded-lg">
              <h2 className="font-heading font-semibold text-charcoal mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-gold" />
                {t("capitalAccess.onboarding.documentsTitle")}
              </h2>
              <p className="font-body text-sm text-charcoal/70 mb-2">{t("capitalAccess.onboarding.documentsDesc")}</p>
              <p className="font-body text-xs text-charcoal/50 mb-6">{t("capitalAccess.onboarding.fileTypesHint")}</p>
              <div className="space-y-4">
                {REQUIRED_DOCUMENT_TYPES.map((docType) => {
                  const uploaded = facility.documents.find((d) => d.type === docType);
                  return (
                    <div key={docType} className="flex items-center justify-between gap-4 p-4 border border-charcoal/10 rounded-sm">
                      <div className="min-w-0">
                        <p className="font-body font-medium text-charcoal">
                          {t(`capitalAccess.onboarding.docTypes.${docType.toLowerCase()}`)}
                        </p>
                        {uploaded && (
                          <p className="font-body text-xs text-green-700 mt-1 truncate">
                            ✓ {uploaded.name} — {new Date(uploaded.uploadedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {facility.canUploadDocuments && uploaded && (
                          <button
                            type="button"
                            onClick={() => deleteDoc(uploaded.id)}
                            className="p-2 text-red-700 hover:bg-red-50 rounded-sm"
                            title={t("capitalAccess.onboarding.deleteFile")}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        {facility.canUploadDocuments && (
                          <label className="px-4 py-2 bg-gold text-charcoal font-body text-sm rounded-sm cursor-pointer">
                            {uploading
                              ? "…"
                              : uploaded
                                ? t("capitalAccess.onboarding.replace")
                                : t("capitalAccess.onboarding.upload")}
                            <input
                              type="file"
                              className="hidden"
                              accept={ALLOWED_UPLOAD_ACCEPT}
                              disabled={uploading}
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                e.target.value = "";
                                if (f) uploadDoc(docType, f);
                              }}
                            />
                          </label>
                        )}
                        {uploaded && !facility.canUploadDocuments && (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {facility.docsComplete && facility.canUploadDocuments && (
                <div className="mt-6 p-4 bg-off-white border border-gold/30 rounded-sm">
                  <p className="font-body text-sm text-charcoal/70 mb-3">
                    {t("capitalAccess.onboarding.docsReadyToSubmit")}
                  </p>
                  <button
                    type="button"
                    onClick={submitDocuments}
                    disabled={submitting}
                    className="px-6 py-3 bg-gold text-charcoal font-body rounded-sm disabled:opacity-50"
                  >
                    {submitting ? t("common.loading") : t("capitalAccess.onboarding.submitDocuments")}
                  </button>
                </div>
              )}
              {facility.onboardingPhase === "DOCUMENTS_SUBMITTED" && (
                <p className="mt-4 font-body text-sm text-green-800 bg-green-50 p-3 rounded-sm">
                  {t("capitalAccess.onboarding.docsSubmittedNote")}
                </p>
              )}
              {facility.docsComplete &&
                facility.canUploadDocuments === false &&
                facility.onboardingPhase !== "DOCUMENTS_SUBMITTED" && (
                  <p className="mt-4 font-body text-sm text-charcoal/60">
                    {t("capitalAccess.onboarding.docsCompleteNote")}
                  </p>
                )}
            </div>
          )}

          {facility.onboardingPhase === "AWAITING_DEPOSIT" && (
            <div className="mb-8 p-6 bg-white border border-gold/30 rounded-lg">
              <h2 className="font-heading font-semibold text-charcoal mb-4 flex items-center gap-2">
                <Banknote className="w-5 h-5 text-gold" />
                {t("capitalAccess.onboarding.escrowTitle")}
              </h2>
              <p className="font-body text-sm text-charcoal/70 mb-4">{t("capitalAccess.onboarding.escrowDesc")}</p>
              {!facility.escrow.configured ? (
                <p className="font-body text-sm text-amber-800 bg-amber-50 p-3 rounded-sm">
                  {t("capitalAccess.onboarding.escrowPending")}
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-off-white rounded-sm font-body text-sm">
                    <div>
                      <span className="text-charcoal/50">{t("capitalAccess.onboarding.bank")}</span>
                      <p className="font-medium">{facility.escrow.bankName}</p>
                      {facility.escrow.bankAddress && (
                        <p className="text-charcoal/60 text-xs mt-1 whitespace-pre-line">
                          {facility.escrow.bankAddress}
                        </p>
                      )}
                    </div>
                    <div>
                      <span className="text-charcoal/50">{t("capitalAccess.onboarding.account")}</span>
                      <p className="font-medium">{facility.escrow.accountName}</p>
                    </div>
                    {facility.escrow.accountNumber && (
                      <div>
                        <span className="text-charcoal/50">{t("capitalAccess.onboarding.accountNumber")}</span>
                        <p className="font-medium font-mono">{facility.escrow.accountNumber}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-charcoal/50">IBAN</span>
                      <p className="font-medium font-mono">{facility.escrow.iban}</p>
                    </div>
                    <div>
                      <span className="text-charcoal/50">SWIFT</span>
                      <p className="font-medium font-mono">{facility.escrow.swift}</p>
                    </div>
                    <div>
                      <span className="text-charcoal/50">{t("admin.capitalAccess.beneficiary")}</span>
                      <p className="font-medium">{facility.escrow.beneficiary}</p>
                      {facility.escrow.beneficiaryAddress && (
                        <p className="text-charcoal/60 text-xs mt-1 whitespace-pre-line">
                          {facility.escrow.beneficiaryAddress}
                        </p>
                      )}
                    </div>
                    <div>
                      <span className="text-charcoal/50">{t("capitalAccess.onboarding.wireReference")}</span>
                      <p className="font-medium font-mono text-gold">{facility.escrow.reference}</p>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-charcoal/50">{t("capitalAccess.onboarding.amountDue")}</span>
                      <p className="font-heading font-semibold">{formatUsd(facility.securityDepositUsd)}</p>
                    </div>
                  </div>

                  {facility.depositSubmittedAt ? (
                    <div className="space-y-2">
                      <p className="font-body text-sm text-green-700 bg-green-50 p-3 rounded-sm">
                        {t("capitalAccess.onboarding.depositPending")}:{" "}
                        <strong>{facility.depositReference}</strong>
                      </p>
                      {facility.paymentSlip && (
                        <p className="font-body text-sm text-charcoal/60">
                          {t("capitalAccess.onboarding.paymentSlipUploaded")}: {facility.paymentSlip.name}
                        </p>
                      )}
                      <p className="font-body text-xs text-charcoal/50">
                        {t("capitalAccess.onboarding.awaitingAdminConfirm")}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 border border-charcoal/10 rounded-sm">
                        <p className="font-body font-medium text-charcoal mb-1">
                          {t("capitalAccess.onboarding.paymentSlipTitle")}
                        </p>
                        <p className="font-body text-xs text-charcoal/50 mb-3">
                          {t("capitalAccess.onboarding.fileTypesHint")}
                        </p>
                        {facility.paymentSlip ? (
                          <div className="flex items-center gap-3">
                            <p className="font-body text-sm text-green-700 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4" />
                              {facility.paymentSlip.name}
                            </p>
                            <button
                              type="button"
                              onClick={() => deleteDoc(facility.paymentSlip!.id)}
                              className="p-2 text-red-700 hover:bg-red-50 rounded-sm"
                              title={t("capitalAccess.onboarding.deleteFile")}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <label className="px-3 py-1.5 border border-charcoal/20 font-body text-sm rounded-sm cursor-pointer">
                              {t("capitalAccess.onboarding.replace")}
                              <input
                                type="file"
                                className="hidden"
                                accept={ALLOWED_UPLOAD_ACCEPT}
                                disabled={uploading}
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  e.target.value = "";
                                  if (f) uploadDoc("PAYMENT_SLIP", f);
                                }}
                              />
                            </label>
                          </div>
                        ) : (
                          <label className="inline-flex px-4 py-2 bg-gold text-charcoal font-body text-sm rounded-sm cursor-pointer">
                            {uploading ? "…" : t("capitalAccess.onboarding.uploadSlip")}
                            <input
                              type="file"
                              className="hidden"
                              accept={ALLOWED_UPLOAD_ACCEPT}
                              disabled={uploading}
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                e.target.value = "";
                                if (f) uploadDoc("PAYMENT_SLIP", f);
                              }}
                            />
                          </label>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          value={wireRef}
                          onChange={(e) => setWireRef(e.target.value)}
                          placeholder={t("capitalAccess.onboarding.wireRefPlaceholder")}
                          className="flex-1 px-4 py-3 border border-charcoal/20 rounded-sm font-body"
                        />
                        <button
                          onClick={submitDepositRef}
                          disabled={submitting || !wireRef.trim() || !facility.paymentSlip}
                          className="px-6 py-3 bg-gold text-charcoal font-body rounded-sm disabled:opacity-40"
                        >
                          {submitting ? t("common.loading") : t("capitalAccess.onboarding.confirmDeposit")}
                        </button>
                      </div>
                      {!facility.paymentSlip && (
                        <p className="font-body text-xs text-charcoal/50">
                          {t("capitalAccess.onboarding.slipRequiredFirst")}
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {facility.onboardingPhase === "AWAITING_BANK_DETAILS" && (
            <div className="mb-8 p-6 bg-white border border-gold/30 rounded-lg">
              <h2 className="font-heading font-semibold text-charcoal mb-2 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-gold" />
                {t("capitalAccess.onboarding.bankDetailsTitle")}
              </h2>
              <p className="font-body text-sm text-charcoal/70 mb-6">
                {t("capitalAccess.onboarding.bankDetailsDesc")}
              </p>

              {facility.bankDetailsComplete ? (
                <div className="space-y-3">
                  <p className="font-body text-sm text-green-800 bg-green-50 p-3 rounded-sm">
                    {t("capitalAccess.onboarding.bankSubmittedNote")}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-off-white rounded-sm font-body text-sm">
                    <div>
                      <span className="text-charcoal/50">{t("capitalAccess.onboarding.bank")}</span>
                      <p className="font-medium">{facility.disburseBankName}</p>
                      {facility.disburseBankAddress && (
                        <p className="text-charcoal/60 text-xs mt-1 whitespace-pre-line">
                          {facility.disburseBankAddress}
                        </p>
                      )}
                    </div>
                    <div>
                      <span className="text-charcoal/50">{t("capitalAccess.onboarding.account")}</span>
                      <p className="font-medium">{facility.disburseAccountName}</p>
                    </div>
                    {facility.disburseAccountNumber && (
                      <div>
                        <span className="text-charcoal/50">
                          {t("capitalAccess.onboarding.accountNumber")}
                        </span>
                        <p className="font-medium font-mono">{facility.disburseAccountNumber}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-charcoal/50">IBAN</span>
                      <p className="font-medium font-mono">{facility.disburseIban}</p>
                    </div>
                    <div>
                      <span className="text-charcoal/50">SWIFT</span>
                      <p className="font-medium font-mono">{facility.disburseSwift}</p>
                    </div>
                    <div>
                      <span className="text-charcoal/50">{t("admin.capitalAccess.beneficiary")}</span>
                      <p className="font-medium">{facility.disburseBeneficiary || facility.companyName}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(
                      [
                        ["bankName", t("capitalAccess.onboarding.bank"), false],
                        ["accountName", t("capitalAccess.onboarding.account"), false],
                        ["accountNumber", t("capitalAccess.onboarding.accountNumber"), false],
                        ["iban", "IBAN", false],
                        ["swift", "SWIFT", false],
                        ["beneficiary", t("admin.capitalAccess.beneficiary"), false],
                        ["bankAddress", t("capitalAccess.onboarding.bankAddress"), true],
                        [
                          "beneficiaryAddress",
                          t("capitalAccess.onboarding.beneficiaryAddress"),
                          true,
                        ],
                      ] as const
                    ).map(([key, label, multiline]) => (
                      <label
                        key={key}
                        className={`block ${multiline ? "md:col-span-2" : ""}`}
                      >
                        <span className="font-body text-xs text-charcoal/50 uppercase tracking-wide">
                          {label}
                        </span>
                        {multiline ? (
                          <textarea
                            value={bankForm[key]}
                            onChange={(e) =>
                              setBankForm((prev) => ({ ...prev, [key]: e.target.value }))
                            }
                            rows={2}
                            className="mt-1 w-full px-3 py-2.5 border border-charcoal/20 rounded-sm font-body text-sm focus:outline-none focus:border-gold resize-y"
                          />
                        ) : (
                          <input
                            value={bankForm[key]}
                            onChange={(e) =>
                              setBankForm((prev) => ({ ...prev, [key]: e.target.value }))
                            }
                            className="mt-1 w-full px-3 py-2.5 border border-charcoal/20 rounded-sm font-body text-sm focus:outline-none focus:border-gold"
                          />
                        )}
                      </label>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={submitBankDetails}
                    disabled={
                      submitting ||
                      !bankForm.bankName.trim() ||
                      !bankForm.accountName.trim() ||
                      !bankForm.iban.trim() ||
                      !bankForm.swift.trim()
                    }
                    className="px-6 py-3 bg-gold text-charcoal font-body rounded-sm disabled:opacity-40"
                  >
                    {submitting
                      ? t("common.loading")
                      : t("capitalAccess.onboarding.submitBankDetails")}
                  </button>
                </div>
              )}
            </div>
          )}

          {["READY_FOR_DISBURSEMENT", "DISBURSED", "ACTIVE"].includes(facility.onboardingPhase) && (
            <div className="p-6 bg-charcoal text-off-white rounded-lg">
              <h2 className="font-heading font-semibold mb-2">
                {facility.onboardingPhase === "ACTIVE"
                  ? t("capitalAccess.onboarding.facilityActive")
                  : t("capitalAccess.onboarding.disbursementPending")}
              </h2>
              <p className="font-body text-sm text-off-white/70">
                {facility.onboardingPhase === "DISBURSED" || facility.onboardingPhase === "ACTIVE"
                  ? `${t("capitalAccess.onboarding.disbursedOn")} ${facility.disbursedAt ? new Date(facility.disbursedAt).toLocaleDateString() : "—"}`
                  : t("capitalAccess.onboarding.disbursementDesc")}
              </p>
              {facility.onboardingPhase === "ACTIVE" && (
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-off-white/50">{t("capitalAccess.request.repayment")}</p>
                    <p className="font-heading font-semibold capitalize">{facility.repaymentFrequency.toLowerCase()}</p>
                  </div>
                  <div>
                    <p className="text-off-white/50">{t("capitalAccess.onboarding.installment")}</p>
                    <p className="font-heading font-semibold text-gold">{formatUsd(facility.installmentUsd)}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {message && (
            <p className="mt-4 font-body text-sm text-charcoal/70 bg-off-white p-3 rounded-sm">{message}</p>
          )}
        </>
      )}
    </div>
  );
}
