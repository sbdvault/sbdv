"use client";

import { motion } from "framer-motion";
import { Shield, Star, Building2, CheckCircle2 } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

export default function MembershipTiersSection() {
  const { t, tArray } = useTranslations();

  const membershipTiers = [
    {
      icon: Shield,
      titleKey: "membership.tiers.standard.title",
      subtitleKey: "membership.tiers.standard.subtitle",
      minimumKey: "membership.tiers.standard.minimum",
      descriptionKey: "membership.tiers.standard.description",
      featuresKey: "membership.tiers.standard.features",
      color: "from-gold/10 to-gold/5",
    },
    {
      icon: Star,
      titleKey: "membership.tiers.executive.title",
      subtitleKey: "membership.tiers.executive.subtitle",
      minimumKey: "membership.tiers.executive.minimum",
      descriptionKey: "membership.tiers.executive.description",
      featuresKey: "membership.tiers.executive.features",
      color: "from-gold/15 to-gold/8",
    },
    {
      icon: Building2,
      titleKey: "membership.tiers.sovereign.title",
      subtitleKey: "membership.tiers.sovereign.subtitle",
      minimumKey: "membership.tiers.sovereign.minimum",
      descriptionKey: "membership.tiers.sovereign.description",
      featuresKey: "membership.tiers.sovereign.features",
      color: "from-gold/20 to-gold/10",
    },
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
            {t("membership.tiersTitle")}
          </h2>
          <p className="text-lg md:text-xl text-charcoal/70 font-body max-w-3xl mx-auto">
            {t("membership.tiersSubtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {membershipTiers.map((tier, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className={`relative p-8 bg-gradient-to-br ${tier.color} border border-charcoal/10 rounded-lg hover:border-gold transition-all duration-300 hover:shadow-xl overflow-hidden group`}
            >
              {/* Gold accent on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-gold/0 to-gold/0 group-hover:from-gold/10 group-hover:to-transparent transition-all duration-300"></div>

              <div className="relative z-10">
                {/* Icon and Badge */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center group-hover:bg-gold/30 transition-colors duration-300">
                    <tier.icon className="w-8 h-8 text-gold" />
                  </div>
                  <span className="text-xs font-body font-medium text-gold bg-gold/10 px-3 py-1 rounded-full">
                    {t(tier.subtitleKey)}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-heading font-semibold text-charcoal mb-2">
                  {t(tier.titleKey)}
                </h3>

                {/* Minimum */}
                <p className="text-gold font-body font-medium mb-4">
                  {t(tier.minimumKey)}
                </p>

                {/* Description */}
                <p className="text-charcoal/70 font-body mb-6 leading-relaxed text-sm">
                  {t(tier.descriptionKey)}
                </p>

                {/* Features */}
                <ul className="space-y-3">
                  {tArray(tier.featuresKey).map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="flex items-start gap-3 text-charcoal/80 font-body text-sm"
                    >
                      <CheckCircle2 className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

