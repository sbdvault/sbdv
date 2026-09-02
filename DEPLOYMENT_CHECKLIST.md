# SBDV Deployment Checklist

**Target stack:** [Amvera Cloud](https://amvera.ru/) (Next.js host) + **Supabase** (Postgres, Storage, seeds, portal data, chatbot context)

**Last updated:** 2026-08-26

Use this as the working todo list. Check items off as you complete them. Do not commit real secrets — use the Amvera / Supabase dashboards or a local `.env` that stays gitignored.

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

- [ ] Switch Prisma datasource in `prisma/schema.prisma` from `sqlite` → `postgresql`
- [ ] Add `DIRECT_URL` to schema if using pooler (`url` + `directUrl`)
- [ ] Update `.env.example` with Supabase + Amvera variables (placeholders only)
- [ ] Set local `.env` / `.env.local` to point at Supabase for testing
- [ ] Run `npx prisma db push` (or migrate) against Supabase
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
- [ ] Emails still via SMTP env (optional); status data always from Supabase

### Auth (keep NextAuth for this deploy)
- [ ] Credentials provider still validates `passwordHash` from Supabase `User` table
- [ ] Role redirects unchanged: ADMIN / CLIENT / BORROWER
- [ ] `AUTH_SECRET` set in production
- [ ] Never expose `DATABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` to the browser

---

## D. Chatbot structured on Supabase

- [ ] Confirm `lib/chat-context.ts` loads guest / CLIENT / BORROWER / ADMIN context via Prisma → Supabase
- [ ] Confirm personalized answers (portfolio, application status, deposit, admin queues) work against seeded Supabase data
- [ ] Guest flow still works (no account) without leaking other users’ data
- [ ] Optional: add `ChatSession` / `ChatMessage` Prisma models + migrate to Supabase for conversation audit
- [ ] Optional: set `OPENAI_API_KEY` (Amvera can proxy OpenAI); rule-based engine remains fallback
- [ ] Smoke-test quick prompts per role after seed

---

## E. Amvera hosting (Next.js app)

- [ ] Create Amvera account and top up (recommend **Начальный Плюс** or **Стандартный** for Next builds)
- [ ] Create Application project (Docker / Node), choose region (Warsaw preferred for OpenAI reach)
- [ ] Add repo files for deploy:
  - [ ] `Dockerfile` (multi-stage, Next standalone)
  - [ ] `amvera.yaml` (`containerPort: 3000`)
  - [ ] `.dockerignore`
  - [ ] `output: "standalone"` in `next.config.ts`
- [ ] Init git in `sbdv-site` (if not already)
- [ ] Add Amvera Git remote from Amvera UI
- [ ] Push: `git push amvera HEAD:master`
- [ ] Set Amvera **Variables / Secrets** (see section G)
- [ ] Confirm build succeeds in Amvera logs
- [ ] Confirm app status “running” and public URL opens `/en`

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
- [ ] Contact / membership Telegram forms work (if tokens configured)
- [ ] Login + each portal works against Supabase
- [ ] Chat widget works (guest + logged-in)

---

## G. Environment variables (production)

Set in **Amvera** (and mirror locally in `.env` for seed/migrate). Never commit real values.

```env
# Public site
NEXT_PUBLIC_SITE_URL=https://YOUR-AMVERA-HOST

# Auth
AUTH_SECRET=generate-a-long-random-secret

# Supabase / Prisma
DATABASE_URL=postgresql://...pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://...supabase.com:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email (required for live contact form delivery to inbox)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=sbdvault@gmail.com
SMTP_PASS=your-gmail-app-password
EMAIL_FROM=SBDV <sbdvault@gmail.com>
CONTACT_EMAIL=sbdvault@gmail.com
ADMIN_EMAIL=sbdvault@gmail.com

# Escrow (Capital Access)
ESCROW_BANK_NAME=
ESCROW_ACCOUNT_NAME=
ESCROW_IBAN=
ESCROW_SWIFT=

# Telegram (optional mirror for contact / membership forms)
TELEGRAM_CHAT_1_TOKEN=
TELEGRAM_CHAT_1_ID=
TELEGRAM_CHAT_2_TOKEN=
TELEGRAM_CHAT_2_ID=

# Chatbot (optional)
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```

- [ ] All required vars set in Amvera
- [ ] `.env*` listed in `.gitignore`
- [ ] Rotate any tokens that were previously committed in docs

---

## H. Domain, SEO, security

- [ ] Start on Amvera subdomain; note public URL in `NEXT_PUBLIC_SITE_URL`
- [ ] Later: attach custom domain in Amvera + DNS (A/CNAME) + SSL
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
- [ ] Export/backup strategy: Supabase dashboard dump + Amvera config notes

---

## J. Post-deploy verification

### Public
- [ ] `/en` homepage loads
- [ ] Marketing pages + language switcher
- [ ] Contact / membership forms → Telegram
- [ ] Chatbot guest: services / get started (no deposit leak)

### Client
- [ ] Login → `/portal`
- [ ] Portfolio + holdings from Supabase
- [ ] Document upload → Storage
- [ ] Chat: “Summarize my portfolio”

### Capital Access
- [ ] Login → `/capital-access/portal`
- [ ] Applications / facility from Supabase
- [ ] Chat: “What's my application status?” / payment follow-ups

### Admin
- [ ] Login → `/admin`
- [ ] Registry, directives, applications, capital-access queues from Supabase
- [ ] Chat: pending / queue summary

### Resilience
- [ ] Redeploy Amvera app; Supabase data still present
- [ ] Uploaded files still reachable via Storage

---

## K. Implementation order (recommended)

1. [ ] **Supabase project** + connection strings  
2. [ ] **Prisma → PostgreSQL** + `db push` + **seed**  
3. [ ] **Storage** for document APIs  
4. [ ] **Local smoke** of client / admin / capital-access / chat  
5. [ ] **Docker + amvera.yaml**  
6. [ ] **Amvera env** + **git push**  
7. [ ] **Post-deploy verification** (section J)  
8. [ ] Custom domain (optional follow-up)

---

## Out of scope for this checklist (later)

- Full rewrite to Supabase Auth (magic links / OAuth) instead of NextAuth credentials  
- Amvera Managed PostgreSQL (we use Supabase instead)  
- Horizontal multi-instance without sticky sessions (JWT sessions are fine)

---

## Support when something fails

1. Amvera build / app logs  
2. Supabase logs (API, Postgres, Storage)  
3. Confirm env vars on Amvera match Supabase project  
4. Re-test `prisma db push` and seed with `DIRECT_URL`  
5. Browser network tab for failing `/api/*` routes  
