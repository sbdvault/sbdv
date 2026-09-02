"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations } from "@/hooks/useTranslations";
import { useParams } from "next/navigation";
import LanguageSwitcher from "./LanguageSwitcher";
import Logo from "./Logo";

const navLinkKeys = [
  { key: "home", href: "/" },
  { key: "about", href: "/about" },
  { key: "vault", href: "/vault-security" },
  { key: "wealth", href: "/wealth-investment" },
  { key: "capitalAccess", href: "/capital-access" },
  { key: "services", href: "/services" },
  { key: "membership", href: "/membership" },
  { key: "contact", href: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { t, locale } = useTranslations();
  const params = useParams();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getLocalizedHref = (href: string) => {
    const currentLocale = (params?.locale as string) || locale || "en";
    return `/${currentLocale}${href}`;
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-off-white/95 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href={getLocalizedHref("/")} className="flex items-center space-x-3">
            <Logo height={52} className="shrink-0" priority />
            <span className="font-heading text-xl text-charcoal hidden sm:block">
              SBDV
            </span>
          </Link>

          <div className="hidden lg:flex items-center space-x-6" role="list">
            {navLinkKeys.map((link) => (
              <Link
                key={link.key}
                href={getLocalizedHref(link.href)}
                className="font-body text-sm text-charcoal/80 hover:text-gold transition-colors duration-200 relative group"
              >
                {t(`nav.${link.key}`)}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gold transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
            <Link
              href={getLocalizedHref("/login")}
              className="px-4 py-2 border-2 border-gold text-gold font-body text-sm font-medium rounded-sm hover:bg-gold hover:text-charcoal transition-all duration-300"
            >
              {t("nav.clientLogin")}
            </Link>
            <LanguageSwitcher />
          </div>

          <div className="lg:hidden flex items-center gap-4">
            <Link
              href={getLocalizedHref("/login")}
              className="px-3 py-1.5 border border-gold text-gold font-body text-xs font-medium rounded-sm"
            >
              {t("nav.clientLogin")}
            </Link>
            <LanguageSwitcher />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-charcoal focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 rounded"
              aria-label="Toggle menu"
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {isOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden pb-4"
          >
            <div className="flex flex-col space-y-4">
              {navLinkKeys.map((link) => (
                <Link
                  key={link.key}
                  href={getLocalizedHref(link.href)}
                  onClick={() => setIsOpen(false)}
                  className="font-body text-sm text-charcoal/80 hover:text-gold transition-colors duration-200"
                >
                  {t(`nav.${link.key}`)}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
