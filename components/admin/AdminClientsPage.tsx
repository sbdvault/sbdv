"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/hooks/useTranslations";

interface Client {
  id: string;
  email: string;
  name: string | null;
  clientProfile: { tier: string } | null;
}

export default function AdminClientsPage() {
  const { t } = useTranslations();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    fetch("/api/admin/applications")
      .then((res) => res.json())
      .then((json) => setClients(json.clients || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const seedPortfolio = async (userId: string) => {
    await fetch(`/api/admin/applications/${userId}`, { method: "PUT" });
    loadData();
  };

  if (loading) {
    return <p className="font-body text-charcoal/60">{t("common.loading")}</p>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-semibold text-charcoal mb-2">
          {t("admin.clients")}
        </h1>
        <p className="font-body text-charcoal/60">{t("admin.clientsSubtitle")}</p>
      </div>

      <div className="bg-white border border-charcoal/10 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-off-white border-b border-charcoal/10">
            <tr>
              <th className="text-left p-4 font-body text-xs uppercase tracking-wide text-charcoal/60">
                {t("admin.clientsName")}
              </th>
              <th className="text-left p-4 font-body text-xs uppercase tracking-wide text-charcoal/60">
                {t("admin.clientsTier")}
              </th>
              <th className="text-right p-4 font-body text-xs uppercase tracking-wide text-charcoal/60">
                {t("admin.directives.actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-b border-charcoal/5 last:border-0">
                <td className="p-4">
                  <p className="font-body text-charcoal">{client.name || client.email}</p>
                  <p className="font-body text-xs text-charcoal/50">{client.email}</p>
                </td>
                <td className="p-4 font-body text-charcoal/70 capitalize">
                  {client.clientProfile?.tier || "—"}
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => seedPortfolio(client.id)}
                    className="px-4 py-2 border border-gold text-gold font-body text-sm rounded-sm hover:bg-gold hover:text-charcoal"
                  >
                    {t("admin.seedPortfolio")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
