"use client";

import { motion } from "framer-motion";
import { ShieldCheck, FileText } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

export default function ComplianceSection() {
  const { t } = useTranslations();

  return (
    <section className="py-20 md:py-32 bg-off-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center">
              <ShieldCheck className="w-10 h-10 text-gold" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-heading font-semibold text-charcoal mb-6">
            {t("membership.complianceTitle")}
          </h2>
          <div className="bg-white border border-charcoal/10 rounded-lg p-8 max-w-2xl mx-auto">
            <div className="flex items-start gap-4">
              <FileText className="w-6 h-6 text-gold flex-shrink-0 mt-1" />
              <p className="text-lg text-charcoal/80 font-body leading-relaxed text-left">
                {t("membership.complianceText")}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

