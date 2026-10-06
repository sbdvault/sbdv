"use client";

import { motion } from "framer-motion";
import { Target, Lock, Clock } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

export default function SwissStandardSection() {
  const { t } = useTranslations();

  const standards = [
    {
      icon: Target,
      titleKey: "home.swissStandard.precision.title",
      descriptionKey: "home.swissStandard.precision.description",
    },
    {
      icon: Lock,
      titleKey: "home.swissStandard.privacy.title",
      descriptionKey: "home.swissStandard.privacy.description",
    },
    {
      icon: Clock,
      titleKey: "home.swissStandard.permanence.title",
      descriptionKey: "home.swissStandard.permanence.description",
    },
  ];

  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-heading font-semibold text-charcoal mb-6">
            {t("home.swissStandardTitle")}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {standards.map((standard, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="text-center"
            >
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center">
                  <standard.icon className="w-10 h-10 text-gold" />
                </div>
              </div>
              <h3 className="text-3xl font-heading font-semibold text-charcoal mb-4">
                {t(standard.titleKey)}
              </h3>
              <p className="text-charcoal/70 font-body text-lg">
                {t(standard.descriptionKey)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

