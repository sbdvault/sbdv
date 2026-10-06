"use client";

import { useParams } from "next/navigation";
import { Locale } from "@/proxy";
import { t } from "@/lib/i18n";

export function useTranslations() {
  const params = useParams();
  const locale = (params?.locale as Locale) || "en";

  return {
    locale,
    t: (key: string): string => {
      const result = t(locale, key);
      return Array.isArray(result) ? result.join(", ") : result;
    },
    tArray: (key: string): string[] => {
      const result = t(locale, key);
      return Array.isArray(result) ? result : [result];
    },
  };
}

