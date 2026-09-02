"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations } from "@/hooks/useTranslations";
import { useParams } from "next/navigation";
import { ArrowRight, Building2, Globe2, Shield, TrendingUp } from "lucide-react";

export default function CapitalAccessHeroSection() {
  const { t, locale } = useTranslations();
  const params = useParams();

  const getLocalizedHref = (href: string) =>
    `/${(params?.locale as string) || locale || "en"}${href}`;

  return (
    <section className="relative pt-32 pb-20 px-4 bg-gradient-to-b from-charcoal via-charcoal to-charcoal/95 text-off-white overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gold rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-gold/30 rounded-full blur-3xl" />
      </div>
      <div className="max-w-5xl mx-auto relative text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-body text-sm uppercase tracking-[0.2em] text-gold mb-4"
        >
          {t("capitalAccess.hero.badge")}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl lg:text-6xl font-heading font-semibold mb-6 leading-tight"
        >
          {t("capitalAccess.hero.title")}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-body text-lg text-off-white/70 max-w-2xl mx-auto mb-10"
        >
          {t("capitalAccess.hero.subtitle")}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href={getLocalizedHref("/capital-access/register")}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gold text-charcoal font-body font-medium rounded-sm hover:bg-gold/90 transition-colors"
          >
            {t("capitalAccess.hero.applyAccess")} <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href={getLocalizedHref("/login")}
            className="inline-flex items-center justify-center px-8 py-4 border border-off-white/30 text-off-white font-body rounded-sm hover:bg-off-white/10 transition-colors"
          >
            {t("capitalAccess.hero.partnerLogin")}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export function CapitalAccessFeaturesSection() {
  const { t } = useTranslations();
  const features = [
    { icon: Globe2, key: "globalPools" },
    { icon: TrendingUp, key: "flexibleTerms" },
    { icon: Building2, key: "enterpriseFocus" },
    { icon: Shield, key: "structuredSecurity" },
  ];

  return (
    <section className="py-20 px-4 bg-off-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-heading font-semibold text-charcoal text-center mb-4">
          {t("capitalAccess.features.title")}
        </h2>
        <p className="font-body text-charcoal/60 text-center max-w-2xl mx-auto mb-12">
          {t("capitalAccess.features.subtitle")}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, key }) => (
            <div key={key} className="p-6 bg-white border border-charcoal/10 rounded-lg text-center">
              <Icon className="w-8 h-8 text-gold mx-auto mb-4" />
              <h3 className="font-heading font-semibold text-charcoal mb-2">
                {t(`capitalAccess.features.${key}Title`)}
              </h3>
              <p className="font-body text-sm text-charcoal/60">
                {t(`capitalAccess.features.${key}Desc`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CapitalAccessHowItWorksSection() {
  const { t } = useTranslations();

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-heading font-semibold text-charcoal text-center mb-12">
          {t("capitalAccess.howItWorks.title")}
        </h2>
        <div className="space-y-8">
          {["register", "explore", "structure", "submit", "decision"].map((step, i) => (
            <div key={step} className="flex gap-6 items-start">
              <span className="flex-shrink-0 w-10 h-10 rounded-full bg-gold text-charcoal font-heading font-semibold flex items-center justify-center">
                {i + 1}
              </span>
              <div>
                <h3 className="font-heading font-semibold text-charcoal mb-1">
                  {t(`capitalAccess.howItWorks.${step}Title`)}
                </h3>
                <p className="font-body text-charcoal/70">{t(`capitalAccess.howItWorks.${step}Desc`)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
