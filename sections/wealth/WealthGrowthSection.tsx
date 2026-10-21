"use client";

import { motion } from "framer-motion";
import { useTranslations } from "@/hooks/useTranslations";

export default function WealthGrowthSection() {
  const { t, tArray } = useTranslations();

  const steps = [
    { titleKey: "wealth.growth.steps.fund.title", descKey: "wealth.growth.steps.fund.description" },
    { titleKey: "wealth.growth.steps.accrue.title", descKey: "wealth.growth.steps.accrue.description" },
    { titleKey: "wealth.growth.steps.choose.title", descKey: "wealth.growth.steps.choose.description" },
  ] as const;

  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-heading font-semibold text-charcoal mb-6">
            {t("wealth.growth.title")}
          </h2>
          <p className="text-lg text-charcoal/70 font-body max-w-3xl mx-auto">
            {t("wealth.growth.subtitle")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => (
            <motion.div
              key={step.titleKey}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-6 border border-charcoal/10 rounded-lg bg-off-white"
            >
              <p className="text-xs uppercase tracking-widest text-gold mb-3">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="font-heading text-xl text-charcoal mb-3">{t(step.titleKey)}</h3>
              <p className="font-body text-sm text-charcoal/70 leading-relaxed">{t(step.descKey)}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-8 border border-gold/30 rounded-lg bg-charcoal text-off-white mb-16"
        >
          <p className="text-xs uppercase tracking-widest text-gold mb-3">
            {t("wealth.growth.exampleLabel")}
          </p>
          <h3 className="font-heading text-2xl mb-4">{t("wealth.growth.exampleTitle")}</h3>
          <p className="font-body text-off-white/80 leading-relaxed mb-6">
            {t("wealth.growth.exampleBody")}
          </p>
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <dt className="text-xs uppercase tracking-wide text-off-white/50">
                {t("wealth.growth.examplePrincipal")}
              </dt>
              <dd className="font-heading text-2xl mt-1">$250,000</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-off-white/50">
                {t("wealth.growth.exampleYield")}
              </dt>
              <dd className="font-heading text-2xl mt-1">8%</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-off-white/50">
                {t("wealth.growth.exampleInterest")}
              </dt>
              <dd className="font-heading text-2xl mt-1 text-gold">~$20,000</dd>
            </div>
          </dl>
          <p className="font-body text-xs text-off-white/50 mt-6">{t("wealth.growth.exampleNote")}</p>
        </motion.div>

        <div>
          <h3 className="font-heading text-2xl text-charcoal mb-6 text-center">
            {t("wealth.benefits.title")}
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {tArray("wealth.benefits.items").map((item) => (
              <li
                key={item}
                className="font-body text-sm text-charcoal/80 border-l-2 border-gold pl-4 py-1"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
