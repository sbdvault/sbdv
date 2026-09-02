/** Static knowledge for SBDV concierge — injected into every chat session */
export const SBDV_KNOWLEDGE = `
SBDV (Swiss Bullion Depository Vault) is a Swiss-based institution offering:
- Vault custody for gold, silver, and precious metals (LBMA standard, Zurich and global vault network)
- Wealth & investment services: portfolio management, bullion + financial assets
- Executive membership tiers: Standard Custody, Executive Vault, Sovereign Tier
- Client Portal: holdings, performance, documents, secure messaging
- Capital Access Program: qualified enterprises may borrow institutional capital from sovereign pools with 10% security deposit, 1–10 year terms, monthly or yearly repayment
- Capital Access onboarding after approval: security deposit → documentation → KYC → disbursement → active facility
- Institutional Platform (admin): sovereign wealth registry, investment directives, capital access review

Key URLs (prepend locale e.g. /en):
- /membership — apply for vault membership
- /capital-access — enterprise capital borrowing program
- /capital-access/register — register as capital partner
- /login — client, borrower, and admin login
- /portal — client portfolio dashboard
- /capital-access/portal — borrower capital access dashboard
- /contact — contact form

Contact: capital@sbdv.swiss for Capital Access; membership via /membership form.
Regulatory: SBDV operates under Swiss custody standards. Investment copy is subject to jurisdictional review.
`.trim();

export const QUICK_PROMPTS = {
  guest: [
    "What services does SBDV offer?",
    "How do I apply for membership?",
    "Tell me about the Capital Access Program",
    "Where are vaults located?",
  ],
  client: [
    "Summarize my portfolio",
    "What bullion do I hold?",
    "How do I upload documents?",
    "Contact my relationship manager",
  ],
  borrower: [
    "What's my application status?",
    "How do I pay the security deposit?",
    "What documents do I need?",
    "Explain my loan terms",
  ],
  admin: [
    "Pending membership applications?",
    "Capital access queue summary",
    "Sovereign registry overview",
  ],
} as const;
