"use client";

import { motion } from "framer-motion";
import { Target, PieChart, Coins, FileText } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

export default function WealthPillarsSection() {
  const { t } = useTranslations();

  const pillars = [
    { icon: Target, titleKey: "wealth.pillars.advisory.title", descKey: "wealth.pillars.advisory.description" },
    { icon: PieChart, titleKey: "wealth.pillars.portfolio.title", descKey: "wealth.pillars.portfolio.description" },
    { icon: Coins, titleKey: "wealth.pillars.metals.title", descKey: "wealth.pillars.metals.description" },
    { icon: FileText, titleKey: "wealth.pillars.reporting.title", descKey: "wealth.pillars.reporting.description" },
  ];

  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-heading font-semibold text-charcoal mb-6">
            {t("wealth.pillarsTitle")}
          </h2>
          <p className="text-lg md:text-xl text-charcoal/70 font-body max-w-3xl mx-auto">
            {t("wealth.pillarsSubtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.titleKey}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="p-8 bg-off-white border border-charcoal/10 rounded-lg hover:border-gold transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mb-6">
                <pillar.icon className="w-7 h-7 text-gold" />
              </div>
              <h3 className="text-2xl font-heading font-semibold text-charcoal mb-4">
                {t(pillar.titleKey)}
              </h3>
              <p className="text-charcoal/70 font-body leading-relaxed">
                {t(pillar.descKey)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
