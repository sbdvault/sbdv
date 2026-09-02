"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Eye, Zap } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

export default function VaultSection() {
  const { t } = useTranslations();

  const features = [
    {
      icon: Lock,
      titleKey: "vault.vaultPageFeatures.defense.title",
      descriptionKey: "vault.vaultPageFeatures.defense.description",
    },
    {
      icon: Eye,
      titleKey: "vault.vaultPageFeatures.monitoring.title",
      descriptionKey: "vault.vaultPageFeatures.monitoring.description",
    },
    {
      icon: Shield,
      titleKey: "vault.vaultPageFeatures.impenetrable.title",
      descriptionKey: "vault.vaultPageFeatures.impenetrable.description",
    },
    {
      icon: Zap,
      titleKey: "vault.vaultPageFeatures.technology.title",
      descriptionKey: "vault.vaultPageFeatures.technology.description",
    },
  ];
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-charcoal via-charcoal/95 to-charcoal overflow-hidden pt-20">
      {/* 3D Depth Effect Background */}
      <div className="absolute inset-0">
        {/* Layered gradient circles for depth */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-3xl"></div>
      </div>

      {/* Lighting effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/5 to-transparent"></div>
      <div className="absolute top-0 left-0 w-full h-full" style={{
        background: 'radial-gradient(circle at center, rgba(212, 175, 55, 0.1) 0%, transparent 70%)'
      }}></div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-block mb-8"
          >
            <div className="w-24 h-24 rounded-full bg-gold/20 backdrop-blur-sm border border-gold/30 flex items-center justify-center mx-auto">
              <Shield className="w-12 h-12 text-gold" />
            </div>
          </motion.div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-semibold text-off-white mb-6">
            {t("vault.vaultPageTitle")}
          </h1>
          <p className="text-xl md:text-2xl text-off-white/80 font-body max-w-3xl mx-auto">
            {t("vault.vaultPageDescription")}
          </p>
        </motion.div>

        {/* Feature Grid with 3D Effect */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              whileHover={{ y: -10, scale: 1.05 }}
              className="relative p-6 bg-charcoal/50 backdrop-blur-sm border border-gold/20 rounded-lg hover:border-gold/50 transition-all duration-300 group"
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gold/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="text-gold mb-4">
                  <feature.icon className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-heading font-semibold text-off-white mb-2">
                  {t(feature.titleKey)}
                </h3>
                <p className="text-off-white/70 font-body text-sm">
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

