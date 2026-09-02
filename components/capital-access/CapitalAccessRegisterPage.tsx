"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations } from "@/hooks/useTranslations";
import Logo from "@/components/Logo";
import { Building2, AlertCircle } from "lucide-react";

export default function CapitalAccessRegisterPage() {
  const { t, locale } = useTranslations();
  const params = useParams();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    companyName: "",
    country: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const getLocalizedHref = (href: string) =>
    `/${(params?.locale as string) || locale || "en"}${href}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const regRes = await fetch("/api/capital-access/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const regJson = await regRes.json();

    if (!regRes.ok) {
      setError(regJson.error || t("capitalAccess.register.error"));
      setLoading(false);
      return;
    }

    const signInRes = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (signInRes?.error) {
      router.push(getLocalizedHref("/login"));
      return;
    }

    router.push(getLocalizedHref("/capital-access/portal"));
    router.refresh();
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-off-white to-white px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-8">
          <Link href={getLocalizedHref("/capital-access")} className="inline-block mb-6">
            <Logo height={100} className="mx-auto" />
          </Link>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Building2 className="w-5 h-5 text-gold" />
            <h1 className="text-2xl font-heading font-semibold text-charcoal">
              {t("capitalAccess.register.title")}
            </h1>
          </div>
          <p className="text-charcoal/70 font-body text-sm">{t("capitalAccess.register.subtitle")}</p>
        </div>

        <div className="bg-white border-2 border-gold/30 rounded-lg p-8 shadow-lg">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <p className="text-red-800 font-body text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: "name", label: t("capitalAccess.register.fullName"), type: "text" },
              { key: "email", label: t("login.email"), type: "email" },
              { key: "password", label: t("login.password"), type: "password" },
              { key: "companyName", label: t("capitalAccess.request.companyName"), type: "text" },
              { key: "country", label: t("capitalAccess.request.country"), type: "text" },
              { key: "phone", label: t("capitalAccess.register.phone"), type: "tel" },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-body font-medium text-charcoal mb-1">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  required={field.key !== "phone"}
                  minLength={field.key === "password" ? 8 : undefined}
                  value={form[field.key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  className="w-full px-4 py-3 border border-charcoal/20 rounded-sm focus:outline-none focus:border-gold font-body"
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gold text-charcoal font-body font-medium rounded-sm hover:bg-gold/90 disabled:opacity-50 mt-2"
            >
              {loading ? t("common.loading") : t("capitalAccess.register.submit")}
            </button>
          </form>

          <p className="text-center text-sm text-charcoal/60 font-body mt-6">
            {t("capitalAccess.register.hasAccount")}{" "}
            <Link href={getLocalizedHref("/login")} className="text-gold hover:underline">
              {t("login.signIn")}
            </Link>
          </p>
        </div>
      </motion.div>
    </section>
  );
}
