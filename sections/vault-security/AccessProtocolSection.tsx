"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Shield, CheckCircle2, Lock } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { useParams } from "next/navigation";

export default function AccessProtocolSection() {
  const { t, locale } = useTranslations();
  const params = useParams();

  const getLocalizedHref = (href: string) => {
    const currentLocale = (params?.locale as string) || locale || "en";
    return `/${currentLocale}${href}`;
  };

  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 rounded-full bg-gold/10 flex items-center justify-center">
              <Lock className="w-12 h-12 text-gold" />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-heading font-semibold text-charcoal mb-6">
            {t("vault.accessProtocolTitle")}
          </h2>
          <p className="text-lg md:text-xl text-charcoal/70 font-body leading-relaxed mb-12 max-w-3xl mx-auto">
            {t("vault.accessProtocolDescription")}
          </p>
        </motion.div>

        {/* Protocol Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {[
            {
              icon: Shield,
              step: "1",
              titleKey: "vault.accessProtocolSteps.step1.title",
              descriptionKey: "vault.accessProtocolSteps.step1.description",
            },
            {
              icon: CheckCircle2,
              step: "2",
              titleKey: "vault.accessProtocolSteps.step2.title",
              descriptionKey: "vault.accessProtocolSteps.step2.description",
            },
            {
              icon: Lock,
              step: "3",
              titleKey: "vault.accessProtocolSteps.step3.title",
              descriptionKey: "vault.accessProtocolSteps.step3.description",
            },
          ].map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="text-center p-6 border border-charcoal/10 rounded-lg hover:border-gold transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
                <step.icon className="w-8 h-8 text-gold" />
              </div>
              <div className="text-3xl font-heading font-bold text-gold mb-2">
                {step.step}
              </div>
              <h3 className="text-xl font-heading font-semibold text-charcoal mb-2">
                {t(step.titleKey)}
              </h3>
              <p className="text-charcoal/70 font-body text-sm">
                {t(step.descriptionKey)}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center"
        >
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

