"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { TrendingUp, ArrowRight } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { useParams } from "next/navigation";

export default function WealthTeaserSection() {
  const { t, locale } = useTranslations();
  const params = useParams();

  const getLocalizedHref = (href: string) => {
    const currentLocale = (params?.locale as string) || locale || "en";
    return `/${currentLocale}${href}`;
  };

  return (
    <section className="py-20 md:py-32 bg-charcoal text-off-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mb-6">
              <TrendingUp className="w-8 h-8 text-gold" />
            </div>
            <h2 className="text-4xl md:text-5xl font-heading font-semibold mb-6">
              {t("home.wealthTeaserTitle")}
            </h2>
            <p className="text-lg text-off-white/70 font-body leading-relaxed mb-8">
              {t("home.wealthTeaserDescription")}
            </p>
            <Link
              href={getLocalizedHref("/wealth-investment")}
              className="inline-flex items-center gap-2 gold-shimmer px-8 py-3 bg-gold text-charcoal font-body font-medium rounded-sm hover:bg-gold/90 transition-all duration-300"
            >
              {t("home.wealthTeaserButton")}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-2 gap-4"
          >
            {["advisory", "portfolio", "metals", "reporting"].map((key, i) => (
              <div
                key={key}
                className="p-6 bg-charcoal border border-gold/20 rounded-lg"
              >
                <p className="font-heading text-gold text-sm mb-2">0{i + 1}</p>
                <p className="font-heading font-semibold text-off-white">
                  {t(`wealth.pillars.${key}.title`)}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
