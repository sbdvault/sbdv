"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import Logo from "@/components/Logo";

export default function ForgotPasswordPage() {
  const { t, locale } = useTranslations();
  const params = useParams();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const getLocalizedHref = (href: string) => {
    const currentLocale = (params?.locale as string) || locale || "en";
    return `/${currentLocale}${href}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(json.error || t("login.resetRequestFailed"));
      return;
    }
    setDone(true);
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
              {t("login.forgotTitle")}
            </h1>
          </div>
          <p className="text-charcoal/70 font-body">{t("login.forgotSubtitle")}</p>
        </div>

        <div className="bg-white border-2 border-gold/30 rounded-lg p-8 shadow-lg">
          {done ? (
            <div className="text-center space-y-4">
              <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto" />
              <p className="font-body text-charcoal/80">{t("login.resetEmailSent")}</p>
              <Link href={getLocalizedHref("/login")} className="text-gold hover:underline font-body text-sm">
                {t("login.backToSignIn")}
              </Link>
            </div>
          ) : (
            <>
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
                <button
                  type="submit"
                  disabled={loading}
                  className="gold-shimmer w-full px-8 py-3 bg-gold text-charcoal font-body font-medium rounded-sm hover:bg-gold/90 transition-all disabled:opacity-50"
                >
                  {loading ? t("common.loading") : t("login.sendResetLink")}
                </button>
              </form>
              <p className="text-center text-sm text-charcoal/60 font-body mt-6">
                <Link href={getLocalizedHref("/login")} className="text-gold hover:underline">
                  {t("login.backToSignIn")}
                </Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </section>
  );
}
