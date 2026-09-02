"use client";

import { useEffect } from "react";
import { Locale } from "@/proxy";

export default function LocaleHtmlLang({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
