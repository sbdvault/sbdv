"use client";

import { useEffect } from "react";
import { Locale, rtlLocales } from "@/proxy";

export default function LocaleHtmlLang({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = rtlLocales.includes(locale) ? "rtl" : "ltr";
  }, [locale]);

  return null;
}
