/**
 * Merges missing keys from en.json into nl, fr, it locale files.
 * Existing translations are preserved; new keys fall back to English until translated.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const messagesDir = path.join(__dirname, "..", "messages");

function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else if (target[key] === undefined) {
      target[key] = source[key];
    }
  }
  return target;
}

const en = JSON.parse(fs.readFileSync(path.join(messagesDir, "en.json"), "utf8"));

const overrides = {
  nl: {
    nav: {
      wealth: "Vermogen & Beleggen",
      clientLogin: "Klant Login",
    },
    hero: {
      headline: "Zwitserse Veiligheid. Wereldwijd Vermogen.",
      subtext:
        "Discrete kluisopslag en portfoliobeheer voor particuliere investeerders, family offices en soevereine cliënten.",
      clientLogin: "Klant Login",
    },
    footer: {
      headquarters: "Hoofdkantoor",
      globalOffices: "Wereldwijde Kantoren",
      legal: "Juridisch",
      privacy: "Privacybeleid",
      terms: "Servicevoorwaarden",
      regulatory: "Regelgevingsinformatie",
      investorRelations: "Investeerdersrelaties",
      jurisdictionNote:
        "Zwitserse juridische basis. Multi-jurisdictionele toegankelijkheid voor wereldwijde cliënten.",
    },
    home: {
      wealthTeaserTitle: "Vermogen & Beleggen",
      wealthTeaserDescription:
        "Meer dan alleen opslag — strategisch portfoliobeheer, beleggingsadvies en geconsolideerde rapportage via uw private klantportaal.",
      wealthTeaserButton: "Ontdek Vermogensdiensten",
      globalNetworkDescription:
        "Discreet cliënten bedienen in de financiële hoofdsteden van de wereld met partnerkluizen en wereldwijde logistiek.",
    },
  },
  fr: {
    nav: {
      wealth: "Patrimoine & Investissement",
      clientLogin: "Connexion Client",
    },
    hero: {
      headline: "Sécurité Suisse. Patrimoine Mondial.",
      subtext:
        "Conservation discrète et gestion de portefeuille pour investisseurs privés, family offices et clients souverains.",
      clientLogin: "Connexion Client",
    },
    footer: {
      headquarters: "Siège Social",
      globalOffices: "Bureaux Mondiaux",
      legal: "Juridique",
      privacy: "Politique de Confidentialité",
      terms: "Conditions de Service",
      regulatory: "Informations Réglementaires",
      investorRelations: "Relations Investisseurs",
      jurisdictionNote:
        "Fondation juridique suisse. Accessibilité multi-juridictionnelle pour les clients mondiaux.",
    },
    home: {
      wealthTeaserTitle: "Patrimoine & Investissement",
      wealthTeaserDescription:
        "Au-delà de la conservation — gestion stratégique de portefeuille, conseil en investissement et reporting consolidé via votre portail client privé.",
      wealthTeaserButton: "Découvrir nos Services Patrimoniaux",
      globalNetworkDescription:
        "Servir discrètement les clients dans les capitales financières mondiales avec des coffres partenaires et une logistique sécurisée.",
    },
  },
  it: {
    nav: {
      wealth: "Patrimonio & Investimenti",
      clientLogin: "Accesso Clienti",
    },
    hero: {
      headline: "Sicurezza Svizzera. Patrimonio Globale.",
      subtext:
        "Custodia discreta e gestione del portafoglio per investitori privati, family office e clienti sovrani.",
      clientLogin: "Accesso Clienti",
    },
    footer: {
      headquarters: "Sede Centrale",
      globalOffices: "Uffici Globali",
      legal: "Legale",
      privacy: "Informativa sulla Privacy",
      terms: "Termini di Servizio",
      regulatory: "Informativa Regolamentare",
      investorRelations: "Relazioni con gli Investitori",
      jurisdictionNote:
        "Fondamento giuridico svizzero. Accessibilità multi-giurisdizionale per clienti globali.",
    },
    home: {
      wealthTeaserTitle: "Patrimonio & Investimenti",
      wealthTeaserDescription:
        "Oltre la custodia — gestione strategica del portafoglio, consulenza agli investimenti e reporting consolidato tramite il portale clienti privato.",
      wealthTeaserButton: "Esplora i Servizi Patrimoniali",
      globalNetworkDescription:
        "Serviamo discretamente i clienti nelle capitali finanziarie mondiali con caveau partner e logistica sicura.",
    },
  },
};

for (const locale of ["nl", "fr", "it"]) {
  const filePath = path.join(messagesDir, `${locale}.json`);
  const existing = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const merged = deepMerge({ ...existing }, en);
  deepMerge(merged, overrides[locale]);
  fs.writeFileSync(filePath, JSON.stringify(merged, null, 2) + "\n");
  console.log(`Updated ${locale}.json`);
}
