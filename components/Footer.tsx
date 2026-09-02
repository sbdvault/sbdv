"use client";

import Link from "next/link";
import { useTranslations } from "@/hooks/useTranslations";
import { useParams } from "next/navigation";

const officeKeys = ["zurich", "dubai", "singapore", "newYork"] as const;

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { t, locale } = useTranslations();
  const params = useParams();

  const getLocalizedHref = (href: string) => {
    const currentLocale = (params?.locale as string) || locale || "en";
    return `/${currentLocale}${href}`;
  };

  const legalLinks = [
    { key: "privacy", href: "/privacy" },
    { key: "terms", href: "/terms" },
    { key: "regulatory", href: "/regulatory" },
    { key: "investorRelations", href: "/investor-relations" },
  ];

  return (
    <footer className="bg-charcoal text-off-white py-12" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          <div>
            <h3 className="font-heading font-semibold text-gold mb-4">
              {t("footer.headquarters")}
            </h3>
            <p className="font-body text-sm text-off-white/80 mb-1">
              {t("footer.offices.zurich.city")}
            </p>
            <p className="font-body text-sm text-off-white/60">
              {t("footer.offices.zurich.country")}
            </p>
          </div>

          <div>
            <h3 className="font-heading font-semibold text-gold mb-4">
              {t("footer.globalOffices")}
            </h3>
            <ul className="space-y-2">
              {officeKeys.map((key) => (
                <li key={key} className="font-body text-sm text-off-white/70">
                  {t(`footer.offices.${key}.country`)} — {t(`footer.offices.${key}.label`)}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-semibold text-gold mb-4">
              {t("footer.legal")}
            </h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.key}>
                  <Link
                    href={getLocalizedHref(link.href)}
                    className="font-body text-sm text-off-white/70 hover:text-gold transition-colors"
                  >
                    {t(`footer.${link.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-off-white/10 pt-8 text-center">
          <p className="font-body text-sm text-off-white/60">
            © {currentYear} {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
