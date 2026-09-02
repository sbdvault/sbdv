"use client";

import { useEffect, useState } from "react";
import { Shield, ShieldCheck } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

export default function PortalSettingsPage() {
  const { t } = useTranslations();
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaSecret, setMfaSecret] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [setupStep, setSetupStep] = useState<"idle" | "setup">("idle");

  useEffect(() => {
    fetch("/api/portal/settings")
      .then((res) => res.json())
      .then((json) => setMfaEnabled(json.mfaEnabled));
  }, []);

  const startMfaSetup = async () => {
    const res = await fetch("/api/portal/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "generate" }),
    });
    const json = await res.json();
    setMfaSecret(json.secret);
    setSetupStep("setup");
  };

  const enableMfa = async () => {
    const res = await fetch("/api/portal/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "enable", secret: mfaSecret, code: mfaCode }),
    });
    if (res.ok) {
      setMfaEnabled(true);
      setSetupStep("idle");
      setMfaCode("");
    }
  };

  const disableMfa = async () => {
    await fetch("/api/portal/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "disable" }),
    });
    setMfaEnabled(false);
  };

  return (
    <div>
      <h1 className="text-3xl font-heading font-semibold text-charcoal mb-8">
        {t("portal.settings.title")}
      </h1>

      <div className="p-6 bg-white border border-charcoal/10 rounded-lg max-w-lg">
        <div className="flex items-center gap-3 mb-4">
          {mfaEnabled ? (
            <ShieldCheck className="w-6 h-6 text-green-600" />
          ) : (
            <Shield className="w-6 h-6 text-charcoal/40" />
          )}
          <h2 className="text-xl font-heading font-semibold text-charcoal">
            {t("portal.settings.mfaTitle")}
          </h2>
        </div>

        <p className="font-body text-charcoal/70 mb-6">
          {mfaEnabled ? t("portal.settings.mfaEnabled") : t("portal.settings.mfaDisabled")}
        </p>

        {mfaEnabled ? (
          <button
            onClick={disableMfa}
            className="px-4 py-2 border border-red-300 text-red-700 font-body text-sm rounded-sm hover:bg-red-50"
          >
            Disable MFA
          </button>
        ) : setupStep === "setup" ? (
          <div className="space-y-4">
            <p className="text-sm font-body text-charcoal/60">
              Add this secret to your authenticator app: <code className="bg-off-white px-2 py-1 rounded text-xs break-all">{mfaSecret}</code>
            </p>
            <input
              type="text"
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
              Verify & Enable
            </button>
          </div>
        ) : (
          <button
            onClick={startMfaSetup}
            className="px-4 py-2 bg-gold text-charcoal font-body text-sm rounded-sm hover:bg-gold/90"
          >
            {t("portal.settings.enableMfa")}
          </button>
        )}
      </div>
    </div>
  );
}
