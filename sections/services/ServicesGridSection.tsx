"use client";

import { motion } from "framer-motion";
import {
  Vault,
  Coins,
  FileCheck,
  Users,
  CheckCircle2,
  TrendingUp,
  PieChart,
  Gem,
  BarChart3,
} from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

function ServiceGrid({
  services,
  title,
  subtitle,
}: {
  services: {
    icon: React.ComponentType<{ className?: string }>;
    titleKey: string;
    descriptionKey: string;
    featuresKey: string;
  }[];
  title: string;
  subtitle: string;
}) {
  const { t, tArray } = useTranslations();

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl md:text-5xl font-heading font-semibold text-charcoal mb-6">
          {title}
        </h2>
        <p className="text-lg md:text-xl text-charcoal/70 font-body max-w-3xl mx-auto">
          {subtitle}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {services.map((service, index) => (
          <motion.div
            key={service.titleKey}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="group relative p-8 bg-gradient-to-br from-off-white to-white border border-charcoal/10 rounded-lg hover:border-gold transition-all duration-300 hover:shadow-xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gold/0 to-gold/0 group-hover:from-gold/5 group-hover:to-transparent transition-all duration-300"></div>
            <div className="relative z-10">
              <div className="mb-6">
                <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors duration-300">
                  <service.icon className="w-8 h-8 text-gold" />
                </div>
              </div>
              <h3 className="text-2xl font-heading font-semibold text-charcoal mb-4">
                {t(service.titleKey)}
              </h3>
              <p className="text-charcoal/70 font-body mb-6 leading-relaxed">
                {t(service.descriptionKey)}
              </p>
              <ul className="space-y-3">
                {tArray(service.featuresKey).map(
                  (feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="flex items-center gap-3 text-charcoal/80 font-body"
                    >
                      <CheckCircle2 className="w-5 h-5 text-gold flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  )
                )}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
}

export default function ServicesGridSection() {
  const { t, tArray } = useTranslations();

  const custodyServices = [
    {
      icon: Vault,
      titleKey: "services.gridServices.privateVault.title",
      descriptionKey: "services.gridServices.privateVault.description",
      featuresKey: "services.gridServices.privateVault.features",
    },
    {
      icon: Coins,
      titleKey: "services.gridServices.bullionCustody.title",
      descriptionKey: "services.gridServices.bullionCustody.description",
      featuresKey: "services.gridServices.bullionCustody.features",
    },
    {
      icon: FileCheck,
      titleKey: "services.gridServices.insurance.title",
      descriptionKey: "services.gridServices.insurance.description",
      featuresKey: "services.gridServices.insurance.features",
    },
    {
      icon: Users,
      titleKey: "services.gridServices.vipRooms.title",
      descriptionKey: "services.gridServices.vipRooms.description",
      featuresKey: "services.gridServices.vipRooms.features",
    },
  ];

  const wealthServices = [
    {
      icon: TrendingUp,
      titleKey: "services.wealthGridServices.advisory.title",
      descriptionKey: "services.wealthGridServices.advisory.description",
      featuresKey: "services.wealthGridServices.advisory.features",
    },
    {
      icon: PieChart,
      titleKey: "services.wealthGridServices.portfolio.title",
      descriptionKey: "services.wealthGridServices.portfolio.description",
      featuresKey: "services.wealthGridServices.portfolio.features",
    },
    {
      icon: Gem,
      titleKey: "services.wealthGridServices.alternatives.title",
      descriptionKey: "services.wealthGridServices.alternatives.description",
      featuresKey: "services.wealthGridServices.alternatives.features",
    },
    {
      icon: BarChart3,
      titleKey: "services.wealthGridServices.reporting.title",
      descriptionKey: "services.wealthGridServices.reporting.description",
      featuresKey: "services.wealthGridServices.reporting.features",
    },
  ];

  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ServiceGrid
          services={custodyServices}
          title={t("services.gridTitle")}
          subtitle={t("services.gridSubtitle")}
        />

        <div className="mt-24">
          <ServiceGrid
            services={wealthServices}
            title={t("services.wealthGridTitle")}
            subtitle={t("services.wealthGridSubtitle")}
          />
        </div>
      </div>
    </section>
  );
}
