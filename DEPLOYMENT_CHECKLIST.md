# SBDV Deployment Checklist

**Target stack:** [Layero](https://layero.app) (Next.js host) + **Supabase** (Postgres, Storage, seeds, portal data, chatbot context) + **Resend** (transactional email via SMTP)

**Live app (Layero):** https://sbdv-main.layero.app  
**Repo:** push to `main` on GitHub for Layero deploys  
**Last updated:** 2026-09-09

Prisma is configured for **PostgreSQL**. Set `DATABASE_URL` (pooler, port 6543 + `?pgbouncer=true`) and `DIRECT_URL` (direct, port 5432) from the Supabase dashboard before deploying.

Use this as the working todo list. Check items off as you complete them. Do not commit real secrets — use the Layero / Supabase / Resend dashboards or a local `.env` that stays gitignored.

> **Note:** `Dockerfile` / `amvera.yaml` remain in the repo from an earlier Amvera path. Production traffic is on Layero. Prefer Layero env + GitHub `main` unless you intentionally revive Amvera.

---

## A. Supabase project (database + storage)

- [ ] Create a Supabase project (note region; prefer EU if clients are EU-facing)
- [ ] Copy **Project URL**, **anon key**, and **service role key** (service role = server only)
- [ ] Copy **Database connection string**
  - [ ] `DATABASE_URL` — Transaction pooler (port 6543) for the running app
  - [ ] `DIRECT_URL` — Direct connection (port 5432) for Prisma migrate / `db push` / seed
- [ ] In Supabase SQL or via Prisma: confirm empty project is ready for schema push
- [ ] Create Storage buckets:
  - [ ] `client-documents` (private)
  - [ ] `capital-access-docs` (private)
- [ ] Set Storage policies so only the **service role** (server) can upload/read (app enforces NextAuth session)

---

## B. Code: connect app to Supabase

- [ ] Confirm Prisma datasource is `postgresql` with `url` + `directUrl`
- [ ] Update `.env.example` with placeholders only (never real keys)
- [ ] Set local `.env` / `.env.local` to point at Supabase for testing
- [ ] Run `npx prisma db push` (or migrate) against Supabase
- [ ] Confirm User MFA columns exist after push: `mfaMethod`, `emailOtpHash`, `emailOtpExpiresAt`
- [ ] Run `npm run db:seed` against Supabase (demo users + wealth registry + sample portfolios)
- [ ] Verify in Supabase Table Editor: `User`, `ClientProfile`, `CapitalAccessRequest`, `GlobalWealthEntity`, etc.
- [ ] Confirm demo logins work against Supabase data:
  - [ ] `admin@sbdv.swiss` → `/admin`
  - [ ] `client@sbdv.swiss` → `/portal`
  - [ ] `borrower@sbdv.swiss` → `/capital-access/portal`

---

## C. Route client / admin / capital-access through Supabase

Portals already use Prisma + NextAuth. After `DATABASE_URL` points at Supabase, all of these read/write Supabase Postgres.

### Client portal (`/portal`)
- [ ] Holdings / performance / documents load from Supabase
- [ ] Document upload API writes to Supabase Storage (`client-documents`) and saves metadata in DB
- [ ] Messages / profile updates persist in Supabase
- [ ] Settings → MFA: authenticator (TOTP) **or** email codes

### Admin (`/admin`)
- [ ] Overview counts (applications, capital queue, wealth registry) from Supabase
- [ ] Sovereign / private wealth registry CRUD against Supabase
- [ ] Investment directives against Supabase
- [ ] Membership applications review against Supabase
- [ ] Capital Access admin review + onboarding phase advances against Supabase
- [ ] Clients list from Supabase

### Capital Access (`/capital-access`)
- [ ] Register / login (BORROWER) users stored in Supabase
- [ ] Pool listing + request wizard persists `CapitalAccessRequest` in Supabase
- [ ] Facility dashboard (deposit, docs, KYC phases) reads/writes Supabase
- [ ] Facility document uploads go to Supabase Storage (`capital-access-docs`)
- [ ] Transactional emails via Resend SMTP (see section **L**); status data always from Supabase

### Auth (NextAuth credentials)
- [ ] Credentials provider validates `passwordHash` from Supabase `User`
- [ ] Role redirects unchanged: ADMIN / CLIENT / BORROWER
- [ ] MFA: TOTP and/or email OTP (`mfaMethod` = `TOTP` | `EMAIL`)
- [ ] `AUTH_SECRET`, `AUTH_URL`, `AUTH_TRUST_HOST` set in production
- [ ] Never expose `DATABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` to the browser

---

## D. Chatbot structured on Supabase

- [ ] Confirm `lib/chat-context.ts` loads guest / CLIENT / BORROWER / ADMIN context via Prisma → Supabase
- [ ] Confirm personalized answers (portfolio, application status, deposit, admin queues) work against seeded Supabase data
- [ ] Guest flow still works (no account) without leaking other users’ data
- [ ] Optional: add `ChatSession` / `ChatMessage` Prisma models + migrate to Supabase for conversation audit
- [ ] Optional: set `OPENAI_API_KEY`; rule-based engine remains fallback
- [ ] Smoke-test quick prompts per role after seed

---

## E. Layero hosting (Next.js app)

- [ ] Layero project linked to GitHub `sbdvault/sbdv` (or current remote)
- [ ] Deploy from **`main`**; confirm build uses Docker / standalone Next output as configured
- [ ] Set Layero **environment variables / secrets** (see section G)
- [ ] Production URLs:
  - [ ] `AUTH_URL=https://sbdv-main.layero.app` (or custom domain)
  - [ ] `NEXT_PUBLIC_SITE_URL` matches the public origin (same host)
- [ ] `DATA_DIR`: Layero cannot reliably use `/data` — leave unset or use a writable path; app falls back to temp under `sbdv-data` when `/data` is unavailable
- [ ] Confirm build succeeds in Layero logs
- [ ] Confirm app is running and public URL opens `/en`
- [ ] After schema changes: ensure entrypoint / release step runs `prisma db push` (or migrate) so MFA email columns exist in prod

---

## F. Local production build check (before / after Supabase)

```bash
cd sbdv-site
npm run build
npm run start
```

- [ ] Build completes with no errors
- [ ] Pages load (home, about, membership, capital-access, login)
- [ ] i18n (en / nl / fr / it) works
- [ ] Contact / membership forms work (email primary; Telegram optional if tokens set)
- [ ] Login + each portal works against Supabase
- [ ] Chat widget works (guest + logged-in)
- [ ] Resend smoke: password reset or membership form delivers mail

---

## G. Environment variables (production)

Set in **Layero** (and mirror locally in `.env` for seed/migrate). Never commit real values. See `.env.example`.

```env
# Public site (production)
NEXT_PUBLIC_SITE_URL=https://sbdv-main.layero.app
AUTH_URL=https://sbdv-main.layero.app
AUTH_TRUST_HOST=true
AUTH_SECRET=generate-a-long-random-secret

# Supabase / Prisma
DATABASE_URL=postgresql://...pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://...supabase.com:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email via Resend SMTP
# Testing: FROM onboarding@resend.dev (Resend only delivers to the account owner email)
# Production: verify a domain in Resend, then set EMAIL_FROM to that domain
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASS=re_your_resend_api_key
EMAIL_FROM=SBDV <onboarding@resend.dev>
CONTACT_EMAIL=sbdvault@gmail.com
ADMIN_EMAIL=sbdvault@gmail.com

# Escrow (Capital Access) — shown to borrowers for deposits
ESCROW_BANK_NAME=
ESCROW_ACCOUNT_NAME=
ESCROW_IBAN=
ESCROW_SWIFT=

# Telegram (optional mirror for contact / membership)
TELEGRAM_CHAT_1_TOKEN=
TELEGRAM_CHAT_1_ID=
TELEGRAM_CHAT_2_TOKEN=
TELEGRAM_CHAT_2_ID=

# Chatbot (optional)
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```

- [ ] All required vars set in Layero (especially Resend SMTP + `AUTH_URL` / `NEXT_PUBLIC_SITE_URL`)
- [ ] `.env*` listed in `.gitignore`
- [ ] Rotate any tokens that were pasted into chat, docs, or screenshots
- [ ] No Gmail App Password / legacy SMTP host left in production env

---

## H. Domain, SEO, security

- [ ] Start on Layero subdomain; keep `NEXT_PUBLIC_SITE_URL` and `AUTH_URL` in sync
- [ ] Later: custom domain + DNS + SSL; update both URL env vars
- [ ] Verify `metadataBase` / Open Graph use `NEXT_PUBLIC_SITE_URL`
- [ ] HTTPS only; no mixed content
- [ ] API routes require session for portal/admin/capital-access mutations
- [ ] Service role key never in client bundles

---

## I. Seed & data ops (Supabase)

- [ ] First-time: `DATABASE_URL`/`DIRECT_URL` → `npx prisma db push` → `npm run db:seed`
- [ ] Re-seed only when intentional (seed may wipe/rebuild wealth entities)
- [ ] Document demo passwords privately (password manager); change before real clients
- [ ] Enable Supabase automatic backups / PITR if on a paid plan
- [ ] Export/backup strategy: Supabase dashboard dump + Layero config notes

---

## J. Post-deploy verification

### Public
- [ ] `/en` homepage loads
- [ ] Marketing pages + language switcher
- [ ] Contact / membership forms → email (and Telegram if configured)
- [ ] Chatbot guest: services / get started (no deposit leak)

### Client
- [ ] Login → `/portal`
- [ ] Portfolio + holdings from Supabase
- [ ] Document upload → Storage
- [ ] Settings: enable email MFA → logout → login receives email code
- [ ] Chat: “Summarize my portfolio”

### Capital Access
- [ ] Register → welcome email received
- [ ] Login → `/capital-access/portal`
- [ ] Applications / facility from Supabase
- [ ] Deposit / docs / bank / repayment → admin notify + borrower receipt emails
- [ ] Chat: “What's my application status?” / payment follow-ups

### Admin
- [ ] Login → `/admin`
- [ ] Registry, directives, applications, capital-access queues from Supabase
- [ ] Membership applications appear; applicant confirmation email sent
- [ ] Chat: pending / queue summary

### Resilience
- [ ] Redeploy Layero app; Supabase data still present
- [ ] Uploaded files still reachable via Storage
- [ ] Forgot-password reset email still delivers via Resend

---

## K. Implementation order (recommended)

1. [ ] **Supabase project** + connection strings  
2. [ ] **Prisma `db push`** + **seed** (include MFA columns)  
3. [ ] **Storage** for document APIs  
4. [ ] **Resend** account + SMTP env (local smoke send)  
5. [ ] **Local smoke** of client / admin / capital-access / chat / email  
6. [ ] **Layero env** mirroring local Resend + Auth URLs  
7. [ ] **Push `main`** → Layero deploy  
8. [ ] **Post-deploy verification** (section J + L)  
9. [ ] Verify custom domain in Resend; switch `EMAIL_FROM` off `onboarding@resend.dev`

---

## L. Email (Resend) — what must work

Mail goes through `lib/email.ts` (nodemailer → Resend SMTP). No separate Resend SDK required.

### Provider setup
- [ ] Resend account created; API key stored only in env as `SMTP_PASS`
- [ ] Local smoke: with `EMAIL_REDIRECT_TO` (or register as account owner) until domain verified
- [ ] Production: domain verified in Resend DNS → set `EMAIL_FROM="SBDV <noreply@your-domain>"` and **remove** `EMAIL_REDIRECT_TO`
- [ ] Same SMTP block set on Layero as in local `.env`

### Product emails (fire-and-forget; failures log server-side)
- [ ] **Capital Access register** → welcome to borrower
- [ ] **Capital Access submit / decision / phase** → borrower (+ admin where implemented)
- [ ] **Facility deposit / documents / bank / repayment** → admin alert + borrower receipt
- [ ] **Membership application** → admin + applicant confirmation
- [ ] **Contact / private inquiry** → `CONTACT_EMAIL`
- [ ] **Forgot password** → reset link
- [ ] **Email MFA** → 6-digit sign-in code (10-minute TTL)

### MFA notes
- [ ] Portal Settings: “Enable email codes” sets `mfaMethod=EMAIL`
- [ ] Authenticator path still sets `mfaMethod=TOTP` + `mfaSecret`
- [ ] Disable MFA clears secret + OTP fields
- [ ] SMS / Twilio deferred (not in this deploy)

---

## Out of scope for this checklist (later)

- Full rewrite to Supabase Auth (magic links / OAuth) instead of NextAuth credentials  
- Twilio / SMS MFA  
- Amvera as primary host (legacy files only)  
- Horizontal multi-instance without sticky sessions (JWT sessions are fine)

---

## Support when something fails

1. Layero build / app logs  
2. Supabase logs (API, Postgres, Storage)  
3. Resend dashboard → Emails (delivery / bounce / domain status)  
4. Confirm Layero env matches Supabase project + Resend key  
5. Re-test `prisma db push` with `DIRECT_URL` after schema changes  
6. Browser network tab for failing `/api/*` routes  
7. If SMTP unset, app logs email bodies in “dev mode” instead of sending — check env first  
