"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { useParams } from "next/navigation";

export default function CTASection() {
  const { t, locale } = useTranslations();
  const params = useParams();

  const getLocalizedHref = (href: string) => {
    const currentLocale = (params?.locale as string) || locale || "en";
    return `/${currentLocale}${href}`;
  };

  return (
    <section className="py-20 md:py-32 bg-charcoal text-off-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-heading font-semibold mb-6">
            {t("cta.title")}
          </h2>
          <p className="text-lg md:text-xl text-off-white/80 font-body mb-10 max-w-2xl mx-auto">
            {t("cta.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={getLocalizedHref("/capital-access")}
              className="gold-shimmer inline-flex items-center justify-center gap-2 px-8 py-4 bg-gold text-charcoal font-body font-medium rounded-sm hover:bg-gold/90 transition-all duration-300"
            >
              {t("cta.capitalButton")}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href={getLocalizedHref("/membership")}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-gold/50 text-off-white font-body font-medium rounded-sm hover:border-gold hover:text-gold transition-all duration-300"
            >
              {t("cta.privateButton")}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
