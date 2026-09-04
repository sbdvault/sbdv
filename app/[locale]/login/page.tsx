"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, AlertCircle } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import Logo from "@/components/Logo";

export default function LoginPage() {
  const { t, locale } = useTranslations();
  const params = useParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [showMfa, setShowMfa] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const getLocalizedHref = (href: string) => {
    const currentLocale = (params?.locale as string) || locale || "en";
    return `/${currentLocale}${href}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      mfaCode: showMfa ? mfaCode : undefined,
      redirect: false,
    });

    setLoading(false);

    if (result?.error === "MFA_REQUIRED" || result?.code === "MFA_REQUIRED") {
      setShowMfa(true);
      setError(t("login.mfaRequired"));
      return;
    }

    if (result?.error === "MFA_INVALID" || result?.code === "MFA_INVALID") {
      setError(t("login.mfaInvalid"));
      return;
    }

    if (result?.error) {
      setError(t("login.invalidCredentials"));
      return;
    }

    const sessionRes = await fetch("/api/auth/session");
    const session = await sessionRes.json();
    if (!session?.user) {
      // Usually AUTH_URL / cookie host mismatch (e.g. wrong Amvera hostname).
      setError(t("login.invalidCredentials"));
      return;
    }

    let destination = getLocalizedHref("/portal");
    if (session.user.role === "ADMIN") {
      destination = getLocalizedHref("/admin");
    } else if (session.user.role === "BORROWER") {
      destination = getLocalizedHref("/capital-access/portal");
    }
    // Full navigation so the session cookie is always sent on the next request.
    window.location.assign(destination);
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-off-white to-white px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href={getLocalizedHref("/")} className="inline-block mb-6">
            <Logo height={120} className="mx-auto" />
          </Link>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Lock className="w-5 h-5 text-gold" />
            <h1 className="text-3xl font-heading font-semibold text-charcoal">
              {t("login.title")}
            </h1>
          </div>
          <p className="text-charcoal/70 font-body">{t("login.subtitle")}</p>
        </div>

        <div className="bg-white border-2 border-gold/30 rounded-lg p-8 shadow-lg">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-800 font-body text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-body font-medium text-charcoal mb-2">
                {t("login.email")}
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 border border-charcoal/20 rounded-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold font-body"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-body font-medium text-charcoal mb-2">
                {t("login.password")}
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 border border-charcoal/20 rounded-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold font-body"
              />
            </div>

            {showMfa && (
              <div>
                <label htmlFor="mfaCode" className="block text-sm font-body font-medium text-charcoal mb-2">
                  {t("login.mfaCode")}
                </label>
                <input
                  id="mfaCode"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 border border-charcoal/20 rounded-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold font-body tracking-widest text-center"
                  placeholder="000000"
                />
                <p className="text-xs text-charcoal/50 mt-2">{t("login.mfaHint")}</p>
              </div>
            )}

            <div className="flex justify-end">
              <Link
                href={getLocalizedHref("/forgot-password")}
                className="text-sm font-body text-gold hover:underline"
              >
                {t("login.forgotPassword")}
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="gold-shimmer w-full px-8 py-3 bg-gold text-charcoal font-body font-medium rounded-sm hover:bg-gold/90 transition-all disabled:opacity-50"
            >
              {loading ? t("login.signingIn") : t("login.signIn")}
            </button>
          </form>

          <p className="text-center text-sm text-charcoal/60 font-body mt-6">
            {t("login.noAccount")}{" "}
            <Link href={getLocalizedHref("/membership")} className="text-gold hover:underline">
              {t("login.applyMembership")}
            </Link>
          </p>
        </div>
      </motion.div>
    </section>
  );
}
