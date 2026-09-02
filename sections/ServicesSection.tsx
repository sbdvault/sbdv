"use client";

import { motion } from "framer-motion";
import { Vault, Coins, FileCheck, Users } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

export default function ServicesSection() {
  const { t } = useTranslations();

  const services = [
    {
      icon: Vault,
      titleKey: "services.services.privateVault.title",
      descriptionKey: "services.services.privateVault.description",
    },
    {
      icon: Coins,
      titleKey: "services.services.bullionStorage.title",
      descriptionKey: "services.services.bullionStorage.description",
    },
    {
      icon: FileCheck,
      titleKey: "services.services.insurance.title",
      descriptionKey: "services.services.insurance.description",
    },
    {
      icon: Users,
      titleKey: "services.services.vipRooms.title",
      descriptionKey: "services.services.vipRooms.description",
    },
  ];

  return (
    <section className="py-20 md:py-32 bg-off-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-heading font-semibold text-charcoal mb-6">
            {t("services.sectionTitle")}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="p-6 bg-white border border-charcoal/10 rounded-lg hover:border-gold transition-all duration-300 hover:shadow-xl cursor-pointer group"
            >
              <div className="text-gold mb-4 group-hover:scale-110 transition-transform duration-300">
                <service.icon className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-charcoal mb-3">
                {t(service.titleKey)}
              </h3>
              <p className="text-charcoal/70 font-body text-sm">
                {t(service.descriptionKey)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

