"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Lock } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

export default function ContactFormSection() {
  const { t } = useTranslations();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    interest: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/sendInquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to submit inquiry");
      }

      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        country: "",
        interest: "",
        message: "",
      });
    } catch (err) {
      const detail = err instanceof Error ? err.message : "";
      setError(
        detail && detail !== "Failed to submit inquiry"
          ? detail
          : t("common.error") + ". " + t("common.tryAgain")
      );
      console.error("Error submitting form:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section className="py-20 md:py-32 bg-white min-h-[60vh]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gold/10 border border-gold/30 rounded-lg p-12 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <CheckCircle2 className="w-20 h-20 text-gold mx-auto mb-6" />
            </motion.div>
            <h3 className="text-3xl font-heading font-semibold text-charcoal mb-4">
              {t("contact.formSuccessTitle")}
            </h3>
            <p className="text-charcoal/70 font-body mb-6">
              {t("contact.formSuccessText")}
            </p>
            <div className="flex items-center justify-center gap-2 text-gold">
              <Lock className="w-5 h-5" />
              <span className="font-body text-sm">{t("contact.formSecureLabel")}</span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full"
          >
            <div className="bg-off-white border border-charcoal/10 rounded-lg p-8 md:p-12 w-full">
              <div className="flex items-center gap-3 mb-8">
                <Lock className="w-6 h-6 text-gold" />
                <h2 className="text-3xl font-heading font-semibold text-charcoal">
                  {t("contact.heroTitle")}
                </h2>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-800 font-body text-sm">{error}</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-body font-medium text-charcoal mb-2"
                  >
                    {t("contact.formLabels.name")} *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    disabled={submitting}
                    className="w-full px-4 py-3 border border-charcoal/20 rounded-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold font-body text-charcoal bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder={t("contact.formPlaceholders.name")}
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-body font-medium text-charcoal mb-2"
                  >
                    {t("contact.formLabels.email")} *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    disabled={submitting}
                    className="w-full px-4 py-3 border border-charcoal/20 rounded-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold font-body text-charcoal bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder={t("contact.formPlaceholders.email")}
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-body font-medium text-charcoal mb-2"
                  >
                    {t("contact.formLabels.phone")} *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={submitting}
                    className="w-full px-4 py-3 border border-charcoal/20 rounded-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold font-body text-charcoal bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder={t("contact.formPlaceholders.phone")}
                  />
                </div>

                <div>
                  <label
                    htmlFor="country"
                    className="block text-sm font-body font-medium text-charcoal mb-2"
                  >
                    {t("contact.formLabels.country")} *
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    required
                    value={formData.country}
                    onChange={handleChange}
                    disabled={submitting}
                    className="w-full px-4 py-3 border border-charcoal/20 rounded-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold font-body text-charcoal bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder={t("contact.formPlaceholders.country")}
                  />
                </div>

                <div>
                  <label
                    htmlFor="interest"
                    className="block text-sm font-body font-medium text-charcoal mb-2"
                  >
                    {t("contact.formLabels.interest")} *
                  </label>
                  <select
                    id="interest"
                    name="interest"
                    required
                    value={formData.interest}
                    onChange={handleChange}
                    disabled={submitting}
                    className="w-full px-4 py-3 border border-charcoal/20 rounded-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold font-body text-charcoal bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">{t("contact.formPlaceholders.interest")}</option>
                    <option value="private-vault">{t("contact.interestOptions.privateVault")}</option>
                    <option value="bullion-custody">{t("contact.interestOptions.bullionCustody")}</option>
                    <option value="insurance">{t("contact.interestOptions.insurance")}</option>
                    <option value="vip-viewing">{t("contact.interestOptions.vipViewing")}</option>
                    <option value="investment-advisory">{t("contact.interestOptions.investmentAdvisory")}</option>
                    <option value="portfolio-management">{t("contact.interestOptions.portfolioManagement")}</option>
                    <option value="alternative-investments">{t("contact.interestOptions.alternativeInvestments")}</option>
                    <option value="membership">{t("contact.interestOptions.membership")}</option>
                    <option value="general">{t("contact.interestOptions.general")}</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-body font-medium text-charcoal mb-2"
                  >
                    {t("contact.formLabels.message")} *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    required
                    value={formData.message}
                    onChange={handleChange}
                    disabled={submitting}
                    className="w-full px-4 py-3 border border-charcoal/20 rounded-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold font-body text-charcoal bg-white resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder={t("contact.formPlaceholders.message")}
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={!submitting ? { scale: 1.02 } : {}}
                  whileTap={!submitting ? { scale: 0.98 } : {}}
                  className="gold-shimmer w-full px-8 py-4 bg-gold text-charcoal font-body font-medium rounded-sm hover:bg-gold/90 transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Submit contact inquiry form"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-charcoal border-t-transparent rounded-full animate-spin"></div>
                      <span>{t("common.submitting")}</span>
                    </>
                  ) : (
                    <>
                      {t("common.submit")}
                      <Send className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

