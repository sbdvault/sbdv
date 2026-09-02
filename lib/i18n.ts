import { Locale } from "@/proxy";
import en from "@/messages/en.json";
import nl from "@/messages/nl.json";
import fr from "@/messages/fr.json";
import it from "@/messages/it.json";

export const translations = {
  en,
  nl,
  fr,
  it,
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
  const translation = translations[locale];
  const value = getNestedTranslation(translation, key);

  if (value === undefined || value === null) {
    const fallback = getNestedTranslation(translations.en, key);
    if (fallback === undefined || fallback === null) return key;
    return fallback;
  }

  return value;
}

