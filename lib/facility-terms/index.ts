import { facilityTermsArticles, type FacilityTermsArticle } from "../facility-terms";
import { articles as ar } from "./ar";
import { articles as de } from "./de";
import { articles as es } from "./es";
import { articles as fr } from "./fr";
import { articles as it } from "./it";
import { articles as ja } from "./ja";
import { articles as ko } from "./ko";
import { articles as nl } from "./nl";
import { articles as pt } from "./pt";
import { articles as ru } from "./ru";
import { articles as zh } from "./zh";

const byLocale: Record<string, FacilityTermsArticle[]> = {
  ar,
  de,
  es,
  fr,
  it,
  ja,
  ko,
  nl,
  pt,
  ru,
  zh,
};

export function getFacilityTermsArticles(locale: string): FacilityTermsArticle[] {
  return byLocale[locale] ?? facilityTermsArticles;
}
