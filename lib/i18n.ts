import { Locale } from "@/proxy";
import en from "@/messages/en.json";
import de from "@/messages/de.json";
import fr from "@/messages/fr.json";
import it from "@/messages/it.json";
import nl from "@/messages/nl.json";
import es from "@/messages/es.json";
import pt from "@/messages/pt.json";
import ru from "@/messages/ru.json";
import zh from "@/messages/zh.json";
import ja from "@/messages/ja.json";
import ko from "@/messages/ko.json";
import ar from "@/messages/ar.json";

export const translations = {
  en,
  de,
  fr,
  it,
  nl,
  es,
  pt,
  ru,
  zh,
  ja,
  ko,
  ar,
} as const;

export type TranslationKey = keyof typeof en;

// Helper function to get nested translation
export function getNestedTranslation(
  obj: any,
  path: string
): string | undefined {
  return path.split(".").reduce((current, key) => current?.[key], obj);
}

// Main translation function
export function t(locale: Locale, key: string): string | string[] {
  const translation = translations[locale] ?? translations.en;
  const value = getNestedTranslation(translation, key);

  if (value === undefined || value === null) {
    const fallback = getNestedTranslation(translations.en, key);
    if (fallback === undefined || fallback === null) return key;
    return fallback;
  }

  return value;
}
