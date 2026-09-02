"use client";

import { motion } from "framer-motion";
import { useTranslations } from "@/hooks/useTranslations";

export default function AboutSection() {
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
          <h2 className="text-4xl md:text-5xl font-heading font-semibold text-charcoal mb-8">
            {t("about.sectionTitle")}
          </h2>
          <p className="text-lg md:text-xl text-charcoal/80 font-body leading-relaxed">
            {t("about.sectionDescription")}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

