"use client";

import { motion } from "framer-motion";
import { Mail, Lock } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

export default function ContactHeroSection() {
  const { t } = useTranslations();

  return (
    <section className="relative min-h-[60vh] flex items-center justify-center bg-gradient-to-b from-off-white to-white pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center gap-8"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center gap-4"
          >
            <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center">
              <Mail className="w-10 h-10 text-gold" />
            </div>
            <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center">
              <Lock className="w-8 h-8 text-gold" />
            </div>
          </motion.div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-semibold text-charcoal tracking-tight">
            {t("contact.heroTitle")}
          </h1>
          <p className="text-xl md:text-2xl text-charcoal/70 font-body max-w-2xl">
            {t("contact.heroSubtitle")}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

