"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "@/hooks/useTranslations";
import { getPoolTeaser } from "@/lib/capital-access";
import { FileText, AlertCircle } from "lucide-react";

interface Application {
  id: string;
  companyName: string;
  requestedAmountUsd: number;
  termYears: number;
  repaymentFrequency: string;
  interestRatePct: number;
  securityDepositUsd: number;
  status: string;
  onboardingPhase: string | null;
  adminNotes: string | null;
  docsComplete: boolean;
  needsDocuments: boolean;
  documentsAwaitingReview?: boolean;
  createdAt: string;
  pool: { country: string; category: string };
}

export default function CapitalAccessApplicationsPage() {
  const { t, locale } = useTranslations();
  const params = useParams();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const getLocalizedHref = (href: string) =>
    `/${(params?.locale as string) || locale || "en"}${href}`;

  useEffect(() => {
    fetch("/api/capital-access/applications")
      .then((res) => res.json())
      .then((json) => setApplications(json.applications || []))
      .finally(() => setLoading(false));
  }, []);

  const formatUsd = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  const statusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "UNDER_REVIEW":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const facilityHref = (appId: string) =>
    getLocalizedHref(`/capital-access/portal/facility?id=${appId}`);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-semibold text-charcoal mb-2">
          {t("capitalAccess.applications.title")}
        </h1>
        <p className="font-body text-charcoal/60">{t("capitalAccess.applications.subtitle")}</p>
      </div>

      {loading ? (
        <p className="font-body text-charcoal/60">{t("common.loading")}</p>
      ) : applications.length === 0 ? (
        <div className="p-12 bg-white border border-charcoal/10 rounded-lg text-center">
          <p className="font-body text-charcoal/60 mb-6">{t("capitalAccess.applications.empty")}</p>
          <Link
            href={getLocalizedHref("/capital-access/portal/request")}
            className="px-6 py-3 bg-gold text-charcoal font-body rounded-sm inline-block"
          >
            {t("capitalAccess.startRequest")}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const poolLabel = getPoolTeaser(app.pool.country, app.pool.category).label;
            const showDocsAction =
              app.needsDocuments ||
              app.onboardingPhase === "AWAITING_DOCUMENTS" ||
              app.onboardingPhase === "DOCUMENTS_REVISION";
            const showDepositAction = app.status === "APPROVED";

            return (
              <div key={app.id} className="p-6 bg-white border border-charcoal/10 rounded-lg">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                  <div>
                    <p className="font-heading font-semibold text-charcoal">{app.companyName}</p>
                    <p className="font-body text-sm text-charcoal/50">{poolLabel}</p>
                    <p className="font-body text-xs text-charcoal/40 mt-1">
                      {t("capitalAccess.applications.submitted")}{" "}
                      {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                    {app.onboardingPhase && (
                      <p className="font-body text-xs text-gold mt-1">
                        {t(`capitalAccess.onboarding.phases.${app.onboardingPhase.toLowerCase()}`)}
                      </p>
                    )}
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-body ${statusColor(app.status)}`}>
                    {t(`capitalAccess.status.${app.status.toLowerCase()}`)}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="font-body text-charcoal/40">{t("capitalAccess.request.amount")}</p>
                    <p className="font-heading font-medium">{formatUsd(app.requestedAmountUsd)}</p>
                  </div>
                  <div>
                    <p className="font-body text-charcoal/40">{t("capitalAccess.request.apr")}</p>
                    <p className="font-heading font-medium">{app.interestRatePct}%</p>
                  </div>
                  <div>
                    <p className="font-body text-charcoal/40">{t("capitalAccess.request.term")}</p>
                    <p className="font-heading font-medium">
                      {app.termYears} {t("capitalAccess.request.years")}
                    </p>
                  </div>
                  <div>
                    <p className="font-body text-charcoal/40">{t("capitalAccess.securityDeposit")}</p>
                    <p className="font-heading font-medium">{formatUsd(app.securityDepositUsd)}</p>
                  </div>
                </div>

                {showDocsAction && (
                  <div className="mt-5 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-3 mb-3">
                      <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-body font-medium text-amber-900">
                          {app.onboardingPhase === "DOCUMENTS_REVISION"
                            ? t("capitalAccess.applications.extraDocsTitle")
                            : t("capitalAccess.applications.uploadDocsTitle")}
                        </p>
                        <p className="font-body text-sm text-amber-900/80 mt-1">
                          {app.onboardingPhase === "DOCUMENTS_REVISION"
                            ? t("capitalAccess.applications.extraDocsDesc")
                            : t("capitalAccess.applications.uploadDocsDesc")}
                        </p>
                        {app.onboardingPhase === "DOCUMENTS_REVISION" && app.adminNotes && (
                          <p className="font-body text-sm text-amber-900 mt-2 whitespace-pre-line border-l-2 border-amber-400 pl-3">
                            {app.adminNotes}
                          </p>
                        )}
                      </div>
                    </div>
                    <Link
                      href={facilityHref(app.id)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold text-charcoal font-body text-sm rounded-sm hover:bg-gold/90"
                    >
                      <FileText className="w-4 h-4" />
                      {t("capitalAccess.applications.openOnboarding")} →
                    </Link>
                  </div>
                )}

                {app.documentsAwaitingReview && !showDocsAction && (
                  <div className="mt-5 p-4 bg-green-50 border border-green-200 rounded-lg flex flex-wrap items-center justify-between gap-3">
                    <p className="font-body text-sm text-green-900">
                      {t("capitalAccess.applications.docsUnderReview")}
                    </p>
                    <Link
                      href={facilityHref(app.id)}
                      className="inline-flex items-center gap-2 px-4 py-2 border border-green-700/30 text-green-900 font-body text-sm rounded-sm"
                    >
                      {t("capitalAccess.onboarding.openFacility")} →
                    </Link>
                  </div>
                )}

                {showDepositAction && !showDocsAction && (
                  <Link
                    href={facilityHref(app.id)}
                    className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-gold text-charcoal font-body text-sm rounded-sm hover:bg-gold/90"
                  >
                    {t("capitalAccess.onboarding.openFacility")} →
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
