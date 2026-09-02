"use client";

import { motion } from "framer-motion";
import { Fingerprint, Activity, Key, ShieldCheck } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

export default function SecurityArchitectureSection() {
  const { t } = useTranslations();

  const securityFeatures = [
    {
      icon: Fingerprint,
      titleKey: "vault.securityFeatures.biometrics.title",
      descriptionKey: "vault.securityFeatures.biometrics.description",
    },
    {
      icon: Activity,
      titleKey: "vault.securityFeatures.seismic.title",
      descriptionKey: "vault.securityFeatures.seismic.description",
    },
    {
      icon: Key,
      titleKey: "vault.securityFeatures.accessControl.title",
      descriptionKey: "vault.securityFeatures.accessControl.description",
    },
    {
      icon: ShieldCheck,
      titleKey: "vault.securityFeatures.insurance.title",
      descriptionKey: "vault.securityFeatures.insurance.description",
    },
  ];
  return (
    <section className="py-20 md:py-32 bg-off-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-heading font-semibold text-charcoal mb-6">
            {t("vault.securityArchitectureTitle")}
          </h2>
          <p className="text-lg md:text-xl text-charcoal/70 font-body max-w-3xl mx-auto">
            {t("vault.securityArchitectureDescription")}
          </p>
        </motion.div>

        <div className="space-y-6">
          {securityFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="flex flex-col md:flex-row items-start md:items-center gap-6 p-6 bg-white border border-charcoal/10 rounded-lg hover:border-gold transition-all duration-300 hover:shadow-lg group"
            >
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors duration-300">
                  <feature.icon className="w-8 h-8 text-gold" />
                </div>
              </div>
              <div className="flex-grow">
                <h3 className="text-2xl font-heading font-semibold text-charcoal mb-2">
                  {t(feature.titleKey)}
                </h3>
                <p className="text-charcoal/70 font-body leading-relaxed">
                  {t(feature.descriptionKey)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

