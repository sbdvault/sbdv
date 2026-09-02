"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Globe, ShieldCheck, MapPin } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

const officeKeys = ["zurich", "dubai", "singapore", "newYork"] as const;

const mapMarkers: Record<(typeof officeKeys)[number], { left: string; top: string }> = {
  newYork: { left: "23%", top: "32%" },
  zurich: { left: "50.5%", top: "28%" },
  dubai: { left: "57%", top: "40%" },
  singapore: { left: "73.5%", top: "51%" },
};

export default function GlobalAccessSection() {
  const { t } = useTranslations();

  return (
    <section className="py-20 md:py-32 bg-off-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 rounded-full bg-gold/10 flex items-center justify-center">
              <Globe className="w-12 h-12 text-gold" />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-heading font-semibold text-charcoal mb-6">
            {t("home.globalAccessTitle")}
          </h2>
          <p className="text-lg md:text-xl text-charcoal/70 font-body leading-relaxed mb-4 max-w-3xl mx-auto">
            {t("home.globalAccessDescription")}
          </p>
          <div className="flex items-center justify-center gap-2 text-gold mb-4">
            <ShieldCheck className="w-6 h-6" />
            <span className="font-body font-medium">
              {t("home.globalAccessLabel")}
            </span>
          </div>
          <p className="text-charcoal/60 font-body max-w-2xl mx-auto">
            {t("home.globalNetworkDescription")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative mb-16 max-w-5xl mx-auto aspect-[950/620]"
          aria-label="World map showing SBDV global offices"
        >
          <Image
            src="/world-map.svg"
            alt=""
            fill
            className="object-contain opacity-[0.22] [filter:sepia(0.35)_saturate(1.4)_hue-rotate(5deg)_brightness(0.85)]"
            priority={false}
          />

          {officeKeys.map((key, index) => (
            <div
              key={key}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                left: mapMarkers[key].left,
                top: mapMarkers[key].top,
              }}
            >
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="relative flex items-center justify-center"
              >
                <motion.span
                  className="absolute w-8 h-8 rounded-full border border-gold/50"
                  animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                />
                <span className="relative w-3.5 h-3.5 rounded-full bg-gold shadow-[0_0_12px_rgba(212,175,55,0.6)]" />
              </motion.div>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {officeKeys.map((key, index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-6 bg-white border border-charcoal/10 rounded-lg hover:border-gold transition-colors"
            >
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-gold" />
                <h3 className="font-heading font-semibold text-charcoal">
                  {t(`footer.offices.${key}.city`)}
                </h3>
              </div>
              <p className="text-sm text-gold font-body mb-2">
                {t(`footer.offices.${key}.label`)}
              </p>
              <p className="text-sm text-charcoal/70 font-body mb-2">
                {t(`footer.offices.${key}.country`)}
              </p>
              <p className="text-xs text-charcoal/50 font-body">
                {t(`footer.offices.${key}.timezone`)}
              </p>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-sm text-charcoal/50 font-body mt-12">
          {t("footer.jurisdictionNote")}
        </p>
      </div>
    </section>
  );
}
