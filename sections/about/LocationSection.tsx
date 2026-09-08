"use client";

import { useTranslations } from "@/hooks/useTranslations";

const offices = ["zurich", "dubai", "singapore", "newYork"] as const;

export default function LocationSection() {
  const { t } = useTranslations();

  return (
    <section className="bg-off-white py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 className="font-heading text-3xl text-charcoal">{t("about.locationTitle")}</h2>
        <p className="mt-5 max-w-2xl font-body text-lg leading-relaxed text-charcoal/70">
          {t("about.locationDescription")}
        </p>
        <dl className="mt-10 divide-y divide-charcoal/10 border-y border-charcoal/10">
          {offices.map((key) => (
            <div key={key} className="grid grid-cols-1 gap-2 py-5 sm:grid-cols-3">
              <dt className="font-heading text-charcoal">
                {t(`footer.offices.${key}.city`)}
                <span className="mt-1 block font-body text-xs font-normal text-charcoal/45">
                  {t(`footer.offices.${key}.label`)}
                </span>
              </dt>
              <dd className="font-body text-sm leading-relaxed text-charcoal/70 sm:col-span-2">
                {t(`footer.offices.${key}.address`)}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
