"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "@/hooks/useTranslations";

export default function WealthCloseSection() {
  const { t, locale } = useTranslations();
  const params = useParams();
  const loc = (params?.locale as string) || locale || "en";

  return (
    <section className="py-16 md:py-24 bg-charcoal text-off-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-heading font-semibold mb-4">
            {t("wealth.closeTitle")}
          </h2>
          <p className="font-body text-off-white/75 mb-8">{t("wealth.closeSubtitle")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#register"
              className="inline-flex items-center justify-center px-8 py-4 bg-gold text-charcoal font-body font-medium rounded-sm hover:bg-gold/90"
            >
              {t("wealth.closeApply")}
            </a>
            <Link
              href={`/${loc}/membership`}
              className="inline-flex items-center justify-center px-8 py-4 border border-gold/50 text-off-white font-body font-medium rounded-sm hover:border-gold hover:text-gold"
            >
              {t("wealth.closeVault")}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
