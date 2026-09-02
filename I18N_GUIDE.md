# Multi-Language Support (i18n) Implementation Guide

## Overview
The SBDV website now supports **4 languages**:
- 🇬🇧 English (en) - Default
- 🇳🇱 Dutch (nl)
- 🇫🇷 French (fr)
- 🇮🇹 Italian (it)

## How It Works

### 1. **URL Structure**
All pages are now prefixed with a locale code:
- English: `/en/`, `/en/about`, `/en/contact`, etc.
- Dutch: `/nl/`, `/nl/about`, `/nl/contact`, etc.
- French: `/fr/`, `/fr/about`, `/fr/contact`, etc.
- Italian: `/it/`, `/it/about`, `/it/contact`, etc.

### 2. **Automatic Locale Detection**
The middleware automatically:
- Detects the user's preferred language from browser settings
- Checks for a saved language preference in cookies
- Redirects to the appropriate locale-prefixed URL
- Falls back to English if no preference is found

### 3. **Language Switcher**
A language switcher component is available in the navbar:
- Desktop: Shows full language name (e.g., "English", "Nederlands")
- Mobile: Shows language code (e.g., "EN", "NL")
- Clicking switches to the selected language while maintaining the current page

### 4. **Translation Files**
All translations are stored in `/messages/`:
- `en.json` - English translations
- `nl.json` - Dutch translations
- `fr.json` - French translations
- `it.json` - Italian translations

### 5. **Using Translations in Components**

#### For Client Components:
```tsx
"use client";
import { useTranslations } from "@/hooks/useTranslations";

export default function MyComponent() {
  const { t } = useTranslations();
  
  return <h1>{t("hero.headline")}</h1>;
}
```

#### For Server Components:
```tsx
import { Locale } from "@/middleware";
import { t } from "@/lib/i18n";

export default function MyComponent({ params }: { params: { locale: Locale } }) {
  const text = t(params.locale, "hero.headline");
  return <h1>{text}</h1>;
}
```

## Current Translation Coverage

### ✅ Fully Translated:
- Navigation menu
- Footer
- Hero section (basic)
- Page titles and descriptions

### ⚠️ Partially Translated:
- Most section content still needs translation keys added
- Form labels and placeholders
- Button text

### 📝 To Add More Translations:

1. **Add keys to translation files** (`/messages/*.json`):
```json
{
  "section": {
    "title": "Section Title",
    "description": "Section description text"
  }
}
```

2. **Update components** to use translations:
```tsx
const { t } = useTranslations();
<h2>{t("section.title")}</h2>
```

## File Structure

```
sbdv-site/
├── middleware.ts              # Locale detection & routing
├── messages/                  # Translation files
│   ├── en.json
│   ├── nl.json
│   ├── fr.json
│   └── it.json
├── lib/
│   └── i18n.ts                # Translation utilities
├── hooks/
│   └── useTranslations.ts     # React hook for translations
├── components/
│   └── LanguageSwitcher.tsx   # Language selector component
└── app/
    └── [locale]/              # Locale-based routing
        ├── layout.tsx
        ├── page.tsx
        ├── about/
        ├── vault-security/
        ├── services/
        ├── membership/
        └── contact/
```

## Testing

1. **Start the dev server**: `npm run dev`
2. **Visit**: `http://localhost:3000`
3. **You'll be redirected** to `/en/` (or your browser's preferred language)
4. **Use the language switcher** in the navbar to change languages
5. **Navigate between pages** - the locale is preserved

## Next Steps

To complete the translation coverage:

1. **Add translation keys** for all text content in sections
2. **Update section components** to use the `useTranslations` hook
3. **Translate form labels** and validation messages
4. **Add SEO metadata** translations for each locale
5. **Test all pages** in all languages

## Notes

- The old pages in `/app/about/`, `/app/contact/`, etc. are still there but will be ignored by the middleware
- The middleware redirects all non-locale-prefixed routes to the appropriate locale
- Language preference is saved in cookies for future visits
- All API routes (`/api/*`) are excluded from locale routing

