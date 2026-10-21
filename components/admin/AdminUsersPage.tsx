"use client";

import { FormEvent, useEffect, useState } from "react";
import { useTranslations } from "@/hooks/useTranslations";

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
  lastSignInAt: string | null;
  isAccountHolder: boolean;
}

function formatWhen(iso: string | null, locale: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(locale);
  } catch {
    return iso;
  }
}

export default function AdminUsersPage() {
  const { t, locale } = useTranslations();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loadUsers = () => {
    setLoading(true);
    fetch("/api/admin/users")
      .then(async (res) => {
        const json = await res.json().catch(() => null);
        if (!res.ok) {
          setError(json?.error || t("admin.users.forbidden"));
          setUsers([]);
          return;
        }
        setUsers(json.users || []);
        setError("");
      })
      .catch(() => setError(t("admin.users.loadError")))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const json = await res.json().catch(() => null);
    setSubmitting(false);

    if (!res.ok) {
      setError(json?.error || t("admin.users.createError"));
      return;
    }

    setSuccess(t("admin.users.success"));
    setName("");
    setEmail("");
    setPassword("");
    loadUsers();
  };

  if (loading) {
    return <p className="font-body text-charcoal/60">{t("common.loading")}</p>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-semibold text-charcoal mb-2">
          {t("admin.users.title")}
        </h1>
        <p className="font-body text-charcoal/60">{t("admin.users.subtitle")}</p>
      </div>

      {error && (
        <p className="mb-6 font-body text-sm text-red-800 bg-red-50 border border-red-200 px-4 py-3 rounded-sm">
          {error}
        </p>
      )}
      {success && (
        <p className="mb-6 font-body text-sm text-charcoal bg-off-white border border-gold/40 px-4 py-3 rounded-sm">
          {success}
        </p>
      )}

      <form
        onSubmit={handleCreate}
        className="mb-10 bg-white border border-charcoal/10 rounded-lg p-6 max-w-xl space-y-4"
      >
        <h2 className="font-heading text-lg text-charcoal">{t("admin.users.create")}</h2>
        <div>
          <label htmlFor="admin-name" className="block font-body text-sm text-charcoal mb-1">
            {t("admin.users.name")}
          </label>
          <input
            id="admin-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border border-charcoal/20 rounded-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold font-body"
          />
        </div>
        <div>
          <label htmlFor="admin-email" className="block font-body text-sm text-charcoal mb-1">
            {t("admin.users.email")}
          </label>
          <input
            id="admin-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-charcoal/20 rounded-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold font-body"
          />
        </div>
        <div>
          <label htmlFor="admin-password" className="block font-body text-sm text-charcoal mb-1">
            {t("admin.users.password")}
          </label>
          <input
            id="admin-password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-charcoal/20 rounded-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold font-body"
          />
          <p className="mt-1 font-body text-xs text-charcoal/50">{t("admin.users.passwordHint")}</p>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 bg-gold text-charcoal font-body text-sm rounded-sm hover:bg-gold/90 disabled:opacity-50"
        >
          {submitting ? t("admin.users.creating") : t("admin.users.submit")}
        </button>
      </form>

      <div className="bg-white border border-charcoal/10 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-off-white border-b border-charcoal/10">
            <tr>
              <th className="text-left p-4 font-body text-xs uppercase tracking-wide text-charcoal/60">
                {t("admin.users.name")}
              </th>
              <th className="text-left p-4 font-body text-xs uppercase tracking-wide text-charcoal/60">
                {t("admin.users.role")}
              </th>
              <th className="text-left p-4 font-body text-xs uppercase tracking-wide text-charcoal/60">
                {t("admin.users.created")}
              </th>
              <th className="text-left p-4 font-body text-xs uppercase tracking-wide text-charcoal/60">
                {t("admin.users.lastSignIn")}
              </th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 font-body text-charcoal/50">
                  {t("admin.users.empty")}
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-b border-charcoal/5 last:border-0">
                  <td className="p-4">
                    <p className="font-body text-charcoal">{user.name || user.email}</p>
                    <p className="font-body text-xs text-charcoal/50">{user.email}</p>
                  </td>
                  <td className="p-4 font-body text-sm text-charcoal/70">
                    {user.isAccountHolder ? t("admin.users.holder") : t("admin.users.staff")}
                  </td>
                  <td className="p-4 font-body text-sm text-charcoal/70">
                    {formatWhen(user.createdAt, locale)}
                  </td>
                  <td className="p-4 font-body text-sm text-charcoal/70">
                    {formatWhen(user.lastSignInAt, locale)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
