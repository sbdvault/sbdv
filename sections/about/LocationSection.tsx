"use client";

import { motion } from "framer-motion";
import { MapPin, Globe } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

export default function LocationSection() {
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
              <MapPin className="w-10 h-10 text-gold" />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-heading font-semibold text-charcoal mb-6">
            {t("about.locationTitle")}
          </h2>
          <p className="text-lg md:text-xl text-charcoal/70 font-body mb-8 max-w-2xl mx-auto">
            {t("about.locationDescription")}
          </p>
          <div className="flex items-center justify-center gap-2 text-gold">
            <Globe className="w-6 h-6" />
            <span className="font-body font-medium">
              {t("about.worldwideAccessibility")}
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

