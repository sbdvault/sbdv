"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Locale, locales } from "@/proxy";
import { Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const languageNames: Record<Locale, string> = {
  en: "English",
  nl: "Nederlands",
  fr: "Français",
  it: "Italiano",
};

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Extract current locale from pathname
  const currentLocale =
    (pathname.split("/")[1] as Locale) || ("en" as Locale);

  const switchLocale = (newLocale: Locale) => {
    // Remove current locale from pathname
    const pathWithoutLocale = pathname.replace(`/${currentLocale}`, "") || "/";
    
    // Navigate to new locale
    router.push(`/${newLocale}${pathWithoutLocale}`);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-body text-charcoal/80 hover:text-gold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 rounded"
        aria-label="Change language"
        aria-expanded={isOpen}
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{languageNames[currentLocale]}</span>
        <span className="sm:hidden uppercase">{currentLocale}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-48 bg-white rounded-sm shadow-lg border border-charcoal/10 z-50 overflow-hidden"
            >
              {locales.map((locale) => (
                <button
                  key={locale}
                  onClick={() => switchLocale(locale)}
                  className={`w-full text-left px-4 py-3 text-sm font-body transition-colors duration-200 ${
                    currentLocale === locale
                      ? "bg-gold/10 text-gold font-medium"
                      : "text-charcoal/80 hover:bg-charcoal/5 hover:text-gold"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{languageNames[locale]}</span>
                    {currentLocale === locale && (
                      <span className="text-gold">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

