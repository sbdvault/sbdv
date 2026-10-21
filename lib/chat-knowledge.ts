/** Static knowledge for SBDV concierge — injected into every chat session */
export const SBDV_KNOWLEDGE = `
SBDV (Swiss Bullion Depository Vault) is a Swiss-based institution offering:
- Vault custody for gold, silver, and precious metals (LBMA standard, Zurich and global vault network)
- Wealth & investment: private-client mandate funded by wire or Bitcoin; stated yield on principal; withdraw or reinvest interest; Bitcoin is a funding rail only
- Vault membership (custody only): Standard Custody, Executive Vault, Sovereign Tier — apply at /membership
- Client Portal: holdings, performance, documents, secure messaging
- Capital Access Program: qualified enterprises worldwide may borrow institutional USD capital from sovereign pools with 10% security deposit, 1–10 year terms, monthly or yearly repayment. Not a bank deposit or personal loan.
- Capital Access onboarding: documents + UBO list → review/approval + escrow → 10% deposit and origin of funds → KYC/sanctions → disbursement bank (SWIFT + IBAN or local account) → active facility
- Applicants may be incorporated and operate in any permitted jurisdiction. Comprehensively sanctioned jurisdictions cannot be onboarded. Local-register documents and certified translations are accepted.
- Vault membership is by invitation for custody. Wealth clients register on /wealth-investment, then choose amount and funding rail in the portal. Operations approves the notice so house instructions appear on Funding; the client uploads payment proof; ops confirms receipt before principal accrues. The first 1,000 funded clients receive a 10% founding bonus on the first confirmed deposit. Capital Access is open to qualified enterprises.
- Institutional Platform (admin): sovereign wealth registry, investment directives, capital access review

Key URLs (prepend locale e.g. /en):
- /membership — apply for vault custody membership
- /wealth-investment — how the mandate grows; register for a wealth portal account
- /capital-access — enterprise capital borrowing program
- /capital-access/register — register as capital partner
- /login — client, borrower, and admin login
- /portal — client portfolio dashboard
- /capital-access/portal — borrower capital access dashboard
- /contact — contact form

Contact: capital@sbdv.swiss for Capital Access; vault membership via /membership; wealth account via /wealth-investment.
Regulatory: SBDV is a Zurich-seated vault and capital arranger, not a Swiss bank. Clients worldwide undergo Swiss KYC/AML screening. Capital Access is not a protected bank deposit.
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
