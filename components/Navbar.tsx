"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useTranslations } from "@/hooks/useTranslations";
import LanguageSwitcher from "./LanguageSwitcher";
import Logo from "./Logo";

const privateClientLinks = [
  { key: "vault", href: "/vault-security", descKey: "nav.privateClients.vaultDesc" },
  { key: "wealth", href: "/wealth-investment", descKey: "nav.privateClients.wealthDesc" },
  { key: "services", href: "/services", descKey: "nav.privateClients.servicesDesc" },
  { key: "membership", href: "/membership", descKey: "nav.privateClients.membershipDesc" },
] as const;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [privateOpen, setPrivateOpen] = useState(false);
  const [mobilePrivateOpen, setMobilePrivateOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { t, locale } = useTranslations();
  const params = useParams();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPrivateOpen(false);
        setIsOpen(false);
      }
    };
    const onClick = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setPrivateOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  const getLocalizedHref = (href: string) => {
    const currentLocale = (params?.locale as string) || locale || "en";
    return `/${currentLocale}${href}`;
  };

  const isCurrent = (href: string) => {
    const localized = getLocalizedHref(href);
    return pathname === localized || pathname.startsWith(`${localized}/`);
  };

  const linkClass = (href: string) =>
    `font-body text-sm tracking-wide transition-colors duration-200 ${
      isCurrent(href) ? "text-charcoal" : "text-charcoal/75 hover:text-charcoal"
    }`;

  const underline = (href: string) =>
    `absolute left-0 -bottom-1 h-px bg-gold transition-all duration-300 ${
      isCurrent(href) ? "w-full" : "w-0 group-hover:w-full"
    }`;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || privateOpen || isOpen
          ? "bg-off-white/95 backdrop-blur-md border-b border-charcoal/10"
          : "bg-transparent"
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href={getLocalizedHref("/")} className="flex items-center space-x-3">
            <Logo height={52} className="shrink-0" priority />
            <span className="font-heading text-xl text-charcoal hidden sm:block">SBDV</span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            <Link href={getLocalizedHref("/about")} className={`relative group ${linkClass("/about")}`}>
              {t("nav.firm")}
              <span className={underline("/about")} />
            </Link>

            <div className="relative" ref={panelRef}>
              <button
                type="button"
                onClick={() => setPrivateOpen((open) => !open)}
                className={`relative group font-body text-sm tracking-wide ${
                  privateOpen || privateClientLinks.some((link) => isCurrent(link.href))
                    ? "text-charcoal"
                    : "text-charcoal/75 hover:text-charcoal"
                }`}
                aria-expanded={privateOpen}
                aria-controls="private-clients-panel"
              >
                {t("nav.privateClients.label")}
                <span
                  className={`absolute left-0 -bottom-1 h-px bg-gold transition-all duration-300 ${
                    privateOpen || privateClientLinks.some((link) => isCurrent(link.href))
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                  }`}
                />
              </button>
              {privateOpen && (
                <div
                  id="private-clients-panel"
                  className="absolute left-1/2 top-full mt-5 w-[22rem] -translate-x-1/2 border border-charcoal/10 bg-white shadow-sm"
                >
                  <p className="px-5 pt-4 pb-2 font-body text-[11px] uppercase tracking-[0.18em] text-charcoal/45">
                    {t("nav.privateClients.label")}
                  </p>
                  <ul>
                    {privateClientLinks.map((link) => (
                      <li key={link.key} className="border-t border-charcoal/10">
                        <Link
                          href={getLocalizedHref(link.href)}
                          onClick={() => setPrivateOpen(false)}
                          className="block px-5 py-3.5 hover:bg-off-white"
                        >
                          <span className="block font-heading text-sm text-charcoal">
                            {t(`nav.${link.key}`)}
                          </span>
                          <span className="mt-0.5 block font-body text-xs text-charcoal/55">
                            {t(link.descKey)}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <Link
              href={getLocalizedHref("/capital-access")}
              className={`relative group ${linkClass("/capital-access")}`}
            >
              {t("nav.capitalAccess")}
              <span className={underline("/capital-access")} />
            </Link>
            <Link href={getLocalizedHref("/contact")} className={`relative group ${linkClass("/contact")}`}>
              {t("nav.contact")}
              <span className={underline("/contact")} />
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-6">
            <Link
              href={getLocalizedHref("/login")}
              className="border-b border-gold pb-0.5 font-body text-sm tracking-wide text-charcoal transition-colors hover:text-gold"
            >
              {t("nav.signIn")}
            </Link>
            <LanguageSwitcher />
          </div>

          <div className="lg:hidden flex items-center gap-3">
            <Link
              href={getLocalizedHref("/login")}
              className="border-b border-gold pb-0.5 font-body text-xs tracking-wide text-charcoal"
            >
              {t("nav.signIn")}
            </Link>
            <LanguageSwitcher />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="rounded text-charcoal focus:outline-none focus:ring-2 focus:ring-gold"
              aria-label="Toggle menu"
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              <svg className="h-6 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {isOpen && (
          <div id="mobile-menu" className="border-t border-charcoal/10 pb-6 lg:hidden">
            <div className="flex flex-col pt-4">
              <Link
                href={getLocalizedHref("/about")}
                onClick={() => setIsOpen(false)}
                className="py-3 font-body text-sm text-charcoal"
              >
                {t("nav.firm")}
              </Link>
              <button
                type="button"
                onClick={() => setMobilePrivateOpen((open) => !open)}
                className="py-3 text-left font-body text-sm text-charcoal"
                aria-expanded={mobilePrivateOpen}
              >
                {t("nav.privateClients.label")}
              </button>
              {mobilePrivateOpen && (
                <div className="pb-2 pl-4">
                  {privateClientLinks.map((link) => (
                    <Link
                      key={link.key}
                      href={getLocalizedHref(link.href)}
                      onClick={() => setIsOpen(false)}
                      className="block py-2.5"
                    >
                      <span className="block font-body text-sm text-charcoal">{t(`nav.${link.key}`)}</span>
                      <span className="block font-body text-xs text-charcoal/50">{t(link.descKey)}</span>
                    </Link>
                  ))}
                </div>
              )}
              <Link
                href={getLocalizedHref("/capital-access")}
                onClick={() => setIsOpen(false)}
                className="py-3 font-body text-sm text-charcoal"
              >
                {t("nav.capitalAccess")}
              </Link>
              <Link
                href={getLocalizedHref("/contact")}
                onClick={() => setIsOpen(false)}
                className="py-3 font-body text-sm text-charcoal"
              >
                {t("nav.contact")}
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
