"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Shield } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { useParams } from "next/navigation";

export default function ServicesCTA() {
  const { t, locale } = useTranslations();
  const params = useParams();

  const getLocalizedHref = (href: string) => {
    const currentLocale = (params?.locale as string) || locale || "en";
    return `/${currentLocale}${href}`;
  };

  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-off-white to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div className="inline-block mb-8">
            <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center">
              <Shield className="w-10 h-10 text-gold" />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-heading font-semibold text-charcoal mb-6">
            {t("cta.title")}
          </h2>
          <p className="text-lg md:text-xl text-charcoal/70 font-body mb-8 max-w-2xl mx-auto">
            {t("cta.subtitle")}
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href={getLocalizedHref("/contact")}
              className="gold-shimmer inline-flex items-center gap-2 px-8 py-4 bg-gold text-charcoal font-body font-medium rounded-sm hover:bg-gold/90 transition-all duration-300 hover:shadow-lg"
            >
              {t("cta.button")}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

