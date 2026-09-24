"use client";

import { useEffect, useState } from "react";
import { Shield, ShieldCheck, KeyRound, UserRound, LogOut } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { hardSignOut } from "@/lib/hard-sign-out";

type SecurityProfile = {
  email: string;
  name: string | null;
  role: string;
  mfaEnabled: boolean;
  mfaMethod: string | null;
  memberSince: string;
  lastSignInAt: string | null;
};

function formatDate(iso: string | null, locale: string): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function roleLabel(role: string, t: (key: string) => string): string {
  const key = `accountSecurity.roles.${role.toLowerCase()}`;
  const translated = t(key);
  return translated === key ? role : translated;
}

export default function AccountSecuritySettings({
  title,
  signOutHref,
}: {
  title: string;
  signOutHref: string;
}) {
  const { t, locale } = useTranslations();
  const [profile, setProfile] = useState<SecurityProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaMethod, setMfaMethod] = useState<string | null>(null);
  const [mfaSecret, setMfaSecret] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [setupStep, setSetupStep] = useState<"idle" | "setup">("idle");
  const [mfaMessage, setMfaMessage] = useState("");

  const loadSecurity = async () => {
    const res = await fetch("/api/account/security", { cache: "no-store" });
    if (!res.ok) return;
    const json = (await res.json()) as SecurityProfile;
    setProfile(json);
    setMfaEnabled(json.mfaEnabled);
    setMfaMethod(json.mfaMethod);
  };

  useEffect(() => {
    loadSecurity().finally(() => setLoading(false));
  }, []);

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    setPasswordBusy(true);
    try {
      const res = await fetch("/api/account/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPasswordError(
          typeof json.error === "string" ? json.error : t("accountSecurity.password.errorGeneric")
        );
        return;
      }
      setPasswordSuccess(t("accountSecurity.password.success"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPasswordError(t("accountSecurity.password.errorGeneric"));
    } finally {
      setPasswordBusy(false);
    }
  };

  const startMfaSetup = async () => {
    const res = await fetch("/api/portal/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "generate" }),
    });
    const json = await res.json();
    setMfaSecret(json.secret);
    setSetupStep("setup");
    setMfaMessage("");
  };

  const enableMfa = async () => {
    const res = await fetch("/api/portal/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "enable", secret: mfaSecret, code: mfaCode }),
    });
    if (res.ok) {
      setMfaEnabled(true);
      setMfaMethod("TOTP");
      setSetupStep("idle");
      setMfaCode("");
      setMfaMessage("");
      await loadSecurity();
    } else {
      setMfaMessage(t("accountSecurity.mfa.invalidCode"));
    }
  };

  const enableEmailMfa = async () => {
    const res = await fetch("/api/portal/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "enable_email" }),
    });
    if (res.ok) {
      setMfaEnabled(true);
      setMfaMethod("EMAIL");
      setSetupStep("idle");
      setMfaMessage("");
      await loadSecurity();
    }
  };

  const disableMfa = async () => {
    await fetch("/api/portal/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "disable" }),
    });
    setMfaEnabled(false);
    setMfaMethod(null);
    await loadSecurity();
  };

  if (loading) {
    return <p className="font-body text-charcoal/60">{t("common.loading")}</p>;
  }

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-3xl font-heading font-semibold text-charcoal">{title}</h1>

      <section className="p-6 bg-white border border-charcoal/10 rounded-lg">
        <div className="flex items-center gap-3 mb-5">
          <UserRound className="w-5 h-5 text-gold" />
          <h2 className="text-xl font-heading font-semibold text-charcoal">
            {t("accountSecurity.summary.title")}
          </h2>
        </div>
        <dl className="space-y-3 font-body text-sm">
          <div className="flex justify-between gap-4 border-b border-charcoal/5 pb-3">
            <dt className="text-charcoal/50">{t("accountSecurity.summary.email")}</dt>
            <dd className="text-charcoal text-right truncate">{profile?.email || "—"}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-charcoal/5 pb-3">
            <dt className="text-charcoal/50">{t("accountSecurity.summary.role")}</dt>
            <dd className="text-charcoal text-right">
              {profile ? roleLabel(profile.role, t) : "—"}
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-charcoal/5 pb-3">
            <dt className="text-charcoal/50">{t("accountSecurity.summary.mfa")}</dt>
            <dd className="text-charcoal text-right">
              {mfaEnabled
                ? mfaMethod === "EMAIL"
                  ? t("accountSecurity.mfa.statusEmail")
                  : t("accountSecurity.mfa.statusTotp")
                : t("accountSecurity.mfa.statusOff")}
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-charcoal/5 pb-3">
            <dt className="text-charcoal/50">{t("accountSecurity.summary.memberSince")}</dt>
            <dd className="text-charcoal text-right">
              {formatDate(profile?.memberSince ?? null, locale)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-charcoal/50">{t("accountSecurity.summary.lastSignIn")}</dt>
            <dd className="text-charcoal text-right">
              {formatDate(profile?.lastSignInAt ?? null, locale)}
            </dd>
          </div>
        </dl>
      </section>

      <section className="p-6 bg-white border border-charcoal/10 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <KeyRound className="w-5 h-5 text-gold" />
          <h2 className="text-xl font-heading font-semibold text-charcoal">
            {t("accountSecurity.password.title")}
          </h2>
        </div>
        <p className="font-body text-sm text-charcoal/60 mb-6">
          {t("accountSecurity.password.hint")}
        </p>
        <form onSubmit={changePassword} className="space-y-4">
          <div>
            <label className="block font-body text-xs uppercase tracking-wider text-charcoal/50 mb-1.5">
              {t("accountSecurity.password.current")}
            </label>
            <input
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-charcoal/20 rounded-sm font-body"
            />
          </div>
          <div>
            <label className="block font-body text-xs uppercase tracking-wider text-charcoal/50 mb-1.5">
              {t("accountSecurity.password.new")}
            </label>
            <input
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-3 border border-charcoal/20 rounded-sm font-body"
            />
          </div>
          <div>
            <label className="block font-body text-xs uppercase tracking-wider text-charcoal/50 mb-1.5">
              {t("accountSecurity.password.confirm")}
            </label>
            <input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-3 border border-charcoal/20 rounded-sm font-body"
            />
          </div>
          {passwordError && (
            <p className="font-body text-sm text-red-600">{passwordError}</p>
          )}
          {passwordSuccess && (
            <p className="font-body text-sm text-green-700">{passwordSuccess}</p>
          )}
          <button
            type="submit"
            disabled={passwordBusy}
            className="px-5 py-2.5 bg-gold text-charcoal font-body text-sm rounded-sm hover:bg-gold/90 disabled:opacity-60"
          >
            {passwordBusy
              ? t("accountSecurity.password.saving")
              : t("accountSecurity.password.submit")}
          </button>
        </form>
      </section>

      <section className="p-6 bg-white border border-charcoal/10 rounded-lg">
        <div className="flex items-center gap-3 mb-4">
          {mfaEnabled ? (
            <ShieldCheck className="w-6 h-6 text-green-600" />
          ) : (
            <Shield className="w-6 h-6 text-charcoal/40" />
          )}
          <h2 className="text-xl font-heading font-semibold text-charcoal">
            {t("accountSecurity.mfa.title")}
          </h2>
        </div>

        <p className="font-body text-charcoal/70 mb-6">
          {mfaEnabled
            ? mfaMethod === "EMAIL"
              ? t("accountSecurity.mfa.enabledEmail")
              : t("accountSecurity.mfa.enabledTotp")
            : t("accountSecurity.mfa.disabled")}
        </p>

        {mfaMessage && <p className="mb-4 text-sm text-red-600 font-body">{mfaMessage}</p>}

        {mfaEnabled ? (
          <button
            onClick={disableMfa}
            className="px-4 py-2 border border-red-300 text-red-700 font-body text-sm rounded-sm hover:bg-red-50"
          >
            {t("accountSecurity.mfa.disable")}
          </button>
        ) : setupStep === "setup" ? (
          <div className="space-y-4">
            <p className="text-sm font-body text-charcoal/60">
              {t("accountSecurity.mfa.secretLabel")}{" "}
              <code className="bg-off-white px-2 py-1 rounded text-xs break-all">{mfaSecret}</code>
            </p>
            <input
              type="text"
              inputMode="numeric"
              placeholder="000000"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              maxLength={6}
              className="w-full px-4 py-3 border border-charcoal/20 rounded-sm font-body tracking-widest text-center"
            />
            <button
              onClick={enableMfa}
              className="px-4 py-2 bg-gold text-charcoal font-body text-sm rounded-sm"
            >
              {t("accountSecurity.mfa.verifyEnable")}
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={startMfaSetup}
              className="px-4 py-2 bg-gold text-charcoal font-body text-sm rounded-sm hover:bg-gold/90"
            >
              {t("accountSecurity.mfa.enableTotp")}
            </button>
            <button
              onClick={enableEmailMfa}
              className="px-4 py-2 border border-charcoal/20 text-charcoal font-body text-sm rounded-sm hover:border-gold"
            >
              {t("accountSecurity.mfa.enableEmail")}
            </button>
          </div>
        )}
      </section>

      <section className="p-6 bg-white border border-charcoal/10 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <LogOut className="w-5 h-5 text-gold" />
          <h2 className="text-xl font-heading font-semibold text-charcoal">
            {t("accountSecurity.session.title")}
          </h2>
        </div>
        <p className="font-body text-sm text-charcoal/60 mb-5">
          {t("accountSecurity.session.description")}
        </p>
        <button
          onClick={() => hardSignOut(signOutHref)}
          className="px-4 py-2 border border-charcoal/20 text-charcoal font-body text-sm rounded-sm hover:border-gold"
        >
          {t("accountSecurity.session.signOutDevice")}
        </button>
      </section>
    </div>
  );
}
