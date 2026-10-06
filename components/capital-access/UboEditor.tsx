"use client";

import { useState } from "react";
import CountrySelect from "@/components/CountrySelect";
import { UBO_CONTROL_METHODS } from "@/lib/capital-access-onboarding";

export type UboRecord = {
  id: string;
  fullName: string;
  dateOfBirth: string | null;
  nationality: string;
  domicileCountry: string;
  ownershipPct: number | null;
  controlMethod: string;
  pep: boolean;
};

const emptyForm = {
  fullName: "",
  dateOfBirth: "",
  nationality: "",
  domicileCountry: "",
  ownershipPct: "",
  controlMethod: "SHARES_25",
  pep: false,
};

export default function UboEditor({
  facilityId,
  ubos,
  canEdit,
  t,
  onChanged,
}: {
  facilityId: string;
  ubos: UboRecord[];
  canEdit: boolean;
  t: (key: string) => string;
  onChanged: () => void;
}) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setError("");
    if (!form.fullName.trim() || !form.nationality || !form.domicileCountry) {
      setError(t("capitalAccess.onboarding.uboEmpty"));
      return;
    }
    setSaving(true);
    const res = await fetch(`/api/capital-access/facility/${facilityId}/ubos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: form.fullName,
        dateOfBirth: form.dateOfBirth || null,
        nationality: form.nationality,
        domicileCountry: form.domicileCountry,
        ownershipPct: form.ownershipPct ? parseFloat(form.ownershipPct) : null,
        controlMethod: form.controlMethod,
        pep: form.pep,
      }),
    });
    const json = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(json.error || t("capitalAccess.onboarding.error"));
      return;
    }
    setForm(emptyForm);
    onChanged();
  };

  const remove = async (id: string) => {
    setError("");
    const res = await fetch(`/api/capital-access/facility/${facilityId}/ubos/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error || t("capitalAccess.onboarding.error"));
      return;
    }
    onChanged();
  };

  const controlLabel = (method: string) => {
    if (method === "OTHER_CONTROL") return t("capitalAccess.onboarding.uboControlOther");
    if (method === "SENIOR_MANAGER") return t("capitalAccess.onboarding.uboControlManager");
    return t("capitalAccess.onboarding.uboControlShares");
  };

  return (
    <div className="mb-8 p-6 bg-white border border-charcoal/10 rounded-lg">
      <h2 className="font-heading font-semibold text-charcoal mb-2">
        {t("capitalAccess.onboarding.uboTitle")}
      </h2>
      <p className="font-body text-sm text-charcoal/70 mb-4">{t("capitalAccess.onboarding.uboDesc")}</p>

      {ubos.length === 0 ? (
        <p className="font-body text-sm text-amber-800 bg-amber-50 p-3 rounded-sm mb-4">
          {t("capitalAccess.onboarding.uboEmpty")}
        </p>
      ) : (
        <ul className="space-y-3 mb-6">
          {ubos.map((u) => (
            <li
              key={u.id}
              className="flex flex-wrap justify-between gap-3 p-3 border border-charcoal/10 rounded-sm"
            >
              <div>
                <p className="font-body font-medium text-charcoal">
                  {u.fullName}
                  {u.pep ? " · PEP" : ""}
                </p>
                <p className="font-body text-xs text-charcoal/60">
                  {u.nationality} · {u.domicileCountry}
                  {u.ownershipPct != null ? ` · ${u.ownershipPct}%` : ""} · {controlLabel(u.controlMethod)}
                </p>
              </div>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => remove(u.id)}
                  className="text-sm text-red-700 hover:underline"
                >
                  {t("capitalAccess.onboarding.uboRemove")}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {canEdit && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="font-body text-xs text-charcoal/50 uppercase tracking-wide">
              {t("capitalAccess.onboarding.uboName")}
            </span>
            <input
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="mt-1 w-full px-3 py-2.5 border border-charcoal/20 rounded-sm font-body text-sm focus:outline-none focus:border-gold"
            />
          </label>
          <label className="block">
            <span className="font-body text-xs text-charcoal/50 uppercase tracking-wide">
              {t("capitalAccess.onboarding.uboDob")}
            </span>
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
              className="mt-1 w-full px-3 py-2.5 border border-charcoal/20 rounded-sm font-body text-sm focus:outline-none focus:border-gold"
            />
          </label>
          <label className="block">
            <span className="font-body text-xs text-charcoal/50 uppercase tracking-wide">
              {t("capitalAccess.onboarding.uboNationality")}
            </span>
            <div className="mt-1">
              <CountrySelect
                value={form.nationality}
                onChange={(nationality) => setForm({ ...form, nationality })}
                required={false}
                className="w-full px-3 py-2.5 border border-charcoal/20 rounded-sm font-body text-sm focus:outline-none focus:border-gold bg-white"
              />
            </div>
          </label>
          <label className="block">
            <span className="font-body text-xs text-charcoal/50 uppercase tracking-wide">
              {t("capitalAccess.onboarding.uboDomicile")}
            </span>
            <div className="mt-1">
              <CountrySelect
                value={form.domicileCountry}
                onChange={(domicileCountry) => setForm({ ...form, domicileCountry })}
                required={false}
                className="w-full px-3 py-2.5 border border-charcoal/20 rounded-sm font-body text-sm focus:outline-none focus:border-gold bg-white"
              />
            </div>
          </label>
          <label className="block">
            <span className="font-body text-xs text-charcoal/50 uppercase tracking-wide">
              {t("capitalAccess.onboarding.uboPct")}
            </span>
            <input
              type="number"
              min={0}
              max={100}
              step={0.01}
              value={form.ownershipPct}
              onChange={(e) => setForm({ ...form, ownershipPct: e.target.value })}
              className="mt-1 w-full px-3 py-2.5 border border-charcoal/20 rounded-sm font-body text-sm focus:outline-none focus:border-gold"
            />
          </label>
          <label className="block">
            <span className="font-body text-xs text-charcoal/50 uppercase tracking-wide">
              {t("capitalAccess.onboarding.uboControl")}
            </span>
            <select
              value={form.controlMethod}
              onChange={(e) => setForm({ ...form, controlMethod: e.target.value })}
              className="mt-1 w-full px-3 py-2.5 border border-charcoal/20 rounded-sm font-body text-sm focus:outline-none focus:border-gold bg-white"
            >
              {UBO_CONTROL_METHODS.map((m) => (
                <option key={m} value={m}>
                  {controlLabel(m)}
                </option>
              ))}
            </select>
          </label>
          <label className="md:col-span-2 flex items-center gap-2 font-body text-sm text-charcoal/80">
            <input
              type="checkbox"
              checked={form.pep}
              onChange={(e) => setForm({ ...form, pep: e.target.checked })}
              className="accent-gold"
            />
            {t("capitalAccess.onboarding.uboPep")}
          </label>
          {error && <p className="md:col-span-2 font-body text-sm text-red-700">{error}</p>}
          <div className="md:col-span-2">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="px-5 py-2.5 bg-gold text-charcoal font-body text-sm rounded-sm disabled:opacity-50"
            >
              {saving ? t("common.loading") : t("capitalAccess.onboarding.uboAdd")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
