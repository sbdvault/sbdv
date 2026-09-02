/**
 * Merges missing keys from en.json into all locale files.
 * Existing translations are preserved; new keys fall back to English until translated.
 * Seeded overrides cover nav / hero / footer / homepage marketing sections.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { homeOverrides } from "./i18n-home-overrides.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const messagesDir = path.join(__dirname, "..", "messages");

const LOCALES = ["de", "fr", "it", "nl", "es", "pt", "ru", "zh", "ja", "ko", "ar"];

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

/** Always write source leaves onto target (used for locale seed overrides). */
function deepAssign(target, source) {
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      if (!target[key] || typeof target[key] !== "object") target[key] = {};
      deepAssign(target[key], source[key]);
    } else {
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
  de: {
    nav: {
      wealth: "Vermögen & Anlagen",
      clientLogin: "Kunden-Login",
    },
    hero: {
      headline: "Schweizer Sicherheit. Globales Vermögen.",
      subtext:
        "Diskrete Tresorkonservierung und Portfoliomanagement für Privatanleger, Family Offices und souveräne Kunden.",
      clientLogin: "Kunden-Login",
    },
    footer: {
      headquarters: "Hauptsitz",
      globalOffices: "Weltweite Büros",
      legal: "Rechtliches",
      privacy: "Datenschutz",
      terms: "Nutzungsbedingungen",
      regulatory: "Regulatorische Informationen",
      investorRelations: "Investor Relations",
      jurisdictionNote:
        "Schweizer Rechtsgrundlage. Multi-jurisdiktioneller Zugang für globale Kunden.",
    },
    home: {
      wealthTeaserTitle: "Vermögen & Anlagen",
      wealthTeaserDescription:
        "Mehr als Aufbewahrung — strategisches Portfoliomanagement, Anlageberatung und konsolidiertes Reporting über Ihr privates Kundenportal.",
      wealthTeaserButton: "Vermögensdienstleistungen entdecken",
      globalNetworkDescription:
        "Diskrete Betreuung von Kunden in den Finanzmetropolen der Welt mit Partner-Tresoren und globaler Logistik.",
    },
  },
  es: {
    nav: {
      wealth: "Patrimonio e Inversión",
      clientLogin: "Acceso Clientes",
    },
    hero: {
      headline: "Seguridad Suiza. Patrimonio Global.",
      subtext:
        "Custodia discreta y gestión de carteras para inversores privados, family offices y clientes soberanos.",
      clientLogin: "Acceso Clientes",
    },
    footer: {
      headquarters: "Sede Central",
      globalOffices: "Oficinas Globales",
      legal: "Legal",
      privacy: "Política de Privacidad",
      terms: "Términos de Servicio",
      regulatory: "Información Regulatoria",
      investorRelations: "Relaciones con Inversores",
      jurisdictionNote:
        "Base jurídica suiza. Accesibilidad multi-jurisdiccional para clientes globales.",
    },
    home: {
      wealthTeaserTitle: "Patrimonio e Inversión",
      wealthTeaserDescription:
        "Más allá de la custodia — gestión estratégica de carteras, asesoramiento de inversión e informes consolidados a través de su portal privado.",
      wealthTeaserButton: "Descubrir Servicios Patrimoniales",
      globalNetworkDescription:
        "Atendemos con discreción a clientes en las capitales financieras del mundo con bóvedas asociadas y logística global.",
    },
  },
  pt: {
    nav: {
      wealth: "Patrimônio e Investimentos",
      clientLogin: "Login do Cliente",
    },
    hero: {
      headline: "Segurança Suíça. Patrimônio Global.",
      subtext:
        "Custódia discreta e gestão de portfólio para investidores privados, family offices e clientes soberanos.",
      clientLogin: "Login do Cliente",
    },
    footer: {
      headquarters: "Sede",
      globalOffices: "Escritórios Globais",
      legal: "Jurídico",
      privacy: "Política de Privacidade",
      terms: "Termos de Serviço",
      regulatory: "Informações Regulatórias",
      investorRelations: "Relações com Investidores",
      jurisdictionNote:
        "Base jurídica suíça. Acessibilidade multi-jurisdicional para clientes globais.",
    },
    home: {
      wealthTeaserTitle: "Patrimônio e Investimentos",
      wealthTeaserDescription:
        "Além da custódia — gestão estratégica de portfólio, consultoria de investimentos e relatórios consolidados pelo seu portal privado.",
      wealthTeaserButton: "Explorar Serviços Patrimoniais",
      globalNetworkDescription:
        "Atendemos discretamente clientes nas capitais financeiras do mundo com cofres parceiros e logística global.",
    },
  },
  ru: {
    nav: {
      wealth: "Капитал и инвестиции",
      clientLogin: "Вход для клиентов",
    },
    hero: {
      headline: "Швейцарская безопасность. Глобальный капитал.",
      subtext:
        "Дискретное хранение в хранилищах и управление портфелем для частных инвесторов, family office и суверенных клиентов.",
      clientLogin: "Вход для клиентов",
    },
    footer: {
      headquarters: "Штаб-квартира",
      globalOffices: "Глобальные офисы",
      legal: "Правовая информация",
      privacy: "Политика конфиденциальности",
      terms: "Условия обслуживания",
      regulatory: "Регуляторная информация",
      investorRelations: "Отношения с инвесторами",
      jurisdictionNote:
        "Швейцарская правовая основа. Мульти-юрисдикционный доступ для глобальных клиентов.",
    },
    home: {
      wealthTeaserTitle: "Капитал и инвестиции",
      wealthTeaserDescription:
        "Больше чем хранение — стратегическое управление портфелем, инвестиционный консалтинг и консолидированная отчётность через ваш частный клиентский портал.",
      wealthTeaserButton: "Узнать об услугах управления капиталом",
      globalNetworkDescription:
        "Дискретное обслуживание клиентов в финансовых столицах мира с партнёрскими хранилищами и глобальной логистикой.",
    },
  },
  zh: {
    nav: {
      wealth: "财富与投资",
      clientLogin: "客户登录",
    },
    hero: {
      headline: "瑞士安全。全球财富。",
      subtext: "为私人投资者、家族办公室及主权客户提供私密金库托管与投资组合管理。",
      clientLogin: "客户登录",
    },
    footer: {
      headquarters: "总部",
      globalOffices: "全球办事处",
      legal: "法律",
      privacy: "隐私政策",
      terms: "服务条款",
      regulatory: "监管信息",
      investorRelations: "投资者关系",
      jurisdictionNote: "瑞士法律基础。为全球客户提供多司法管辖区访问。",
    },
    home: {
      wealthTeaserTitle: "财富与投资",
      wealthTeaserDescription:
        "不止于托管——通过您的私人客户门户提供战略投资组合管理、投资顾问与综合报告。",
      wealthTeaserButton: "了解财富服务",
      globalNetworkDescription:
        "通过合作金库与全球物流，为世界金融中心的客户提供私密服务。",
    },
  },
  ja: {
    nav: {
      wealth: "資産運用・投資",
      clientLogin: "クライアントログイン",
    },
    hero: {
      headline: "スイスの安全性。グローバルな資産。",
      subtext:
        "個人投資家、ファミリーオフィス、ソブリン顧客向けの機密性の高い保管庫カストディとポートフォリオ管理。",
      clientLogin: "クライアントログイン",
    },
    footer: {
      headquarters: "本社",
      globalOffices: "グローバルオフィス",
      legal: "法務",
      privacy: "プライバシーポリシー",
      terms: "利用規約",
      regulatory: "規制情報",
      investorRelations: "投資家向け情報",
      jurisdictionNote:
        "スイス法基盤。グローバル顧客のための多法域アクセス。",
    },
    home: {
      wealthTeaserTitle: "資産運用・投資",
      wealthTeaserDescription:
        "保管を超えて——プライベートクライアントポータルを通じた戦略的ポートフォリオ管理、投資助言、統合レポーティング。",
      wealthTeaserButton: "資産運用サービスを見る",
      globalNetworkDescription:
        "提携保管庫とグローバル物流により、世界の金融都市のお客様に機密性の高いサービスを提供します。",
    },
  },
  ko: {
    nav: {
      wealth: "자산 및 투자",
      clientLogin: "고객 로그인",
    },
    hero: {
      headline: "스위스 안보. 글로벌 자산.",
      subtext:
        "개인 투자자, 패밀리 오피스 및 소버린 고객을 위한 비공개 금고 보관과 포트폴리오 관리.",
      clientLogin: "고객 로그인",
    },
    footer: {
      headquarters: "본사",
      globalOffices: "글로벌 오피스",
      legal: "법률",
      privacy: "개인정보 처리방침",
      terms: "서비스 약관",
      regulatory: "규제 정보",
      investorRelations: "투자자 관계",
      jurisdictionNote:
        "스위스 법적 기반. 글로벌 고객을 위한 다관할권 접근성.",
    },
    home: {
      wealthTeaserTitle: "자산 및 투자",
      wealthTeaserDescription:
        "보관 그 이상 — 프라이빗 고객 포털을 통한 전략적 포트폴리오 관리, 투자 자문 및 통합 리포팅.",
      wealthTeaserButton: "자산 서비스 알아보기",
      globalNetworkDescription:
        "파트너 금고와 글로벌 물류로 세계 금융 수도의 고객에게 비공개 서비스를 제공합니다.",
    },
  },
  ar: {
    nav: {
      wealth: "الثروة والاستثمار",
      clientLogin: "دخول العملاء",
    },
    hero: {
      headline: "أمان سويسري. ثروة عالمية.",
      subtext:
        "حفظ آمن سري وإدارة محافظ للمستثمرين من الأفراد ومكاتب العائلات والعملاء السياديين.",
      clientLogin: "دخول العملاء",
    },
    footer: {
      headquarters: "المقر الرئيسي",
      globalOffices: "المكاتب العالمية",
      legal: "قانوني",
      privacy: "سياسة الخصوصية",
      terms: "شروط الخدمة",
      regulatory: "المعلومات التنظيمية",
      investorRelations: "علاقات المستثمرين",
      jurisdictionNote:
        "أساس قانوني سويسري. إمكانية الوصول عبر ولايات قضائية متعددة للعملاء العالميين.",
    },
    home: {
      wealthTeaserTitle: "الثروة والاستثمار",
      wealthTeaserDescription:
        "أكثر من الحفظ — إدارة محافظ استراتيجية واستشارات استثمارية وتقارير موحّدة عبر بوابة العميل الخاصة.",
      wealthTeaserButton: "اكتشف خدمات الثروة",
      globalNetworkDescription:
        "نخدم العملاء بسرية في العواصم المالية العالمية عبر خزائن شريكة ولوجستيات عالمية.",
    },
  },
};

for (const locale of LOCALES) {
  const filePath = path.join(messagesDir, `${locale}.json`);
  const existing = fs.existsSync(filePath)
    ? JSON.parse(fs.readFileSync(filePath, "utf8"))
    : {};
  // Start from existing translations, fill any missing keys from English
  const merged = deepMerge(structuredClone(existing), structuredClone(en));
  if (overrides[locale]) {
    deepAssign(merged, overrides[locale]);
  }
  if (homeOverrides[locale]) {
    deepAssign(merged, homeOverrides[locale]);
  }
  fs.writeFileSync(filePath, JSON.stringify(merged, null, 2) + "\n");
  console.log(`Updated ${locale}.json`);
}
