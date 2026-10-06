# Multi-Language Support (i18n)

## Supported locales (12)

| Code | Language | Notes |
|------|----------|--------|
| `en` | English | Default |
| `de` | Deutsch | Swiss / DACH |
| `fr` | Français | Swiss / FR |
| `it` | Italiano | Swiss / IT |
| `nl` | Nederlands | |
| `es` | Español | |
| `pt` | Português | |
| `ru` | Русский | |
| `zh` | 中文 | Simplified Chinese |
| `ja` | 日本語 | |
| `ko` | 한국어 | |
| `ar` | العربية | RTL |

## URL structure

Pages are prefixed with the locale: `/en/contact`, `/de/contact`, `/ja/contact`, …

## How updates work

1. Edit `messages/en.json` as the source of truth.
2. Run `node scripts/sync-i18n.mjs` — fills missing keys and applies seeded translations from:
   - nav / hero / footer overrides in `scripts/sync-i18n.mjs`
   - homepage marketing sections in `scripts/i18n-home-overrides.mjs` (About, Vaults, Services, Swiss Standard, Global Access, Testimonials, CTA)
3. Translate remaining English strings in each `messages/{locale}.json` over time (deeper pages, portals, legal text).

When you switch language in the navbar, **every string that has a translation** updates. Strings not yet translated still show English until filled in.

## Wiring

- Locale list: `proxy.ts` (`locales`, `rtlLocales`)
- Language switcher: `components/LanguageSwitcher.tsx`
- Message imports: `lib/i18n.ts`
- Static params: `app/[locale]/layout.tsx`

Arabic sets `dir="rtl"` via `LocaleHtmlLang`.
