"use client";

import { useParams } from "next/navigation";
import { Locale } from "@/proxy";
import { t } from "@/lib/i18n";

export function useTranslations(forcedLocale?: string) {
  const params = useParams();
  const paramLocale = params?.locale;
  const locale = (forcedLocale ||
    (Array.isArray(paramLocale) ? paramLocale[0] : paramLocale) ||
    "en") as Locale;

  return {
    locale,
    t: (key: string): string => {
      const result = t(locale, key);
      if (typeof result === "string") return result;
      if (Array.isArray(result)) return result.join(", ");
      return key;
    },
    tArray: (key: string): string[] => {
      const result = t(locale, key);
      return Array.isArray(result) ? result : [String(result)];
    },
  };
}

