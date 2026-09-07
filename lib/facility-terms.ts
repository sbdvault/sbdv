/** Governing instrument for the Capital Access facility. English prevails. */

export const FACILITY_TERMS_VERSION = "SBDV-CAP-FAC-2021.01";
export const FACILITY_TERMS_EFFECTIVE = "1 January 2021";

export type FacilityTermsArticle = {
  id: string;
  title: string;
  paragraphs: string[];
};

export const facilityTermsArticles: FacilityTermsArticle[] = [
  {
    id: "parties",
    title: "1. Parties and status of this instrument",
    paragraphs: [
      "These Capital Access Facility Terms and Conditions (these “Terms”) are issued by Swiss Bullion Depository Vault (“SBDV”, “we”, “us”) and apply to every enterprise borrower that applies for, is approved for, or draws a facility under the Capital Access Program (the “Borrower”, “you”).",
      "These Terms, together with the facility particulars shown in your Capital Access facility dashboard — including the approved amount, term, annual interest rate, repayment frequency, installment amount, and security deposit — form the facility agreement between SBDV and the Borrower (the “Facility”).",
      "If there is any conflict between a marketing description and these Terms, these Terms prevail. If there is any conflict between a translation and the English text, the English text prevails.",
    ],
  },
  {
    id: "nature",
    title: "2. Nature of the facility",
    paragraphs: [
      "The Facility is a structured capital facility for a qualified enterprise. It is not a bank deposit, a retail loan, a public offering, or an invitation to the general public. Capital is made available only after institutional review, documentation, security, and compliance conditions have been satisfied.",
      "Nothing on the SBDV website, in the partner portal, or in correspondence is a commitment to lend until SBDV has approved the application in writing (including by status in the facility dashboard) and the conditions in Article 5 have been met.",
      "SBDV does not provide investment, tax, or legal advice. You must obtain independent advice appropriate to your jurisdiction before accepting these Terms.",
    ],
  },
  {
    id: "definitions",
    title: "3. Definitions",
    paragraphs: [
      "“Approved Amount” means the facility amount approved by SBDV, which may be equal to or less than the amount you requested.",
      "“Business Day” means a day on which banks are open for wholesale payments in Zurich and in the jurisdiction of the paying or receiving bank.",
      "“Disbursement” means payment by SBDV of the Approved Amount to the disbursement account you have submitted and we have accepted.",
      "“Installment” means each scheduled payment of principal and interest shown on the repayment schedule in your facility dashboard.",
      "“Security Deposit” means a cash amount equal to ten percent (10%) of the Approved Amount, payable before Disbursement and held as continuing security for your obligations.",
      "“Wire Reference” means the unique payment reference assigned to the Facility, which must appear on every transfer.",
    ],
  },
  {
    id: "application",
    title: "4. Application, review, and no commitment",
    paragraphs: [
      "A request is complete only when you have submitted the company profile, financial summary, intended use of proceeds, and accepted the application acknowledgements in the portal. Submission does not create a facility.",
      "SBDV may approve, decline, defer, or approve a reduced amount, shorter term, or different repayment frequency, in its sole discretion, without giving reasons, except where applicable law requires otherwise.",
      "You must have at least two years of operating history, be able to provide audited or reviewed financial statements, and request not less than USD 500,000, unless SBDV agrees otherwise in writing.",
      "All information you provide must be true, complete, and not misleading. You must promptly correct any information that becomes untrue.",
    ],
  },
  {
    id: "conditions",
    title: "5. Conditions before disbursement",
    paragraphs: [
      "SBDV is not obliged to disburse unless, in form and substance satisfactory to SBDV: (a) these Terms have been accepted by a person authorised to bind the Borrower; (b) the required document package has been uploaded and accepted; (c) the Security Deposit has been received in cleared funds in the escrow account designated by SBDV, for the exact amount, with the Wire Reference; (d) know-your-customer, anti-money-laundering, and sanctions screening of the Borrower and its beneficial owners has been completed to SBDV’s satisfaction; and (e) disbursement bank details have been submitted and accepted.",
      "SBDV may impose additional conditions, request further documents, or withdraw an approval that has not yet been disbursed if any condition ceases to be satisfied or if a material adverse change occurs.",
    ],
  },
  {
    id: "deposit",
    title: "6. Security deposit",
    paragraphs: [
      "Before any Disbursement, you must transfer the Security Deposit — ten percent (10%) of the Approved Amount, in United States dollars — to the escrow account displayed in your facility dashboard. The amount, beneficiary, bank, IBAN or account number, SWIFT, and Wire Reference shown there are part of these Terms for your Facility.",
      "You must transfer the exact amount. SBDV may reject a short payment, a payment without the Wire Reference, or a payment from an account that cannot be reconciled to the Borrower. You must upload a payment slip or bank confirmation and submit the bank’s wire reference through the portal. The Security Deposit is received only when SBDV confirms it in the facility dashboard.",
      "The Security Deposit is cash collateral. It is not a fee, not an advance of the Facility, and not a deposit with a bank for your account. It does not bear interest unless SBDV agrees otherwise in writing. You may not assign, pledge, or withdraw it.",
      "SBDV may apply the Security Deposit, without prior demand, to any overdue Installment, fee, cost, or other amount payable under the Facility, and to any loss arising from a breach. Any unused balance will be applied to the final amounts due, or returned to an account in the Borrower’s name, within fifteen (15) Business Days after the Facility has been repaid in full and all obligations have been released.",
      "If you withdraw after the Security Deposit has been confirmed and before Disbursement, SBDV will return the Security Deposit less any documented third-party or compliance costs, unless an event of default has occurred. If SBDV declines the Facility after the Security Deposit has been confirmed and before Disbursement, other than because of your breach or a failed compliance check caused by your information, the Security Deposit will be returned in full.",
      "A Security Deposit that cannot be accepted because of sanctions, source-of-funds concerns, or a material misrepresentation may be held, returned to the remitting bank, or otherwise dealt with as required by law. SBDV is not liable for delay caused by a correspondent bank or compliance review.",
    ],
  },
  {
    id: "disbursement",
    title: "7. Disbursement",
    paragraphs: [
      "After the conditions in Article 5 are satisfied, SBDV will disburse the Approved Amount to the bank account you submitted for that purpose. You represent that the account is held in the Borrower’s name at a regulated financial institution and is not a personal, third-party, or sanctioned account.",
      "Disbursement to the account details you submitted is a good discharge of SBDV’s payment obligation, even if those details were incorrect, unless SBDV had written notice of the error before initiating the transfer. The repayment schedule begins on the disbursement date recorded in the facility dashboard.",
    ],
  },
  {
    id: "interest",
    title: "8. Interest",
    paragraphs: [
      "Interest accrues on the Approved Amount at the fixed annual rate stated in your facility dashboard, calculated on a simple-interest basis for the full contractual term: Approved Amount × annual rate × term in years.",
      "The rate is the rate accepted with your Facility. It does not float with a market benchmark. A change to the rate applies only if you and SBDV agree in writing, including by an updated facility record you accept.",
      "Interest is payable as part of each Installment. It is not deferred to maturity unless the schedule states otherwise.",
    ],
  },
  {
    id: "repayment",
    title: "9. Repayment",
    paragraphs: [
      "You will repay the Approved Amount and all interest in equal Installments, monthly or yearly, as stated in your facility dashboard. The number of Installments is the term in years, or twelve times the term in years if repayment is monthly.",
      "Each Installment is due on the date shown on the repayment schedule. You must pay in USD by wire to the account SBDV designates for repayments, using the repayment reference for that Installment exactly as shown. You must upload a payment slip and submit the bank wire reference through the portal. An Installment is paid only when SBDV confirms it. Submission of a slip is not payment.",
      "If a due date is not a Business Day, payment is due on the preceding Business Day. Time is of the essence.",
      "You may not withhold, set off, or deduct any amount except a deduction required by law. If a deduction is required, you will gross up the payment so that SBDV receives the full amount due.",
    ],
  },
  {
    id: "application-of-payments",
    title: "10. Application of payments",
    paragraphs: [
      "SBDV may apply any amount received in the following order: costs and enforcement expenses; overdue interest; current interest; overdue principal; current principal; and then any other amount due. SBDV may refuse a payment that cannot be identified to the Facility.",
    ],
  },
  {
    id: "prepayment",
    title: "11. Prepayment",
    paragraphs: [
      "You may prepay the Facility in whole, but not in part, by giving SBDV at least ten (10) Business Days’ written notice through the portal or to the address in Article 24, and by paying all accrued obligations then due.",
      "Unless SBDV agrees otherwise in writing, a prepayment does not of itself cancel unaccrued contractual interest. Any waiver of unearned interest is a concession, not a right.",
    ],
  },
  {
    id: "proceeds",
    title: "12. Use of proceeds and mandate alignment",
    paragraphs: [
      "You will use the Facility only for the investment areas and corporate purposes described in your application and accepted by SBDV, and only in a manner consistent with the mandate of the capital pool from which the Facility is drawn.",
      "You will not use the Facility, the Security Deposit, or any related payment for any unlawful purpose, including bribery, sanctions evasion, terrorist financing, or the proceeds of crime. You will not deploy proceeds into a sector, jurisdiction, or asset that SBDV has excluded in the approval or in later written notice.",
    ],
  },
  {
    id: "representations",
    title: "13. Representations and warranties",
    paragraphs: [
      "You represent, on acceptance and on each payment and Disbursement, that: (a) you are duly organised and in good standing; (b) you have power and authority to enter into and perform the Facility, and the person accepting these Terms is authorised to bind you; (c) these Terms are your legal, valid, and binding obligations; (d) your acceptance and performance do not conflict with law, your constitutional documents, or any other agreement; (e) all information provided to SBDV is true, complete, and not misleading; (f) you have disclosed your beneficial owners and any person who controls you; (g) you are not insolvent and no insolvency proceeding is pending or threatened; and (h) neither you nor any beneficial owner is a sanctioned person, or located, organised, or resident in a comprehensively sanctioned jurisdiction.",
    ],
  },
  {
    id: "covenants",
    title: "14. Covenants",
    paragraphs: [
      "You will: maintain your corporate existence; comply with law applicable to you and to the use of proceeds; keep proper books; notify SBDV promptly of any default, material litigation, change of control, change of beneficial ownership, or material adverse change; and provide such financial and compliance information as SBDV reasonably requests.",
      "You will not, without SBDV’s prior written consent: assign or encumber the Facility or the Security Deposit; change your jurisdiction of incorporation in a way that materially increases compliance risk; or use a disbursement or repayment account other than one accepted by SBDV.",
    ],
  },
  {
    id: "kyc",
    title: "15. KYC, AML, and sanctions",
    paragraphs: [
      "You will complete, and will cause your directors, authorised signatories, and beneficial owners to complete, all identification, source-of-funds, and source-of-wealth checks SBDV or its banking partners require, before and after Disbursement.",
      "SBDV may suspend the Facility, decline a payment, or delay Disbursement or a return of the Security Deposit while a compliance review is open. SBDV may exit the relationship if required by law, by a correspondent bank, or by its own compliance policy. You will cooperate without delay.",
    ],
  },
  {
    id: "information",
    title: "16. Information, confidentiality, and data",
    paragraphs: [
      "Each party will keep confidential the commercial terms of the Facility and any non-public information received from the other, except where disclosure is required by law, regulation, auditors, professional advisers, or a financing source under a duty of confidence, or is needed to perform or enforce the Facility.",
      "SBDV processes personal data to perform the Facility, meet legal duties, and protect its legitimate interests in credit and financial-crime risk management, in accordance with the Swiss Federal Act on Data Protection and SBDV’s privacy policy. You confirm you have a lawful basis to provide personal data of your officers and beneficial owners.",
    ],
  },
  {
    id: "default",
    title: "17. Events of default",
    paragraphs: [
      "Each of the following is an event of default: (a) you fail to pay any amount when due; (b) you breach these Terms and, if the breach can be remedied, you do not remedy it within ten (10) Business Days after notice; (c) a representation is or becomes untrue in any material respect; (d) you use proceeds outside Article 12; (e) you become insolvent, stop payments, or are subject to an insolvency, restructuring, or creditor process; (f) a change of control occurs without SBDV’s consent; (g) it is or becomes unlawful for either party to perform; or (h) you, a beneficial owner, or a payment is subject to sanctions or a credible financial-crime concern.",
    ],
  },
  {
    id: "remedies",
    title: "18. Remedies",
    paragraphs: [
      "On an event of default, SBDV may, without prejudice to any other right: declare all outstanding principal, interest, and other amounts immediately due; apply the Security Deposit; suspend or cancel any undrawn commitment; refuse further performance; and take any step permitted by law to recover amounts due.",
      "A failure or delay in exercising a right is not a waiver. Rights are cumulative.",
    ],
  },
  {
    id: "costs",
    title: "19. Taxes, costs, and currency",
    paragraphs: [
      "You will pay all bank charges, correspondent fees, and taxes on your payments, so that SBDV receives the full amount due in USD. You are responsible for your own income, withholding, and transactional taxes.",
      "You will reimburse reasonable costs SBDV incurs in protecting or enforcing the Facility after a default or in connection with a compliance inquiry caused by your information.",
    ],
  },
  {
    id: "liability",
    title: "20. Limitation of liability and no advice",
    paragraphs: [
      "SBDV is not liable for indirect, incidental, or consequential loss, or for loss of profit, business, or goodwill, whether or not foreseeable. SBDV is not liable for delay or failure caused by a banking system, correspondent, sanctions screen, force majeure, or your own instructions.",
      "Nothing in these Terms excludes liability for fraud or for any liability that cannot be excluded under the law of Switzerland.",
      "You acknowledge that you have assessed the Facility independently and have not relied on any representation not set out in these Terms or in the facility dashboard.",
    ],
  },
  {
    id: "acceptance",
    title: "21. Electronic acceptance",
    paragraphs: [
      "You accept these Terms by selecting the acceptance control in the facility dashboard at the time you submit the Security Deposit, or by any other electronic method SBDV designates. That action is your electronic signature.",
      "You agree that SBDV’s record of the acceptance — including the version identifier, date and time, and user account — is conclusive evidence of acceptance, absent manifest error. You may read the full text of these Terms before accepting. Acceptance of the checkbox without opening this page is still acceptance of the full text.",
      "Only a person authorised to bind the Borrower may accept. By accepting, that person represents that he or she has that authority.",
    ],
  },
  {
    id: "amendments",
    title: "22. Amendments and version",
    paragraphs: [
      "SBDV may amend these Terms for new facilities by publishing a new version. The version you accepted continues to govern your Facility, except that SBDV may make a change that is required by law or by a banking or compliance partner, or that does not materially increase your payment obligations, by notice in the portal.",
      "The version of these Terms is identified as SBDV-CAP-FAC-2021.01 and is effective from 1 January 2021.",
    ],
  },
  {
    id: "assignment",
    title: "23. Assignment",
    paragraphs: [
      "You may not assign or transfer any right or obligation under the Facility without SBDV’s prior written consent. SBDV may assign or transfer its rights, or hold the Facility for a capital provider, provided your payment instructions and the economic terms you accepted are not materially adversely changed without notice.",
    ],
  },
  {
    id: "notices",
    title: "24. Notices",
    paragraphs: [
      "Notices to you may be given through the facility dashboard, or to the email address of your Capital Access account, and are effective when sent or posted. You must keep that email address current.",
      "Notices to SBDV regarding the Facility must be given through the portal or to the contact address published on the SBDV website, and are effective when actually received on a Business Day.",
    ],
  },
  {
    id: "law",
    title: "25. Governing law and jurisdiction",
    paragraphs: [
      "These Terms and the Facility are governed by the substantive laws of Switzerland, excluding conflict-of-law rules that would apply another law.",
      "The courts of Zurich, Switzerland, have exclusive jurisdiction, except that SBDV may bring proceedings in any court of competent jurisdiction to protect or recover the Security Deposit or any amount due. You irrevocably waive any objection of forum non conveniens.",
    ],
  },
  {
    id: "miscellaneous",
    title: "26. Miscellaneous",
    paragraphs: [
      "If any provision is held unenforceable, the remaining provisions continue in effect. These Terms, the facility dashboard particulars, and any written approval are the entire agreement for the Facility and replace prior discussions about its commercial terms.",
      "A person who is not a party has no right to enforce these Terms, except an assignee of SBDV. The headings are for convenience only.",
      "You may request a copy of the version you accepted from the facility dashboard or from the Capital Access desk. You should retain a copy for your records.",
    ],
  },
];
