"use client";

import { motion } from "framer-motion";
import { useTranslations } from "@/hooks/useTranslations";

interface LegalPageSectionProps {
  titleKey: string;
  introKey: string;
  bodyKey: string;
}

export default function LegalPageSection({
  titleKey,
  introKey,
  bodyKey,
}: LegalPageSectionProps) {
  const { t } = useTranslations();

  return (
    <section className="py-20 md:py-32 bg-white min-h-[60vh] pt-32">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl font-heading font-semibold text-charcoal mb-6 border-b-2 border-gold pb-4">
            {t(titleKey)}
          </h1>
          <p className="text-lg text-charcoal/80 font-body mb-8 leading-relaxed">
            {t(introKey)}
          </p>
          <div className="prose prose-charcoal font-body text-charcoal/70 leading-relaxed space-y-4">
            <p>{t(bodyKey)}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
