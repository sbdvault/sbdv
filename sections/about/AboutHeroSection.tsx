"use client";

import { motion } from "framer-motion";
import { useTranslations } from "@/hooks/useTranslations";

export default function AboutHeroSection() {
  const { t } = useTranslations();

  return (
    <section className="relative flex min-h-[52vh] items-end bg-off-white pb-16 pt-28">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <p className="mb-4 font-body text-xs uppercase tracking-[0.22em] text-gold">
            {t("about.eyebrow")}
          </p>
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-charcoal md:text-6xl">
            {t("about.heroTitle")}
          </h1>
          <p className="mt-6 max-w-2xl font-body text-lg leading-relaxed text-charcoal/70 md:text-xl">
            {t("about.heroSubtitle")}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
