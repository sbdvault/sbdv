import { SBDV_KNOWLEDGE } from "./chat-knowledge";
import type { ChatUserContext } from "./chat-context";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface BorrowerApp {
  id: string;
  company: string;
  status: string;
  amountUsd: number;
  apr: number;
  termYears: number;
  securityDepositUsd: number;
  onboardingPhase?: string;
  pool: string;
  escrow?: {
    bankName: string;
    bankAddress: string | null;
    accountName: string;
    accountNumber: string | null;
    iban: string;
    swift: string;
    beneficiary: string;
    beneficiaryAddress: string | null;
    reference: string;
  };
}

function formatUsd(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function conversationText(messages: ChatMessage[], limit = 8): string {
  return messages
    .slice(-limit)
    .map((m) => m.content)
    .join("\n")
    .toLowerCase();
}

function userConversationText(messages: ChatMessage[], limit = 6): string {
  return messages
    .filter((m) => m.role === "user")
    .slice(-limit)
    .map((m) => m.content)
    .join("\n")
    .toLowerCase();
}

function isNewVisitorIntent(q: string): boolean {
  return (
    /\b(new customer|new client|first time|never registered|no account|don't have an account|not a member|prospect|interested in joining|want to join)\b/.test(q) ||
    /\b(get started|getting started|how to start|how do i start|where do i begin|how to begin|how to get started)\b/.test(q) ||
    q.includes("what services") ||
    q.includes("services do you offer") ||
    q.includes("what do you offer") ||
    q.includes("tell me about sbdv")
  );
}

function replyServicesOverview(): string {
  return `SBDV offers four core pillars:

**1. Vault & Bullion Custody**
LBMA-standard gold and silver storage in Zurich and our global vault network — audited, insured, and discreet.

**2. Wealth & Investment**
Portfolio oversight combining physical bullion with financial assets for private investors and family offices.

**3. Membership**
Three tiers — **Standard Custody**, **Executive Vault**, and **Sovereign Tier** — with access to the client portal, documents, and relationship management.

**4. Capital Access Program**
Institutional capital for qualified enterprises ($500K–$100M) from sovereign wealth pools, with structured onboarding.

New here? Ask *"how do I get started?"* and I'll point you to the right path.`;
}

function replyGuestGetStarted(): string {
  return `Welcome — here's how to get started with SBDV:

**For individuals & families (vault custody)**
1. Review **Membership** tiers at /en/membership
2. Submit a discreet application — our team responds within a few business days
3. Once approved, log in at /en/login to access your **Client Portal**

**For enterprises (capital borrowing)**
1. Visit **Capital Access** at /en/capital-access
2. Register at /en/capital-access/register
3. Browse sovereign pools and submit a facility request

**Not sure which fits?**
• Storing gold or managing personal wealth → **Membership**
• Business needing institutional capital → **Capital Access**

What would you like to explore first?`;
}

function isShortFollowUp(message: string): boolean {
  const q = message.trim().toLowerCase();
  if (q.length > 40) return false;
  return (
    /^(how|what|why|when|where|which|who)\??$/.test(q) ||
    /^(ok|okay|and|so|then)\??$/.test(q) ||
    /^(tell me more|more details|go on|continue|what next|what now|and then)\??$/.test(q) ||
    /^(how do i|what do i|what should i|can you explain|please explain)/.test(q) ||
    q === "?" ||
    q === "??"
  );
}

/** Expand vague follow-ups using recent conversation + account state */
function resolveEffectiveQuery(message: string, messages: ChatMessage[], ctx: ChatUserContext): string {
  const q = message.trim().toLowerCase();

  if (!ctx.isAuthenticated && isNewVisitorIntent(q)) {
    return message;
  }

  const userText = userConversationText(messages);
  const recentAssistant = messages
    .filter((m) => m.role === "assistant")
    .slice(-2)
    .map((m) => m.content)
    .join("\n")
    .toLowerCase();

  const mentionsDeposit =
    userText.includes("security deposit") ||
    userText.includes("awaiting deposit") ||
    userText.includes("escrow") ||
    userText.includes("wire instruction") ||
    userText.includes("make the payment") ||
    (recentAssistant.includes("security deposit") && isShortFollowUp(message)) ||
    (recentAssistant.includes("awaiting deposit") && isShortFollowUp(message));

  const mentionsApplication =
    userText.includes("application") ||
    userText.includes("approved") ||
    userText.includes("facility") ||
    userText.includes("my facility") ||
    userText.includes("capital access") ||
    (ctx.role === "BORROWER" && userText.includes("status"));

  const mentionsDocuments =
    userText.includes("document") || userText.includes("upload") || userText.includes("kyc");

  const mentionsPortfolio =
    userText.includes("portfolio") || userText.includes("holdings") || userText.includes("bullion");

  const paymentLike =
    /\b(pay|payment|wire|transfer|send|remit|fund)\b/.test(q) || q.includes("make the payment");

  if ((paymentLike || (isShortFollowUp(message) && mentionsDeposit)) && ctx.role === "BORROWER") {
    return "how do I pay the security deposit wire transfer";
  }

  if (isShortFollowUp(message) && mentionsDocuments && ctx.isAuthenticated) {
    return "what documents do I need to upload";
  }

  if (isShortFollowUp(message) && mentionsApplication) {
    if (ctx.role === "BORROWER") {
      const apps = (ctx.details.applications as BorrowerApp[]) || [];
      const active = apps.find((a) => a.status === "APPROVED");
      if (active?.onboardingPhase === "AWAITING_DEPOSIT") {
        return "how do I pay the security deposit wire transfer";
      }
      if (active?.onboardingPhase === "AWAITING_DOCUMENTS") {
        return "what documents do I need to upload";
      }
    }
    if (ctx.role === "BORROWER") {
      return "what are my next onboarding steps after approval";
    }
    if (!ctx.isAuthenticated) {
      return "how do I get started with SBDV";
    }
  }

  if (isShortFollowUp(message) && mentionsPortfolio && ctx.role === "CLIENT") {
    return "summarize my portfolio";
  }

  if (isShortFollowUp(message) && ctx.isAuthenticated) {
    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
    if (lastAssistant) {
      const snippet = lastAssistant.content.slice(0, 280).replace(/\n/g, " ");
      return `${message} — continuing from: ${snippet}`;
    }
  }

  return message;
}

function getBorrowerApps(ctx: ChatUserContext): BorrowerApp[] {
  return ((ctx.details.applications as BorrowerApp[]) || []).slice();
}

function getActiveBorrowerFacility(ctx: ChatUserContext): BorrowerApp | undefined {
  const apps = getBorrowerApps(ctx);
  return (
    apps.find((a) => a.status === "APPROVED") ||
    apps.find((a) => a.status === "PENDING" || a.status === "UNDER_REVIEW")
  );
}

function replyApplicationStatus(ctx: ChatUserContext): string {
  const apps = getBorrowerApps(ctx);
  if (!apps.length) {
    return "You haven't submitted a capital access application yet. Go to **Capital Access → New Request** to apply, or browse **Available Pools** first.";
  }
  let reply = "**Your Capital Access applications:**\n";
  apps.forEach((a) => {
    reply += `\n• **${a.company}** (${a.pool})\n  Status: ${a.status.replace("_", " ")} · ${formatUsd(a.amountUsd)} at ${a.apr}% APR`;
    if (a.onboardingPhase) {
      reply += `\n  Onboarding: ${a.onboardingPhase.replace(/_/g, " ").toLowerCase()}`;
    }
  });
  const approved = apps.find((a) => a.status === "APPROVED");
  if (approved) {
    if (approved.onboardingPhase === "AWAITING_DEPOSIT") {
      reply += `\n\nYour next step is the **security deposit** (${formatUsd(approved.securityDepositUsd)}). Ask me *"how do I make the payment?"* for wire instructions.`;
    } else if (approved.onboardingPhase === "AWAITING_DOCUMENTS") {
      reply += `\n\nPlease upload your five required documents in **Onboarding**, then click Submit Documents.`;
    } else {
      reply += `\n\nOpen **My Facility** (/en/capital-access/portal/facility) for your current onboarding step.`;
    }
  }
  return reply;
}

function replySecurityDeposit(ctx: ChatUserContext): string {
  if (ctx.role === "BORROWER") {
    const facility = getActiveBorrowerFacility(ctx);
    if (facility?.onboardingPhase === "AWAITING_DEPOSIT" && facility.escrow) {
      const e = facility.escrow;
      return `Here’s how to complete your **security deposit** for **${facility.company}**:

**Amount due:** ${formatUsd(facility.securityDepositUsd)} (10% of ${formatUsd(facility.amountUsd)} facility)

**Wire to:**
• Bank: ${e.bankName}${e.bankAddress ? `\n  ${e.bankAddress}` : ""}
• Account: ${e.accountName}${e.accountNumber ? `\n• Account No.: ${e.accountNumber}` : ""}
• IBAN: ${e.iban}
• SWIFT: ${e.swift}
• Beneficiary: ${e.beneficiary}${e.beneficiaryAddress ? `\n  ${e.beneficiaryAddress}` : ""}
• Reference: **${e.reference}** (include exactly)

**Steps:**
1. Open **My Facility** → /en/capital-access/portal/facility
2. Initiate the wire from your corporate bank
3. Upload your **payment slip** (PDF or image)
4. Enter your wire reference and submit — our team verifies within a few business days

Need help after that? Ask about **documents** or **timeline**.`;
    }
    if (facility) {
      return `Your **${facility.company}** facility is past the deposit stage (current phase: ${facility.onboardingPhase?.replace(/_/g, " ").toLowerCase() || "in progress"}). Check **My Facility** for your next action, or ask *"what's my application status?"*`;
    }
    return "Once your Capital Access application is **approved**, your Facility Dashboard will show the escrow account assigned for your **10% security deposit**. Apply or check status at **Capital Access → Portal**.";
  }
  return "The Capital Access Program requires a **10% security deposit** held in escrow before disbursement. After approval, escrow details appear in the Facility Dashboard for the partner to transfer funds and upload a payment slip.";
}

function replyNextSteps(ctx: ChatUserContext): string {
  if (ctx.role === "BORROWER") {
    const facility = getActiveBorrowerFacility(ctx);
    if (!facility) {
      return "Once you submit a request, onboarding follows: **documents → review/approval + escrow → 10% deposit → KYC → disbursement**. Submit an application at **Capital Access → New Request** if you haven't yet.";
    }
    switch (facility.onboardingPhase) {
      case "AWAITING_DOCUMENTS":
      case "DOCUMENTS_REVISION":
        return `For **${facility.company}**, upload the **five required documents** in **Onboarding** (PDF, DOC, or JPEG only):\n• Audited financial statements\n• Signed facility agreement\n• KYC / beneficial ownership disclosure\n• Capital deployment plan\n• ID / driver’s licence / passport\n\nThen click **Submit Documents**. After review and approval, you will receive escrow instructions for the 10% deposit.`;
      case "DOCUMENTS_SUBMITTED":
        return `Your documentation package for **${facility.company}** has been **submitted** and is under review. No further upload is needed unless we request revisions.`;
      case "AWAITING_DEPOSIT":
        return `For **${facility.company}**, you're at the **security deposit** stage.\n\n1. Wire ${formatUsd(facility.securityDepositUsd)} to the escrow account (see **My Facility** or ask *"how do I make the payment?"*)\n2. Submit your wire reference\n3. Our team confirms within 2–3 business days\n\nThen KYC review continues.`;
      case "KYC_REVIEW":
        return `**${facility.company}** is in **KYC review**. No action needed from you right now — our compliance team will contact you if anything further is required. Typical review: 5–10 business days.`;
      case "READY_FOR_DISBURSEMENT":
        return `**${facility.company}** has cleared compliance. Capital release is being processed — you'll receive confirmation when funds are disbursed.`;
      case "DISBURSED":
      case "ACTIVE":
        return `Your **${facility.company}** facility is **active**. Manage repayments and statements in **My Facility**. For payment schedules, ask *"explain my loan terms"*.`;
      default:
        return replyApplicationStatus(ctx);
    }
  }
  if (ctx.role === "CLIENT") {
    return "As a member, your key actions are in the **Client Portal**: review **Holdings**, upload **Documents**, and message your relationship manager. Ask *\"summarize my portfolio\"* for a snapshot.";
  }
  return "Happy to walk you through it — are you interested in **membership**, **Capital Access**, or **vault custody**? Tell me which and I'll outline the exact steps.";
}

function replyLoanTerms(ctx: ChatUserContext): string {
  if (ctx.role === "BORROWER") {
    const facility = getActiveBorrowerFacility(ctx) || getBorrowerApps(ctx)[0];
    if (facility) {
      return `**${facility.company}** facility terms:\n\n• **Principal:** ${formatUsd(facility.amountUsd)}\n• **APR:** ${facility.apr}%\n• **Term:** ${facility.termYears} year${facility.termYears === 1 ? "" : "s"}\n• **Security deposit:** ${formatUsd(facility.securityDepositUsd)} (10%, held in escrow)\n• **Pool:** ${facility.pool}\n\nRepayment schedules appear in **My Facility** once disbursed. For deposit or onboarding steps, just ask.`;
    }
  }
  return "**Capital Access** terms overview:\n• $500K – $100M facility sizes\n• 1–10 year terms\n• Competitive institutional APR (pool-dependent)\n• **10% security deposit** in escrow\n• Monthly or annual repayment options\n\nApply at **/capital-access/register** to receive a tailored quote.";
}

function replyOffTopic(message: string, ctx: ChatUserContext): string | null {
  const q = message.toLowerCase();

  if (/\b(weather|sports|recipe|joke|movie|game)\b/.test(q)) {
    return "That's a bit outside my lane — I'm focused on SBDV vault custody, wealth services, and capital access. Is there anything along those lines I can help with?";
  }

  if (/\b(bitcoin|crypto|ethereum|nft)\b/.test(q)) {
    return "SBDV specializes in **physical bullion custody** (gold, silver, LBMA standard) rather than digital assets. I can explain our vault services, membership tiers, or how we safeguard precious metals — would any of that help?";
  }

  if (/\b(stock|equity|bond|etf|forex|trading)\b/.test(q) && !q.includes("portfolio")) {
    return "Our wealth services include portfolio oversight alongside bullion custody. For detailed investment guidance, your relationship manager is the best contact — I can summarize **your holdings** if you're a member, or explain **membership** to get started.";
  }

  if (/\b(lawyer|legal advice|sue|lawsuit|tax advice|irs)\b/.test(q)) {
    return "I can't provide legal or tax advice, but I can explain SBDV's custody standards, onboarding requirements, and connect you with the right team. For Capital Access: **capital@sbdv.swiss** — for membership: use our **Contact** page.";
  }

  if (/\b(price of gold|gold price|silver price|spot price)\b/.test(q)) {
    return "Live spot prices aren't displayed in chat, but your **Client Portal** shows real-time bullion valuations for holdings in custody. Non-members can learn about our **vault & security** standards and request access via **Membership**.";
  }

  if (/\b(hours|open|closed|weekend|holiday)\b/.test(q)) {
    return "SBDV operates on Swiss business standards — relationship managers respond within one business day. Urgent custody matters: use **Portal → Messages** (members) or **capital@sbdv.swiss** (Capital Access). Our digital concierge is available anytime.";
  }

  if (ctx.isAuthenticated && ctx.role === "BORROWER") {
    const facility = getActiveBorrowerFacility(ctx);
    if (facility && !q.match(/\b(sbdv|vault|membership|capital|deposit|document|loan|facility)\b/)) {
      return `I may not have a precise answer to that, but I can see your **${facility.company}** facility is ${facility.onboardingPhase?.replace(/_/g, " ").toLowerCase() || "in progress"}. Would wire instructions, document requirements, or your loan terms be helpful?`;
    }
  }

  return null;
}

function conversationalFallback(message: string, messages: ChatMessage[], ctx: ChatUserContext): string {
  const offTopic = replyOffTopic(message, ctx);
  if (offTopic) return offTopic;

  const q = message.toLowerCase();

  if (!ctx.isAuthenticated) {
    if (isNewVisitorIntent(q)) return replyGuestGetStarted();
    return `I'd be glad to help. SBDV serves **private clients** (vault custody & wealth) and **enterprises** (institutional capital).\n\nTell me which describes you, or ask about **services**, **membership**, or **Capital Access** — I'll walk you through the next step.`;
  }

  const firstName = ctx.name?.split(" ")[0];
  const prefix = firstName ? `${firstName}, ` : "";

  if (ctx.role === "BORROWER") {
    const facility = getActiveBorrowerFacility(ctx);
    if (facility?.onboardingPhase === "AWAITING_DEPOSIT") {
      return `${prefix}based on your approved **${facility.company}** facility, your immediate priority is the **${formatUsd(facility.securityDepositUsd)} security deposit**. I can walk you through the wire transfer step-by-step — shall I?`;
    }
    if (facility) {
      return `${prefix}I'm not certain I understood — but your facility is currently at **${facility.onboardingPhase?.replace(/_/g, " ").toLowerCase()}**. Ask about **payments**, **documents**, **status**, or **loan terms** and I'll pull your details.`;
    }
  }

  const userTopic = userConversationText(messages, 4);
  if (
    ctx.role === "BORROWER" &&
    (userTopic.includes("security deposit") || userTopic.includes("make the payment") || userTopic.includes("wire"))
  ) {
    return `${prefix}continuing from our conversation — would you like the **wire instructions** for your security deposit, or help with what happens after payment clears?`;
  }

  if (ctx.role === "CLIENT") {
    return `${prefix}I'm here for your portfolio, documents, and custody questions. Ask *"summarize my portfolio"* or tell me what you're trying to do.`;
  }

  return `${prefix}Could you tell me a bit more about what you need? I can help with specific account details or guide you through our services.`;
}

function ruleBasedReply(message: string, messages: ChatMessage[], ctx: ChatUserContext): string {
  const raw = message.toLowerCase();

  if (!ctx.isAuthenticated) {
    if (/\b(new customer|new client|first time|no account|don't have|not a member)\b/.test(raw)) {
      return replyGuestGetStarted();
    }
    if (raw.includes("what services") || raw.includes("services do you offer") || raw.includes("what do you offer")) {
      return replyServicesOverview();
    }
    if (/\b(get started|getting started|how to start|how do i start|where do i begin|how to begin|how to get started)\b/.test(raw)) {
      return replyGuestGetStarted();
    }
  }

  const effective = resolveEffectiveQuery(message, messages, ctx);
  const q = effective.toLowerCase();

  if (!ctx.isAuthenticated && isNewVisitorIntent(q)) {
    if (q.includes("what services") || q.includes("what do you offer")) return replyServicesOverview();
    return replyGuestGetStarted();
  }

  const paymentQuery =
    /\b(pay|payment|wire|transfer|send money|remit|fund|make the payment)\b/.test(q) ||
    q.includes("how do i pay") ||
    q.includes("how to pay");

  const statusQuery =
    q.includes("application") ||
    q.includes("status") ||
    q.includes("approved") ||
    q.includes("facility") ||
    q.includes("where am i");

  const nextStepQuery =
    q.includes("next step") ||
    q.includes("what now") ||
    q.includes("what next") ||
    q.includes("what do i do") ||
    q.includes("onboarding step") ||
    q.includes("after approval") ||
    q.includes("get started") ||
    q.includes("getting started") ||
    q.includes("how to get started") ||
    q.includes("how do i get started");

  const termsQuery =
    q.includes("loan term") ||
    q.includes("apr") ||
    q.includes("interest") ||
    q.includes("repayment") ||
    q.includes("installment") ||
    q.includes("how much do i owe");

  const timelineQuery =
    q.includes("how long") ||
    q.includes("timeline") ||
    q.includes("when will") ||
    q.includes("how many days");

  if (ctx.isAuthenticated && (q.includes("portfolio") || q.includes("net worth") || q.includes("holdings") || q.includes("summarize my"))) {
    if (ctx.role !== "CLIENT") {
      return "Portfolio details are available in the **Client Portal** after membership approval. If you're a Capital Access partner, ask about your **application**, **payment**, or **facility** instead.";
    }
    const d = ctx.details;
    const bullion = (d.bullionItems as { name: string; quantity: number; unit?: string; vault?: string; value: number }[]) || [];
    let reply = `Here's your portfolio snapshot:\n\n• **Total value:** ${formatUsd(d.portfolioTotalUsd as number)}\n• **Bullion & custody:** ${formatUsd(d.bullionValueUsd as number)}\n• **Tier:** ${d.tier}\n• **Documents on file:** ${d.documentCount}`;
    if (d.ytdReturnPct) reply += `\n• **YTD return:** ${d.ytdReturnPct}%`;
    if (bullion.length) {
      reply += `\n\n**Bullion holdings:**`;
      bullion.forEach((b) => {
        reply += `\n• ${b.name}: ${b.quantity} ${b.unit || "units"} — ${formatUsd(b.value)}${b.vault ? ` (${b.vault})` : ""}`;
      });
    }
    reply += `\n\nView full details in **Portal → Holdings**.`;
    return reply;
  }

  if (paymentQuery || q.includes("deposit") || q.includes("escrow") || q.includes("security deposit")) {
    if (!ctx.isAuthenticated) {
      return "Security deposits apply to the **Capital Access Program** for enterprises — a 10% escrow held before disbursement. If you're a new visitor exploring options, ask *\"how do I get started?\"* and I'll guide you. For vault custody, see **Membership** instead.";
    }
    return replySecurityDeposit(ctx);
  }

  if (nextStepQuery) {
    if (!ctx.isAuthenticated) return replyGuestGetStarted();
    return replyNextSteps(ctx);
  }

  if (termsQuery) {
    return replyLoanTerms(ctx);
  }

  if (timelineQuery && ctx.role === "BORROWER") {
    const facility = getActiveBorrowerFacility(ctx);
    if (facility?.onboardingPhase === "AWAITING_DEPOSIT") {
      return "After you submit your wire reference, deposit verification typically takes **2–3 business days**. Document review follows (allow **5–10 business days** for KYC). Total onboarding from deposit to disbursement is usually **2–4 weeks** depending on completeness.";
    }
    return replyNextSteps(ctx);
  }

  if (statusQuery) {
    if (ctx.role === "BORROWER") return replyApplicationStatus(ctx);
    if (!ctx.isAuthenticated) {
      return "To track an application, register at **Capital Access → Apply for Access**, or log in if you already have a partner account.";
    }
  }

  if (q.includes("document") || q.includes("upload")) {
    if (ctx.role === "CLIENT") {
      return "Upload documents in **Client Portal → Documents**. Supported statements, contracts, and compliance files are stored securely.";
    }
    if (ctx.role === "BORROWER") {
      return "Upload five documents in **Onboarding** (PDF, DOC, or JPEG): audited financials, signed facility agreement, KYC disclosure, capital deployment plan, and ID / driver’s licence / passport. Then click **Submit Documents**. You can delete and re-upload before submitting.";
    }
    return "Document upload is available in the Client Portal (members) or Facility Dashboard (Capital Access partners).";
  }

  if (
    q.includes("what services") ||
    q.includes("services do you offer") ||
    q.includes("what do you offer") ||
    (q.includes("services") && q.includes("sbdv"))
  ) {
    return replyServicesOverview();
  }

  if (q.includes("capital access") || q.includes("borrow") || q.includes("loan")) {
    return "**Capital Access Program** — qualified enterprises can access institutional sovereign capital pools.\n\n• Request: $500K – $100M\n• Terms: 1–10 years, monthly or yearly repayment\n• **10% security deposit** after document approval\n• Apply at **/capital-access/register**\n\nFlow: documents → approval + escrow → deposit → KYC → disbursement.";
  }

  if (q.includes("membership") || (q.includes("apply") && !q.includes("application")) || q.includes("join")) {
    return "SBDV membership opens access to Swiss vault custody and the client portal.\n\n• **Standard Custody** — secure bullion storage\n• **Executive Vault** — enhanced services\n• **Sovereign Tier** — UHNW / institutional\n\nApply at **/membership**. Our team reviews applications discreetly.";
  }

  if (q.includes("vault") || q.includes("bullion") || q.includes("gold") || q.includes("custody")) {
    return "SBDV provides **LBMA-standard** bullion custody in **Zurich, Switzerland** and partner vaults globally. Holdings are audited, insured, and visible in your client portal with real-time valuations.";
  }

  if (q.includes("login") || q.includes("sign in") || q.includes("account")) {
    return "Use **Client Login** (/login) with your registered email.\n\n• **Clients** → Portfolio portal\n• **Capital Access partners** → Enterprise portal\n• **Admins** → Institutional platform\n\nNew? Apply via **Membership** or **Capital Access** first.";
  }

  if (ctx.role === "ADMIN" && (q.includes("pending") || q.includes("queue") || q.includes("admin"))) {
    const d = ctx.details;
    return `**Admin snapshot:**\n• Membership applications pending: **${d.pendingMembershipApplications}**\n• Capital access queue: **${d.pendingCapitalAccess}**\n• Sovereign entities in registry: **${d.sovereignEntityCount}**\n• Investment directives pending: **${d.pendingDirectives}**\n\nReview at **/admin** and **/admin/capital-access**.`;
  }

  if (q.includes("hello") || q.includes("hi") || q.includes("hey")) {
    const name = ctx.name ? `, ${ctx.name.split(" ")[0]}` : "";
    if (ctx.isAuthenticated) {
      return `Hello${name}. I'm the SBDV concierge — I can help with your ${ctx.role === "BORROWER" ? "capital access facility" : ctx.role === "ADMIN" ? "admin operations" : "portfolio and custody"} and guide new clients. What would you like to know?`;
    }
    return "Welcome to SBDV. I'm your concierge — ask about vault custody, membership, wealth services, or our **Capital Access Program** for enterprises.";
  }

  if (q.includes("contact") || q.includes("human") || q.includes("manager")) {
    return "For direct assistance:\n• **Capital Access:** capital@sbdv.swiss\n• **Membership & custody:** use the **Contact** page\n• Logged-in clients: message your relationship manager via **Portal → Messages**";
  }

  if (q.includes("thank") || q.includes("thanks")) {
    return ctx.name
      ? `You're welcome, ${ctx.name.split(" ")[0]}. If anything else comes up — onboarding, documents, or general questions — just ask.`
      : "You're welcome. If anything else comes up, I'm here.";
  }

  return conversationalFallback(message, messages, ctx);
}

export async function generateChatReply(
  messages: ChatMessage[],
  ctx: ChatUserContext
): Promise<string> {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUser) return "How can I assist you today?";

  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey) {
    try {
      const systemPrompt = `You are the SBDV (Swiss Bullion Depository Vault) digital concierge. Be professional, discreet, and concise — like a private bank relationship manager. Use markdown sparingly (**bold** for emphasis).

${SBDV_KNOWLEDGE}

CURRENT USER CONTEXT:
${ctx.summary}
Details (use to personalize; never invent data not listed here):
${JSON.stringify(ctx.details, null, 2)}

Rules:
- Maintain conversation flow: short follow-ups like "how?" refer to the prior exchange — but ONLY for logged-in users with active accounts. Never assume deposit/payment context for guests or new visitors.
- For guests and new customers, proactively explain services and guide them to Membership or Capital Access — never mention security deposits or wire instructions unless they ask about enterprise borrowing specifically.
- If logged in, personalize answers using their actual data above.
- Never reveal other clients' information or admin credentials.
- For legal/regulatory advice, recommend speaking with their relationship manager.
- For off-topic questions, acknowledge briefly, redirect gracefully, and offer something relevant you CAN help with.
- Keep responses under 200 words unless listing portfolio/application details or wire instructions.
- Include relevant page paths (e.g. /en/capital-access/portal/facility) when helpful.`;

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages.slice(-12).map((m) => ({ role: m.role, content: m.content })),
          ],
          max_tokens: 500,
          temperature: 0.6,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content?.trim();
        if (reply) return reply;
      }
    } catch (err) {
      console.error("OpenAI chat error:", err);
    }
  }

  return ruleBasedReply(lastUser.content, messages, ctx);
}
