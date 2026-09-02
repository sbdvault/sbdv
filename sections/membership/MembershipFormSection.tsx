"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

export default function MembershipFormSection() {
  const { t } = useTranslations();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    assetRange: "",
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
      const response = await fetch("/api/sendMembership", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit application");
      }

      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        country: "",
        assetRange: "",
        message: "",
      });
    } catch (err) {
      setError(t("common.error") + ". " + t("common.tryAgain"));
      console.error("Error submitting form:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-heading font-semibold text-charcoal mb-6">
            {t("membership.formTitle")}
          </h2>
          <p className="text-lg md:text-xl text-charcoal/70 font-body">
            {t("membership.formSubtitle")}
          </p>
        </motion.div>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gold/10 border border-gold/30 rounded-lg p-8 text-center"
          >
            <CheckCircle2 className="w-16 h-16 text-gold mx-auto mb-4" />
            <h3 className="text-2xl font-heading font-semibold text-charcoal mb-2">
              {t("membership.formSuccessTitle")}
            </h3>
            <p className="text-charcoal/70 font-body">
              {t("membership.formSuccessText")}
            </p>
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
                <p className="text-red-800 font-body text-sm">{error}</p>
              </motion.div>
            )}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-body font-medium text-charcoal mb-2"
              >
                {t("membership.formLabels.name")}
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
                placeholder={t("membership.formPlaceholders.name")}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-body font-medium text-charcoal mb-2"
              >
                {t("membership.formLabels.email")}
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
                placeholder={t("membership.formPlaceholders.email")}
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-body font-medium text-charcoal mb-2"
              >
                {t("membership.formLabels.phone")}
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
                placeholder={t("membership.formPlaceholders.phone")}
              />
            </div>

            <div>
              <label
                htmlFor="country"
                className="block text-sm font-body font-medium text-charcoal mb-2"
              >
                {t("membership.formLabels.country")}
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
                placeholder={t("membership.formPlaceholders.country")}
              />
            </div>

            <div>
              <label
                htmlFor="assetRange"
                className="block text-sm font-body font-medium text-charcoal mb-2"
              >
                {t("membership.formLabels.assetRange")}
              </label>
              <select
                id="assetRange"
                name="assetRange"
                required
                value={formData.assetRange}
                onChange={handleChange}
                disabled={submitting}
                className="w-full px-4 py-3 border border-charcoal/20 rounded-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold font-body text-charcoal bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">{t("membership.formPlaceholders.assetRange")}</option>
                <option value="250k-1m">$250k - $1M</option>
                <option value="1m-5m">$1M - $5M</option>
                <option value="5m-25m">$5M - $25M</option>
                <option value="25m+">$25M+</option>
                <option value="institutional">Institutional</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-body font-medium text-charcoal mb-2"
              >
                {t("membership.formLabels.message")}
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                value={formData.message}
                onChange={handleChange}
                disabled={submitting}
                className="w-full px-4 py-3 border border-charcoal/20 rounded-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold font-body text-charcoal bg-white resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder={t("membership.formPlaceholders.message")}
              />
            </div>

            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={!submitting ? { scale: 1.02 } : {}}
              whileTap={!submitting ? { scale: 0.98 } : {}}
              className="gold-shimmer w-full px-8 py-4 bg-gold text-charcoal font-body font-medium rounded-sm hover:bg-gold/90 transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Submit membership application form"
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
          </motion.form>
        )}
      </div>
    </section>
  );
}

