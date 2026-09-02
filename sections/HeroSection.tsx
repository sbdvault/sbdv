"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { useParams } from "next/navigation";
import Logo from "@/components/Logo";

// Gold particle component for background animation
const GoldParticle = ({ delay, startX }: { delay: number; startX: number }) => {
  return (
    <motion.div
      className="absolute w-1 h-1 bg-gold rounded-full opacity-20"
      initial={{ y: -100, x: startX }}
      animate={{
        y: "100vh",
        x: startX + (Math.random() - 0.5) * 200,
      }}
      transition={{
        duration: Math.random() * 3 + 2,
        repeat: Infinity,
        delay: delay,
        ease: "linear",
      }}
    />
  );
};

export default function HeroSection() {
  const [particles, setParticles] = useState<{ delay: number; startX: number }[]>([]);
  const { t, locale } = useTranslations();
  const params = useParams();

  useEffect(() => {
    // Create 20 particles with random starting positions
    setParticles(
      Array.from({ length: 20 }, (_, i) => ({
        delay: i * 0.2,
        startX: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1200),
      }))
    );
  }, []);

  const getLocalizedHref = (href: string) => {
    const currentLocale = (params?.locale as string) || locale || "en";
    return `/${currentLocale}${href}`;
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-white overflow-hidden pt-20">
      {/* Gold particles background */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle, i) => (
          <GoldParticle key={i} delay={particle.delay} startX={particle.startX} />
        ))}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center gap-8"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Logo height={200} priority />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-5xl md:text-6xl lg:text-7xl font-heading font-semibold text-charcoal tracking-tight"
          >
            {t("hero.headline")}
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg md:text-xl text-charcoal/70 font-body max-w-2xl"
          >
            {t("hero.subtext")}
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 mt-4"
          >
            <Link
              href={getLocalizedHref("/contact")}
              className="gold-shimmer px-8 py-3 bg-gold text-charcoal font-body font-medium rounded-sm hover:bg-gold/90 transition-all duration-300 hover:shadow-lg"
            >
              {t("hero.requestAccess")}
            </Link>
            <Link
              href={getLocalizedHref("/login")}
              className="px-8 py-3 border-2 border-gold text-gold font-body font-medium rounded-sm hover:bg-gold hover:text-charcoal transition-all duration-300"
            >
              {t("hero.clientLogin")}
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

