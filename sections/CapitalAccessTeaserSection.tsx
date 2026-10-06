"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { HandCoins, ArrowRight } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { useParams } from "next/navigation";

const pointKeys = ["structure", "oversight", "portal"] as const;

export default function CapitalAccessTeaserSection() {
  const { t, locale } = useTranslations();
  const params = useParams();

  const getLocalizedHref = (href: string) => {
    const currentLocale = (params?.locale as string) || locale || "en";
    return `/${currentLocale}${href}`;
  };

  return (
    <section className="py-20 md:py-32 bg-off-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-16 h-16 rounded-full bg-gold/15 flex items-center justify-center mb-6">
              <HandCoins className="w-8 h-8 text-gold" />
            </div>
            <h2 className="text-4xl md:text-5xl font-heading font-semibold text-charcoal mb-6">
              {t("home.capitalTeaserTitle")}
            </h2>
            <p className="text-lg text-charcoal/70 font-body leading-relaxed mb-8">
              {t("home.capitalTeaserDescription")}
            </p>
            <Link
              href={getLocalizedHref("/capital-access")}
              className="inline-flex items-center gap-2 gold-shimmer px-8 py-3 bg-gold text-charcoal font-body font-medium rounded-sm hover:bg-gold/90 transition-all duration-300"
            >
              {t("home.capitalTeaserButton")}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            {pointKeys.map((key, i) => (
              <div
                key={key}
                className="p-6 bg-white border border-charcoal/10 rounded-lg"
              >
                <p className="font-heading text-gold text-sm mb-2">0{i + 1}</p>
                <p className="font-heading font-semibold text-charcoal mb-1">
                  {t(`home.capitalTeaserPoints.${key}`)}
                </p>
                <p className="font-body text-sm text-charcoal/60">
                  {t(`home.capitalTeaserPoints.${key}Desc`)}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
