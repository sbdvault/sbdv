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

/** Brand-narrative namespaces: always refresh from en.json (English fallback OK). */
const BRAND_FORCE_FROM_EN = [
  "hero",
  "cta",
  "about",
  "vault",
  "services",
  "wealth",
  "membership",
];

const dualHero = {
  nl: {
    headline: "Zwitserse Veiligheid. Gedisciplineerde Groei.",
    subtext:
      "Behoud privévermogen in Zwitserse custody — en help gekwalificeerde ondernemingen groeien met stressvrije, mandate-aligned capital.",
    exploreCapital: "Ontdek Capital Access",
    privateClients: "Private Client Toegang",
    clientLogin: "Klant Login",
  },
  fr: {
    headline: "Sécurité Suisse. Croissance Disciplinée.",
    subtext:
      "Préservez la fortune privée sous custody suisse — et aidez les entreprises qualifiées à croître avec un capital structuré, sans stress.",
    exploreCapital: "Explorer Capital Access",
    privateClients: "Accès Clients Privés",
    clientLogin: "Connexion Client",
  },
  it: {
    headline: "Sicurezza Svizzera. Crescita Disciplinata.",
    subtext:
      "Preservate la ricchezza privata con custody svizzera — e aiutate le imprese qualificate a crescere con capitale strutturato, senza stress.",
    exploreCapital: "Esplora Capital Access",
    privateClients: "Accesso Clienti Privati",
    clientLogin: "Accesso Clienti",
  },
  de: {
    headline: "Schweizer Sicherheit. Diszipliniertes Wachstum.",
    subtext:
      "Privates Vermögen mit Schweizer Custody bewahren — und qualifizierten Unternehmen stressfreies, mandate-aligned Kapital ermöglichen.",
    exploreCapital: "Capital Access entdecken",
    privateClients: "Private-Client-Zugang",
    clientLogin: "Kunden-Login",
  },
  es: {
    headline: "Seguridad Suiza. Crecimiento Disciplinado.",
    subtext:
      "Preserve patrimonio privado con custody suiza — y ayude a empresas cualificadas a crecer con capital estructurado, sin estrés.",
    exploreCapital: "Explorar Capital Access",
    privateClients: "Acceso Clientes Privados",
    clientLogin: "Acceso Clientes",
  },
  pt: {
    headline: "Segurança Suíça. Crescimento Disciplinado.",
    subtext:
      "Preserve património privado com custody suíça — e ajude empresas qualificadas a crescer com capital estruturado, sem stress.",
    exploreCapital: "Explorar Capital Access",
    privateClients: "Acesso Clientes Privados",
    clientLogin: "Login do Cliente",
  },
  ru: {
    headline: "Швейцарская безопасность. Дисциплинированный рост.",
    subtext:
      "Сохраняйте частное состояние в швейцарском custody — и помогайте квалифицированным компаниям расти со структурированным капиталом без стресса.",
    exploreCapital: "Изучить Capital Access",
    privateClients: "Доступ для частных клиентов",
    clientLogin: "Вход для клиентов",
  },
  zh: {
    headline: "瑞士安全。稳健增长。",
    subtext:
      "以瑞士托管保全私人财富——并以透明、低压力的结构化资本助力合格企业成长。",
    exploreCapital: "了解 Capital Access",
    privateClients: "私人客户通道",
    clientLogin: "客户登录",
  },
  ja: {
    headline: "スイスの安全性。規律ある成長。",
    subtext:
      "スイスのカストディでプライベート資産を保全し、適格企業にはストレスの少ない構造化キャピタルで成長を支援します。",
    exploreCapital: "Capital Access を見る",
    privateClients: "プライベートクライアント",
    clientLogin: "クライアントログイン",
  },
  ko: {
    headline: "스위스 안보. 규율 있는 성장.",
    subtext:
      "스위스 커스터디로 프라이빗 자산을 지키고, 적격 기업에는 스트레스 없는 구조화 자본으로 성장을 돕습니다.",
    exploreCapital: "Capital Access 살펴보기",
    privateClients: "프라이빗 클라이언트 접근",
    clientLogin: "고객 로그인",
  },
  ar: {
    headline: "أمان سويسري. نمو منضبط.",
    subtext:
      "احفظ الثروة الخاصة بحفظ سويسري — وساعد الشركات المؤهلة على النمو برأس مال منظم بلا ضغوط.",
    exploreCapital: "استكشف Capital Access",
    privateClients: "وصول العملاء الخاصين",
    clientLogin: "دخول العملاء",
  },
};

const dualCta = {
  nl: {
    title: "Twee paden. Eén Zwitserse standaard.",
    subtitle:
      "Privé-custody voor vermogen dat stil moet blijven — of gestructureerd kapitaal voor ondernemingen die met helderheid willen groeien.",
    capitalButton: "Ontdek Capital Access",
    privateButton: "Private Client Toegang",
  },
  fr: {
    title: "Deux chemins. Une norme suisse.",
    subtitle:
      "Custody privée pour une fortune qui doit rester discrète — ou capital structuré pour les entreprises prêtes à croître avec clarté.",
    capitalButton: "Explorer Capital Access",
    privateButton: "Accès Clients Privés",
  },
  it: {
    title: "Due percorsi. Uno standard svizzero.",
    subtitle:
      "Custody privata per ricchezza che deve restare silenziosa — o capitale strutturato per imprese pronte a crescere con chiarezza.",
    capitalButton: "Esplora Capital Access",
    privateButton: "Accesso Clienti Privati",
  },
  de: {
    title: "Zwei Wege. Ein Schweizer Standard.",
    subtitle:
      "Private Custody für Vermögen, das still bleiben muss — oder strukturiertes Kapital für Unternehmen, die mit Klarheit wachsen wollen.",
    capitalButton: "Capital Access entdecken",
    privateButton: "Private-Client-Zugang",
  },
  es: {
    title: "Dos caminos. Un estándar suizo.",
    subtitle:
      "Custody privada para patrimonio que debe permanecer discreto — o capital estructurado para empresas listas para crecer con claridad.",
    capitalButton: "Explorar Capital Access",
    privateButton: "Acceso Clientes Privados",
  },
  pt: {
    title: "Dois caminhos. Um padrão suíço.",
    subtitle:
      "Custody privada para património que deve permanecer discreto — ou capital estruturado para empresas prontas a crescer com clareza.",
    capitalButton: "Explorar Capital Access",
    privateButton: "Acesso Clientes Privados",
  },
  ru: {
    title: "Два пути. Один швейцарский стандарт.",
    subtitle:
      "Частный custody для капитала, который должен оставаться тихим — или структурированный капитал для компаний, готовых расти с ясностью.",
    capitalButton: "Изучить Capital Access",
    privateButton: "Доступ для частных клиентов",
  },
  zh: {
    title: "两条路径。同一瑞士标准。",
    subtitle:
      "需要静默保全的私人托管——或为寻求清晰增长的企业提供结构化资本。",
    capitalButton: "了解 Capital Access",
    privateButton: "私人客户通道",
  },
  ja: {
    title: "二つの道。一つのスイス基準。",
    subtitle:
      "静かに守るべき資産のためのプライベートカストディ——または明確さをもって成長する企業向けの構造化キャピタル。",
    capitalButton: "Capital Access を見る",
    privateButton: "プライベートクライアント",
  },
  ko: {
    title: "두 길. 하나의 스위스 기준.",
    subtitle:
      "조용히 지켜야 할 자산을 위한 프라이빗 커스터디 — 또는 명확하게 성장하려는 기업을 위한 구조화 자본.",
    capitalButton: "Capital Access 살펴보기",
    privateButton: "프라이빗 클라이언트 접근",
  },
  ar: {
    title: "مساران. معيار سويسري واحد.",
    subtitle:
      "حفظ خاص لثروة يجب أن تبقى هادئة — أو رأس مال منظم للشركات المستعدة للنمو بوضوح.",
    capitalButton: "استكشف Capital Access",
    privateButton: "وصول العملاء الخاصين",
  },
};

const dualCapitalTeaser = {
  nl: {
    capitalTeaserTitle: "Kapitaal waarmee ondernemingen groeien",
    capitalTeaserDescription:
      "Het Capital Access Program verbindt gekwalificeerde bedrijven met mandate-aligned pools — transparante voorwaarden, Zwitsers toezicht en een begeleid pad van aanvraag tot facility.",
    capitalTeaserButton: "Ontdek Capital Access",
    capitalTeaserPoints: {
      structure: "Duidelijke structuur",
      structureDesc: "Bedrag, looptijd en aflossing vast vóór u committeert.",
      oversight: "Zwitsers toezicht",
      oversightDesc: "Gedocumenteerde KYC, UBO look-through en discretionaire review.",
      portal: "Partnerportaal",
      portalDesc: "Volg aanvragen, deposits en terugbetaling op één plek.",
    },
  },
  fr: {
    capitalTeaserTitle: "Un capital qui fait croître les entreprises",
    capitalTeaserDescription:
      "Le Capital Access Program relie les entreprises qualifiées à des pools alignés sur le mandat — termes transparents, supervision suisse et parcours guidé de la demande à la facility.",
    capitalTeaserButton: "Explorer Capital Access",
    capitalTeaserPoints: {
      structure: "Structure claire",
      structureDesc: "Montant, durée et remboursement définis avant engagement.",
      oversight: "Supervision suisse",
      oversightDesc: "KYC documenté, look-through UBO et revue discrétionnaire.",
      portal: "Portail partenaire",
      portalDesc: "Suivez demandes, dépôts et remboursements en un seul endroit.",
    },
  },
  it: {
    capitalTeaserTitle: "Capitale che fa crescere le imprese",
    capitalTeaserDescription:
      "Il Capital Access Program collega imprese qualificate a pool allineati al mandato — termini trasparenti, oversight svizzero e un percorso guidato dalla domanda alla facility.",
    capitalTeaserButton: "Esplora Capital Access",
    capitalTeaserPoints: {
      structure: "Struttura chiara",
      structureDesc: "Importo, durata e rimborso definiti prima dell’impegno.",
      oversight: "Oversight svizzero",
      oversightDesc: "KYC documentato, look-through UBO e review discrezionale.",
      portal: "Portale partner",
      portalDesc: "Monitorate domande, depositi e rimborsi in un unico luogo.",
    },
  },
  de: {
    capitalTeaserTitle: "Kapital, mit dem Unternehmen wachsen",
    capitalTeaserDescription:
      "Das Capital Access Program verbindet qualifizierte Unternehmen mit mandate-aligned Pools — transparente Konditionen, Schweizer Oversight und ein geführter Weg vom Antrag bis zur Facility.",
    capitalTeaserButton: "Capital Access entdecken",
    capitalTeaserPoints: {
      structure: "Klare Struktur",
      structureDesc: "Betrag, Laufzeit und Rückzahlung vor dem Commitment definiert.",
      oversight: "Schweizer Oversight",
      oversightDesc: "Dokumentierte KYC, UBO-Look-through und diskretionäre Prüfung.",
      portal: "Partnerportal",
      portalDesc: "Anträge, Einlagen und Rückzahlung an einem Ort verfolgen.",
    },
  },
  es: {
    capitalTeaserTitle: "Capital que hace crecer a las empresas",
    capitalTeaserDescription:
      "El Capital Access Program conecta empresas cualificadas con pools alineados al mandato — términos transparentes, supervisión suiza y un camino guiado de la solicitud a la facility.",
    capitalTeaserButton: "Explorar Capital Access",
    capitalTeaserPoints: {
      structure: "Estructura clara",
      structureDesc: "Importe, plazo y reembolso definidos antes de comprometerse.",
      oversight: "Supervisión suiza",
      oversightDesc: "KYC documentado, look-through UBO y revisión discrecional.",
      portal: "Portal de partners",
      portalDesc: "Siga solicitudes, depósitos y reembolsos en un solo lugar.",
    },
  },
  pt: {
    capitalTeaserTitle: "Capital que faz empresas crescerem",
    capitalTeaserDescription:
      "O Capital Access Program liga empresas qualificadas a pools alinhados ao mandato — termos transparentes, supervisão suíça e um caminho guiado do pedido à facility.",
    capitalTeaserButton: "Explorar Capital Access",
    capitalTeaserPoints: {
      structure: "Estrutura clara",
      structureDesc: "Montante, prazo e reembolso definidos antes do compromisso.",
      oversight: "Supervisão suíça",
      oversightDesc: "KYC documentado, look-through UBO e revisão discricionária.",
      portal: "Portal de parceiros",
      portalDesc: "Acompanhe pedidos, depósitos e reembolsos num só lugar.",
    },
  },
  ru: {
    capitalTeaserTitle: "Капитал, с которым растут компании",
    capitalTeaserDescription:
      "Capital Access Program связывает квалифицированные компании с пулами, согласованными с мандатом — прозрачные условия, швейцарский oversight и понятный путь от заявки до facility.",
    capitalTeaserButton: "Изучить Capital Access",
    capitalTeaserPoints: {
      structure: "Ясная структура",
      structureDesc: "Сумма, срок и погашение определены до обязательств.",
      oversight: "Швейцарский oversight",
      oversightDesc: "Документированный KYC, UBO look-through и дискреционный review.",
      portal: "Партнёрский портал",
      portalDesc: "Отслеживайте заявки, депозиты и погашение в одном месте.",
    },
  },
  zh: {
    capitalTeaserTitle: "助力企业成长的资本",
    capitalTeaserDescription:
      "Capital Access Program 将合格企业与符合授权的资金池连接——条款透明、瑞士监督，从申请到设施全程有指引。",
    capitalTeaserButton: "了解 Capital Access",
    capitalTeaserPoints: {
      structure: "结构清晰",
      structureDesc: "承诺前明确金额、期限与还款。",
      oversight: "瑞士监督",
      oversightDesc: "文件化 KYC、UBO 穿透与酌情审查。",
      portal: "合作伙伴门户",
      portalDesc: "在一处跟踪申请、保证金与还款。",
    },
  },
  ja: {
    capitalTeaserTitle: "企業が成長するためのキャピタル",
    capitalTeaserDescription:
      "Capital Access Program は適格企業とマンデート整合のプールをつなぎます — 透明な条件、スイスの監督、申請からファシリティまでの案内付きプロセス。",
    capitalTeaserButton: "Capital Access を見る",
    capitalTeaserPoints: {
      structure: "明確な構造",
      structureDesc: "コミット前に金額・期間・返済を定義。",
      oversight: "スイスの監督",
      oversightDesc: "文書化された KYC、UBO ルックスルー、裁量レビュー。",
      portal: "パートナーポータル",
      portalDesc: "申請・デポジット・返済を一箇所で追跡。",
    },
  },
  ko: {
    capitalTeaserTitle: "기업이 성장하는 자본",
    capitalTeaserDescription:
      "Capital Access Program은 적격 기업을 만데이트에 맞는 풀과 연결합니다 — 투명한 조건, 스위스 감독, 신청부터 시설까지 안내된 경로.",
    capitalTeaserButton: "Capital Access 살펴보기",
    capitalTeaserPoints: {
      structure: "명확한 구조",
      structureDesc: "약정 전에 금액·기간·상환을 정의합니다.",
      oversight: "스위스 감독",
      oversightDesc: "문서화된 KYC, UBO 룩스루, 재량 심사.",
      portal: "파트너 포털",
      portalDesc: "신청·예치·상환을 한곳에서 추적합니다.",
    },
  },
  ar: {
    capitalTeaserTitle: "رأس مال يُنمّي الشركات",
    capitalTeaserDescription:
      "يربط برنامج Capital Access الشركات المؤهلة بمجموعات رأس مال متوافقة مع التفويض — شروط شفافة وإشراف سويسري ومسار مُوجَّه من الطلب إلى التسهيل.",
    capitalTeaserButton: "استكشف Capital Access",
    capitalTeaserPoints: {
      structure: "هيكل واضح",
      structureDesc: "يُحدد المبلغ والأجل والسداد قبل الالتزام.",
      oversight: "إشراف سويسري",
      oversightDesc: "KYC موثّق وفحص UBO ومراجعة تقديرية.",
      portal: "بوابة الشركاء",
      portalDesc: "تتبّع الطلبات والودائع والسداد في مكان واحد.",
    },
  },
};

const overrides = {
  nl: {
    nav: {
      wealth: "Vermogen & Beleggen",
      clientLogin: "Klant Login",
      privateClients: {
        label: "Private Clients",
        vaultDesc: "Zwitserse custody en stille bescherming",
        wealthDesc: "Stewardship en rapportage",
        servicesDesc: "Leasing, viewing en operations",
        membershipDesc: "Pad naar het huis",
      },
    },
    hero: dualHero.nl,
    cta: dualCta.nl,
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
      ...dualCapitalTeaser.nl,
      wealthTeaserTitle: "Vermogensstewardship, geen lawaai",
      wealthTeaserDescription:
        "Voor private clients: portfoliomandaten, edelmetaalstrategie en geconsolideerde rapportage — geïntegreerd met Zwitserse custody via uw private portaal.",
      wealthTeaserButton: "Ontdek Vermogensdiensten",
      globalNetworkDescription:
        "Discreet cliënten bedienen in de financiële hoofdsteden van de wereld met partnerkluizen en wereldwijde logistiek.",
    },
  },
  fr: {
    nav: {
      wealth: "Patrimoine & Investissement",
      clientLogin: "Connexion Client",
      privateClients: {
        label: "Clients Privés",
        vaultDesc: "Custody suisse et protection discrète",
        wealthDesc: "Stewardship et reporting",
        servicesDesc: "Location, viewing et opérations",
        membershipDesc: "Le chemin vers la maison",
      },
    },
    hero: dualHero.fr,
    cta: dualCta.fr,
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
      ...dualCapitalTeaser.fr,
      wealthTeaserTitle: "Stewardship patrimonial, sans bruit",
      wealthTeaserDescription:
        "Pour les clients privés : mandats de portefeuille, stratégie métaux et reporting consolidé — intégrés à la custody suisse via votre portail privé.",
      wealthTeaserButton: "Découvrir nos Services Patrimoniaux",
      globalNetworkDescription:
        "Servir discrètement les clients dans les capitales financières mondiales avec des coffres partenaires et une logistique sécurisée.",
    },
  },
  it: {
    nav: {
      wealth: "Patrimonio & Investimenti",
      clientLogin: "Accesso Clienti",
      privateClients: {
        label: "Clienti Privati",
        vaultDesc: "Custody svizzera e protezione silenziosa",
        wealthDesc: "Stewardship e reporting",
        servicesDesc: "Leasing, viewing e operations",
        membershipDesc: "Il percorso nella casa",
      },
    },
    hero: dualHero.it,
    cta: dualCta.it,
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
      ...dualCapitalTeaser.it,
      wealthTeaserTitle: "Stewardship patrimoniale, senza rumore",
      wealthTeaserDescription:
        "Per i clienti privati: mandati di portafoglio, strategia metalli e reporting consolidato — integrati con la custody svizzera tramite il portale privato.",
      wealthTeaserButton: "Esplora i Servizi Patrimoniali",
      globalNetworkDescription:
        "Serviamo discretamente i clienti nelle capitali finanziarie mondiali con caveau partner e logistica sicura.",
    },
  },
  de: {
    nav: {
      wealth: "Vermögen & Anlagen",
      clientLogin: "Kunden-Login",
      privateClients: {
        label: "Private Clients",
        vaultDesc: "Schweizer Custody und ruhiger Schutz",
        wealthDesc: "Stewardship und Reporting",
        servicesDesc: "Leasing, Viewing und Operations",
        membershipDesc: "Weg ins Haus",
      },
    },
    hero: dualHero.de,
    cta: dualCta.de,
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
      ...dualCapitalTeaser.de,
      wealthTeaserTitle: "Vermögens-Stewardship, kein Lärm",
      wealthTeaserDescription:
        "Für Private Clients: Portfoliomandate, Edelmetallstrategie und konsolidiertes Reporting — integriert mit Schweizer Custody über Ihr privates Portal.",
      wealthTeaserButton: "Vermögensdienstleistungen entdecken",
      globalNetworkDescription:
        "Diskrete Betreuung von Kunden in den Finanzmetropolen der Welt mit Partner-Tresoren und globaler Logistik.",
    },
  },
  es: {
    nav: {
      wealth: "Patrimonio e Inversión",
      clientLogin: "Acceso Clientes",
      privateClients: {
        label: "Clientes Privados",
        vaultDesc: "Custody suiza y protección discreta",
        wealthDesc: "Stewardship e informes",
        servicesDesc: "Leasing, viewing y operaciones",
        membershipDesc: "Camino a la casa",
      },
    },
    hero: dualHero.es,
    cta: dualCta.es,
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
      ...dualCapitalTeaser.es,
      wealthTeaserTitle: "Stewardship patrimonial, sin ruido",
      wealthTeaserDescription:
        "Para clientes privados: mandatos de cartera, estrategia de metales e informes consolidados — integrados con custody suiza a través de su portal privado.",
      wealthTeaserButton: "Descubrir Servicios Patrimoniales",
      globalNetworkDescription:
        "Atendemos con discreción a clientes en las capitales financieras del mundo con bóvedas asociadas y logística global.",
    },
  },
  pt: {
    nav: {
      wealth: "Patrimônio e Investimentos",
      clientLogin: "Login do Cliente",
      privateClients: {
        label: "Clientes Privados",
        vaultDesc: "Custody suíça e proteção discreta",
        wealthDesc: "Stewardship e relatórios",
        servicesDesc: "Leasing, viewing e operações",
        membershipDesc: "Caminho para a casa",
      },
    },
    hero: dualHero.pt,
    cta: dualCta.pt,
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
      ...dualCapitalTeaser.pt,
      wealthTeaserTitle: "Stewardship patrimonial, sem ruído",
      wealthTeaserDescription:
        "Para clientes privados: mandatos de portfólio, estratégia de metais e relatórios consolidados — integrados com custody suíça pelo portal privado.",
      wealthTeaserButton: "Explorar Serviços Patrimoniais",
      globalNetworkDescription:
        "Atendemos discretamente clientes nas capitais financeiras do mundo com cofres parceiros e logística global.",
    },
  },
  ru: {
    nav: {
      wealth: "Капитал и инвестиции",
      clientLogin: "Вход для клиентов",
      privateClients: {
        label: "Частные клиенты",
        vaultDesc: "Швейцарский custody и тихая защита",
        wealthDesc: "Stewardship и отчётность",
        servicesDesc: "Лизинг, viewing и операции",
        membershipDesc: "Путь в дом",
      },
    },
    hero: dualHero.ru,
    cta: dualCta.ru,
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
      ...dualCapitalTeaser.ru,
      wealthTeaserTitle: "Stewardship капитала, без шума",
      wealthTeaserDescription:
        "Для частных клиентов: портфельные мандаты, стратегия металлов и консолидированная отчётность — интегрированы со швейцарским custody через ваш частный портал.",
      wealthTeaserButton: "Узнать об услугах управления капиталом",
      globalNetworkDescription:
        "Дискретное обслуживание клиентов в финансовых столицах мира с партнёрскими хранилищами и глобальной логистикой.",
    },
  },
  zh: {
    nav: {
      wealth: "财富与投资",
      clientLogin: "客户登录",
      privateClients: {
        label: "私人客户",
        vaultDesc: "瑞士托管与静默保护",
        wealthDesc: "资产stewardship与报告",
        servicesDesc: "租赁、查验与运营",
        membershipDesc: "进入本行之径",
      },
    },
    hero: dualHero.zh,
    cta: dualCta.zh,
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
      ...dualCapitalTeaser.zh,
      wealthTeaserTitle: "财富stewardship，而非喧嚣",
      wealthTeaserDescription:
        "面向私人客户：组合授权、贵金属策略与综合报告——通过私人门户与瑞士托管一体化。",
      wealthTeaserButton: "了解财富服务",
      globalNetworkDescription:
        "通过合作金库与全球物流，为世界金融中心的客户提供私密服务。",
    },
  },
  ja: {
    nav: {
      wealth: "資産運用・投資",
      clientLogin: "クライアントログイン",
      privateClients: {
        label: "プライベートクライアント",
        vaultDesc: "スイスのカストディと静かな保護",
        wealthDesc: "スチュワードシップと報告",
        servicesDesc: "リース、閲覧、オペレーション",
        membershipDesc: "ハウスへの道",
      },
    },
    hero: dualHero.ja,
    cta: dualCta.ja,
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
      ...dualCapitalTeaser.ja,
      wealthTeaserTitle: "資産スチュワードシップ、ノイズではなく",
      wealthTeaserDescription:
        "プライベートクライアント向け：ポートフォリオ委任、貴金属戦略、統合レポーティング — プライベートポータル経由でスイスカストディと一体。",
      wealthTeaserButton: "資産運用サービスを見る",
      globalNetworkDescription:
        "提携保管庫とグローバル物流により、世界の金融都市のお客様に機密性の高いサービスを提供します。",
    },
  },
  ko: {
    nav: {
      wealth: "자산 및 투자",
      clientLogin: "고객 로그인",
      privateClients: {
        label: "프라이빗 클라이언트",
        vaultDesc: "스위스 커스터디와 조용한 보호",
        wealthDesc: "스튜어드십과 보고",
        servicesDesc: "임대, 열람, 운영",
        membershipDesc: "하우스로의 길",
      },
    },
    hero: dualHero.ko,
    cta: dualCta.ko,
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
      ...dualCapitalTeaser.ko,
      wealthTeaserTitle: "자산 스튜어드십, 소음이 아닌",
      wealthTeaserDescription:
        "프라이빗 클라이언트용: 포트폴리오 만데이트, 귀금속 전략, 통합 리포팅 — 프라이빗 포털을 통해 스위스 커스터디와 통합.",
      wealthTeaserButton: "자산 서비스 알아보기",
      globalNetworkDescription:
        "파트너 금고와 글로벌 물류로 세계 금융 수도의 고객에게 비공개 서비스를 제공합니다.",
    },
  },
  ar: {
    nav: {
      wealth: "الثروة والاستثمار",
      clientLogin: "دخول العملاء",
      privateClients: {
        label: "العملاء الخاصون",
        vaultDesc: "حفظ سويسري وحماية هادئة",
        wealthDesc: "الإشراف والتقارير",
        servicesDesc: "التأجير والمعاينة والعمليات",
        membershipDesc: "الطريق إلى الدار",
      },
    },
    hero: dualHero.ar,
    cta: dualCta.ar,
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
      ...dualCapitalTeaser.ar,
      wealthTeaserTitle: "إشراف على الثروة بلا ضجيج",
      wealthTeaserDescription:
        "للعملاء الخاصين: تفويضات المحفظة واستراتيجية المعادن وتقارير موحّدة — مدمجة مع الحفظ السويسري عبر بوابتكم الخاصة.",
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

  // Force brand-narrative copy from English (plan: English fallback OK)
  for (const key of BRAND_FORCE_FROM_EN) {
    if (en[key]) merged[key] = structuredClone(en[key]);
  }
  if (en.nav?.privateClients) {
    if (!merged.nav) merged.nav = {};
    merged.nav.privateClients = structuredClone(en.nav.privateClients);
  }
  if (en.capitalAccess?.hero) {
    if (!merged.capitalAccess) merged.capitalAccess = {};
    merged.capitalAccess.hero = structuredClone(en.capitalAccess.hero);
    merged.capitalAccess.features = structuredClone(en.capitalAccess.features);
  }
  if (en.home) {
    if (!merged.home) merged.home = {};
    for (const k of [
      "capitalTeaserTitle",
      "capitalTeaserDescription",
      "capitalTeaserButton",
      "capitalTeaserPoints",
      "wealthTeaserTitle",
      "wealthTeaserDescription",
      "wealthTeaserButton",
    ]) {
      if (en.home[k] !== undefined) merged.home[k] = structuredClone(en.home[k]);
    }
  }

  if (overrides[locale]) {
    deepAssign(merged, overrides[locale]);
  }
  if (homeOverrides[locale]) {
    deepAssign(merged, homeOverrides[locale]);
  }

  // Re-apply dual brand overlays after homeOverrides so stale about/vault seeds cannot win
  deepAssign(merged, {
    hero: dualHero[locale],
    cta: dualCta[locale],
    home: dualCapitalTeaser[locale],
  });
  for (const key of BRAND_FORCE_FROM_EN) {
    if (key === "hero" || key === "cta") continue;
    if (en[key]) merged[key] = structuredClone(en[key]);
  }
  if (en.capitalAccess?.hero) {
    merged.capitalAccess.hero = structuredClone(en.capitalAccess.hero);
    merged.capitalAccess.features = structuredClone(en.capitalAccess.features);
  }
  if (overrides[locale]?.nav?.privateClients) {
    merged.nav.privateClients = structuredClone(overrides[locale].nav.privateClients);
  }
  if (overrides[locale]?.home) {
    deepAssign(merged.home, {
      wealthTeaserTitle: overrides[locale].home.wealthTeaserTitle,
      wealthTeaserDescription: overrides[locale].home.wealthTeaserDescription,
      wealthTeaserButton: overrides[locale].home.wealthTeaserButton,
    });
  }

  fs.writeFileSync(filePath, JSON.stringify(merged, null, 2) + "\n");
  console.log(`Updated ${locale}.json`);
}
