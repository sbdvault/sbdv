"use client";

import { motion } from "framer-motion";
import { useTranslations } from "@/hooks/useTranslations";

export default function WealthApproachSection() {
  const { t } = useTranslations();

  return (
    <section className="py-20 md:py-32 bg-off-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-heading font-semibold text-charcoal mb-6">
            {t("wealth.approachTitle")}
          </h2>
          <p className="text-lg text-charcoal/70 font-body leading-relaxed">
            {t("wealth.approachDescription")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="p-8 bg-white border border-gold/30 rounded-lg"
        >
          <h3 className="text-2xl font-heading font-semibold text-charcoal mb-4">
            {t("wealth.feesTitle")}
          </h3>
          <p className="text-charcoal/70 font-body mb-6">
            {t("wealth.feesDescription")}
          </p>
          <p className="text-sm text-charcoal/50 font-body italic border-t border-charcoal/10 pt-6">
            {t("wealth.disclaimer")}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
