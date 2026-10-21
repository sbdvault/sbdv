"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getCsrfToken, signIn } from "next-auth/react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import CountrySelect from "@/components/CountrySelect";
import { isSanctionedCountry } from "@/lib/countries";

export default function WealthRegisterSection({
  alreadyClient,
}: {
  alreadyClient: boolean;
}) {
  const { t, locale } = useTranslations();
  const params = useParams();
  const loc = (params?.locale as string) || locale || "en";
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    password: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [createdEmail, setCreatedEmail] = useState<string | null>(null);

  const mandateHref = `/${loc}/portal/mandate`;
  const loginHref = `/${loc}/login`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError(t("login.passwordMismatch"));
      setSubmitting(false);
      return;
    }

    if (isSanctionedCountry(formData.country)) {
      setError(t("capitalAccess.request.sanctionedCountry"));
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/portal/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          country: formData.country,
          password: formData.password,
        }),
      });
      const json = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 409) {
          setError(t("wealth.register.alreadyExists"));
        } else {
          setError(
            typeof json.error === "string" ? json.error : t("wealth.register.error")
          );
        }
        return;
      }

      await getCsrfToken().catch(() => undefined);
      const result = await signIn("credentials", {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setCreatedEmail(formData.email.trim());
        return;
      }

      window.location.assign(mandateHref);
    } catch {
      setError(t("wealth.register.error"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section id="register" className="py-20 md:py-32 bg-off-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-heading font-semibold text-charcoal mb-6">
            {alreadyClient
              ? t("wealth.register.continueTitle")
              : t("wealth.register.formTitle")}
          </h2>
          <p className="text-lg md:text-xl text-charcoal/70 font-body">
            {alreadyClient
              ? t("wealth.register.continueText")
              : t("wealth.register.formSubtitle")}
          </p>
        </motion.div>

        {alreadyClient ? (
          <div className="text-center">
            <Link
              href={mandateHref}
              className="gold-shimmer inline-flex items-center justify-center px-8 py-4 bg-gold text-charcoal font-body font-medium rounded-sm hover:bg-gold/90"
            >
              {t("wealth.register.continueCta")}
            </Link>
          </div>
        ) : createdEmail ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gold/10 border border-gold/30 rounded-lg p-8 text-center"
          >
            <CheckCircle2 className="w-16 h-16 text-gold mx-auto mb-4" />
            <h3 className="text-2xl font-heading font-semibold text-charcoal mb-2">
              {t("wealth.register.formSuccessTitle")}
            </h3>
            <p className="text-charcoal/70 font-body mb-6">
              {t("wealth.register.signInFailed")}
            </p>
            <Link
              href={loginHref}
              className="gold-shimmer inline-flex items-center justify-center px-8 py-4 bg-gold text-charcoal font-body font-medium rounded-sm hover:bg-gold/90"
            >
              {t("wealth.register.signIn")}
            </Link>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-800 font-body text-sm">
                  {error}{" "}
                  {error === t("wealth.register.alreadyExists") ? (
                    <Link href={loginHref} className="text-gold hover:underline">
                      {t("wealth.register.signIn")}
                    </Link>
                  ) : null}
                </p>
              </motion.div>
            )}

            <div>
              <label
                htmlFor="wealth-name"
                className="block text-sm font-body font-medium text-charcoal mb-2"
              >
                {t("membership.formLabels.name")}
              </label>
              <input
                type="text"
                id="wealth-name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                disabled={submitting}
                className="w-full px-4 py-3 border border-charcoal/20 rounded-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold font-body text-charcoal bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder={t("membership.formPlaceholders.name")}
              />
            </div>

            <div>
              <label
                htmlFor="wealth-email"
                className="block text-sm font-body font-medium text-charcoal mb-2"
              >
                {t("membership.formLabels.email")}
              </label>
              <input
                type="email"
                id="wealth-email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                disabled={submitting}
                className="w-full px-4 py-3 border border-charcoal/20 rounded-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold font-body text-charcoal bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder={t("membership.formPlaceholders.email")}
              />
            </div>

            <div>
              <label
                htmlFor="wealth-phone"
                className="block text-sm font-body font-medium text-charcoal mb-2"
              >
                {t("membership.formLabels.phone")}
              </label>
              <input
                type="tel"
                id="wealth-phone"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                disabled={submitting}
                className="w-full px-4 py-3 border border-charcoal/20 rounded-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold font-body text-charcoal bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder={t("membership.formPlaceholders.phone")}
              />
            </div>

            <div>
              <label
                htmlFor="wealth-country"
                className="block text-sm font-body font-medium text-charcoal mb-2"
              >
                {t("membership.formLabels.country")}
              </label>
              <CountrySelect
                id="wealth-country"
                name="country"
                value={formData.country}
                onChange={(country) => setFormData({ ...formData, country })}
                disabled={submitting}
                required
                placeholder={t("membership.formPlaceholders.country")}
              />
            </div>

            <div>
              <label
                htmlFor="wealth-password"
                className="block text-sm font-body font-medium text-charcoal mb-2"
              >
                {t("wealth.register.password")}
              </label>
              <input
                type="password"
                id="wealth-password"
                name="password"
                required
                minLength={8}
                value={formData.password}
                onChange={handleChange}
                disabled={submitting}
                className="w-full px-4 py-3 border border-charcoal/20 rounded-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold font-body text-charcoal bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder={t("wealth.register.passwordMin")}
              />
            </div>

            <div>
              <label
                htmlFor="wealth-confirm-password"
                className="block text-sm font-body font-medium text-charcoal mb-2"
              >
                {t("wealth.register.confirmPassword")}
              </label>
              <input
                type="password"
                id="wealth-confirm-password"
                name="confirmPassword"
                required
                minLength={8}
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={submitting}
                className="w-full px-4 py-3 border border-charcoal/20 rounded-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold font-body text-charcoal bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder={t("wealth.register.confirmPassword")}
              />
            </div>

            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={!submitting ? { scale: 1.02 } : {}}
              whileTap={!submitting ? { scale: 0.98 } : {}}
              className="gold-shimmer w-full px-8 py-4 bg-gold text-charcoal font-body font-medium rounded-sm hover:bg-gold/90 transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting
                ? t("wealth.register.creatingAccount")
                : t("wealth.register.createAccount")}
            </motion.button>
          </motion.form>
        )}
      </div>
    </section>
  );
}
