"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/hooks/useTranslations";

interface Application {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  assetRange: string;
  message: string;
  status: string;
  createdAt: string;
}

export default function AdminApplicationsPage() {
  const { t } = useTranslations();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    fetch("/api/admin/applications")
      .then((res) => res.json())
      .then((json) => setApplications(json.applications || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    await fetch(`/api/admin/applications/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    loadData();
  };

  if (loading) {
    return <p className="font-body text-charcoal/60">{t("common.loading")}</p>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-semibold text-charcoal mb-2">
          {t("admin.applications")}
        </h1>
        <p className="font-body text-charcoal/60">{t("admin.applicationsSubtitle")}</p>
      </div>

      {applications.length === 0 ? (
        <div className="p-12 bg-white border border-charcoal/10 rounded-lg text-center">
          <p className="font-body text-charcoal/60">{t("admin.noApplications")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="p-6 bg-white border border-charcoal/10 rounded-lg">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <p className="font-heading font-semibold text-charcoal">{app.name}</p>
                  <p className="font-body text-sm text-charcoal/70">
                    {app.email} · {app.country}
                  </p>
                  <p className="font-body text-sm text-charcoal/50 mt-1">{app.assetRange}</p>
                  <p className="font-body text-sm text-charcoal/60 mt-2">{app.message}</p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded shrink-0 ${
                    app.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-800"
                      : app.status === "APPROVED"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {t(`admin.status.${app.status.toLowerCase()}`)}
                </span>
              </div>
              {app.status === "PENDING" && (
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleAction(app.id, "approve")}
                    className="px-4 py-2 bg-gold text-charcoal font-body text-sm rounded-sm"
                  >
                    {t("admin.approve")}
                  </button>
                  <button
                    onClick={() => handleAction(app.id, "reject")}
                    className="px-4 py-2 border border-red-300 text-red-700 font-body text-sm rounded-sm"
                  >
                    {t("admin.reject")}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
