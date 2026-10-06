"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslations } from "@/hooks/useTranslations";

const principles = ["discretion", "precision", "security", "integrity"] as const;

export default function AboutContentSection() {
  const { t, locale } = useTranslations();
  const params = useParams();
  const currentLocale = (params?.locale as string) || locale || "en";
  const href = (path: string) => `/${currentLocale}${path}`;

  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="font-heading text-3xl text-charcoal">{t("about.whoTitle")}</h2>
          <p className="mt-5 font-body text-lg leading-relaxed text-charcoal/75">
            {t("about.whoText")}
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-px bg-charcoal/10 md:grid-cols-2">
          <article className="bg-white p-8">
            <p className="font-body text-[11px] uppercase tracking-[0.18em] text-gold">
              {t("about.practices.privateLabel")}
            </p>
            <h3 className="mt-3 font-heading text-2xl text-charcoal">
              {t("about.practices.privateTitle")}
            </h3>
            <p className="mt-4 font-body text-sm leading-relaxed text-charcoal/70">
              {t("about.practices.privateText")}
            </p>
            <div className="mt-6 flex flex-col gap-2 font-body text-sm">
              <Link href={href("/vault-security")} className="w-fit border-b border-gold/60 pb-0.5 text-charcoal hover:text-gold">
                {t("nav.vault")}
              </Link>
              <Link href={href("/wealth-investment")} className="w-fit border-b border-gold/60 pb-0.5 text-charcoal hover:text-gold">
                {t("nav.wealth")}
              </Link>
              <Link href={href("/membership")} className="w-fit border-b border-gold/60 pb-0.5 text-charcoal hover:text-gold">
                {t("nav.membership")}
              </Link>
            </div>
          </article>
          <article className="bg-white p-8">
            <p className="font-body text-[11px] uppercase tracking-[0.18em] text-gold">
              {t("about.practices.capitalLabel")}
            </p>
            <h3 className="mt-3 font-heading text-2xl text-charcoal">
              {t("about.practices.capitalTitle")}
            </h3>
            <p className="mt-4 font-body text-sm leading-relaxed text-charcoal/70">
              {t("about.practices.capitalText")}
            </p>
            <Link
              href={href("/capital-access")}
              className="mt-6 inline-block border-b border-gold/60 pb-0.5 font-body text-sm text-charcoal hover:text-gold"
            >
              {t("nav.capitalAccess")}
            </Link>
          </article>
        </div>

        <div className="mt-16">
          <h2 className="font-heading text-3xl text-charcoal">{t("about.serveTitle")}</h2>
          <ul className="mt-6 divide-y divide-charcoal/10 border-y border-charcoal/10">
            {(["investors", "offices", "enterprises"] as const).map((key) => (
              <li key={key} className="py-4 font-body text-charcoal/75">
                {t(`about.serve.${key}`)}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-16">
          <h2 className="font-heading text-3xl text-charcoal">{t("about.valuesTitle")}</h2>
          <dl className="mt-6 divide-y divide-charcoal/10 border-y border-charcoal/10">
            {principles.map((key) => (
              <div key={key} className="grid grid-cols-1 gap-2 py-5 sm:grid-cols-3">
                <dt className="font-heading text-charcoal">{t(`about.values.${key}.title`)}</dt>
                <dd className="font-body text-sm leading-relaxed text-charcoal/70 sm:col-span-2">
                  {t(`about.values.${key}.description`)}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-16">
          <h2 className="font-heading text-3xl text-charcoal">{t("about.identitySeatLabel")}</h2>
          <dl className="mt-6 divide-y divide-charcoal/10 border-y border-charcoal/10">
            <div className="grid grid-cols-1 gap-2 py-5 sm:grid-cols-3">
              <dt className="font-heading text-charcoal">{t("about.identityNameLabel")}</dt>
              <dd className="font-body text-sm text-charcoal/70 sm:col-span-2">
                {t("about.identityName")}
              </dd>
            </div>
            <div className="grid grid-cols-1 gap-2 py-5 sm:grid-cols-3">
              <dt className="font-heading text-charcoal">{t("about.identitySeatLabel")}</dt>
              <dd className="font-body text-sm leading-relaxed text-charcoal/70 sm:col-span-2">
                {t("footer.offices.zurich.address")}
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-16 flex flex-col gap-6 font-body text-sm sm:flex-row">
          <Link href={href("/membership")} className="border-b border-gold pb-0.5 text-charcoal hover:text-gold">
            {t("about.close.membership")}
          </Link>
          <Link href={href("/capital-access")} className="border-b border-gold pb-0.5 text-charcoal hover:text-gold">
            {t("about.close.capital")}
          </Link>
        </div>
      </div>
    </section>
  );
}
