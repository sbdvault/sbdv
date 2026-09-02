"use client";

import { motion } from "framer-motion";
import { Target, Eye, Lock, Clock } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

export default function AboutContentSection() {
  const { t } = useTranslations();

  const values = [
    {
      icon: Lock,
      titleKey: "about.values.discretion.title",
      descriptionKey: "about.values.discretion.description",
    },
    {
      icon: Target,
      titleKey: "about.values.precision.title",
      descriptionKey: "about.values.precision.description",
    },
    {
      icon: Eye,
      titleKey: "about.values.security.title",
      descriptionKey: "about.values.security.description",
    },
    {
      icon: Clock,
      titleKey: "about.values.integrity.title",
      descriptionKey: "about.values.integrity.description",
    },
  ];
  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-heading font-semibold text-charcoal mb-4">
              {t("about.missionTitle")}
            </h2>
            <p className="text-lg text-charcoal/80 font-body leading-relaxed">
              {t("about.missionText")}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-3xl font-heading font-semibold text-charcoal mb-4">
              {t("about.visionTitle")}
            </h2>
            <p className="text-lg text-charcoal/80 font-body leading-relaxed">
              {t("about.visionText")}
            </p>
          </motion.div>
        </div>

        {/* Main About Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-heading font-semibold text-charcoal mb-8 text-center">
            {t("about.aboutTitle")}
          </h2>
          <div className="max-w-4xl mx-auto space-y-6 text-lg text-charcoal/80 font-body leading-relaxed">
            <p>
              {t("about.aboutParagraph1")}
            </p>
            <p>
              {t("about.aboutParagraph2")}
            </p>
            <p>
              {t("about.aboutParagraph3")}
            </p>
          </div>
        </motion.div>

        {/* Values Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-heading font-semibold text-charcoal mb-12 text-center">
            {t("about.valuesTitle")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="p-6 border border-charcoal/10 rounded-lg hover:border-gold transition-all duration-300 hover:shadow-lg text-center"
              >
                <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-gold" />
                </div>
                <h3 className="text-xl font-heading font-semibold text-charcoal mb-3">
                  {t(value.titleKey)}
                </h3>
                <p className="text-charcoal/70 font-body text-sm">
                  {t(value.descriptionKey)}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

