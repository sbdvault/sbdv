"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Eye } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

export default function VaultsSection() {
  const { t } = useTranslations();

  const features = [
    {
      icon: Shield,
      titleKey: "vault.vaultFeatures.multiTiered.title",
      descriptionKey: "vault.vaultFeatures.multiTiered.description",
    },
    {
      icon: Eye,
      titleKey: "vault.vaultFeatures.surveillance.title",
      descriptionKey: "vault.vaultFeatures.surveillance.description",
    },
    {
      icon: Lock,
      titleKey: "vault.vaultFeatures.engineering.title",
      descriptionKey: "vault.vaultFeatures.engineering.description",
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
            {t("vault.vaultsTitle")}
          </h2>
          <p className="text-lg md:text-xl text-charcoal/70 font-body max-w-3xl mx-auto">
            {t("vault.vaultsDescription")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="p-8 border border-charcoal/10 rounded-lg hover:border-gold transition-all duration-300 hover:shadow-lg"
            >
              <div className="text-gold mb-4">
                <feature.icon className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-heading font-semibold text-charcoal mb-3">
                {t(feature.titleKey)}
              </h3>
              <p className="text-charcoal/70 font-body">{t(feature.descriptionKey)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

