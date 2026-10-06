# SBDV Deployment Checklist

**Target stack:** [Render](https://render.com) (Next.js host) + **Namecheap** (domain/DNS) + **Supabase** (Postgres) + **Resend** (email SMTP)

**Do not commit secrets.** Put real values only in Render Environment, local `.env.local`, or a password manager.

---

## A. Supabase

- [ ] Create project; copy pooler `DATABASE_URL` (port 6543 + `?pgbouncer=true`) and direct `DIRECT_URL` (port 5432)
- [ ] Set anon + service role keys from Project Settings → API
- [ ] From laptop: `npx prisma db push` then `npm run db:seed` against those URLs
- [ ] Change demo passwords before real clients use the app

---

## B. Resend

- [ ] Create API key; SMTP: host `smtp.resend.com`, user `resend`, pass = API key
- [ ] Local/QA: `EMAIL_FROM=SBDV <onboarding@resend.dev>` and optional `EMAIL_REDIRECT_TO` to your Resend account email
- [ ] Go-live: verify domain DNS in Resend → set `EMAIL_FROM=SBDV <noreply@your-domain.com>` → **remove** `EMAIL_REDIRECT_TO`

---

## C. Render

- [ ] New Web Service from the GitHub repo (Docker or Node)
- [ ] If Docker: uses root `Dockerfile` (listens on `PORT`, default 10000)
- [ ] If native Node: Build `npm install && npx prisma generate && npm run build`, Start `npx prisma db push && npm run start`
- [ ] Set environment variables (see section E) — never paste secrets into git
- [ ] After first deploy: open `/en` and `/en/login`
- [ ] Confirm `/api/auth/providers` `callbackUrl` host matches your public site URL

---

## D. Namecheap domain

- [ ] Buy/point domain at Namecheap
- [ ] In Render → Custom Domains, add `your-domain.com` / `www`
- [ ] At Namecheap DNS: CNAME or A records exactly as Render shows
- [ ] Wait for SSL active on Render
- [ ] Update Render env: `AUTH_URL` and `NEXT_PUBLIC_SITE_URL` to `https://www.your-domain.com` (same origin as the browser) → **redeploy**
- [ ] Sign in only on that HTTPS origin

---

## E. Environment variables (Render)

Use placeholders locally in `.env.example`. Real values live only in Render:

```env
NEXT_PUBLIC_SITE_URL=https://www.your-domain.com
AUTH_URL=https://www.your-domain.com
AUTH_TRUST_HOST=true
AUTH_SECRET=<long-random-secret>

DATABASE_URL=<supabase-pooler-url>
DIRECT_URL=<supabase-direct-url>
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon>
SUPABASE_SERVICE_ROLE_KEY=<service-role>

SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASS=<resend-api-key>
EMAIL_FROM=SBDV <noreply@your-domain.com>
CONTACT_EMAIL=ops@your-domain.com
ADMIN_EMAIL=ops@your-domain.com
```

- [ ] `AUTH_URL` === `NEXT_PUBLIC_SITE_URL` === browser origin
- [ ] No Amvera / Layero hostnames left in env
- [ ] Rotate any keys that ever appeared in chat, screenshots, or old committed docs

---

## F. Smoke tests

- [ ] Home `/en` loads
- [ ] Login (seeded admin / client / borrower)
- [ ] Client portal, admin, capital-access register
- [ ] Password reset email via Resend
- [ ] Contact / membership forms

---

## G. Fresh GitHub repo (contributor cleanup)

Old commit history can keep unwanted GitHub contributor attributions. For a clean start:

1. Delete (or archive) the old GitHub repository in GitHub Settings
2. Create a **new empty** repo with the same name under your account (no README/license if you will push an existing tree)
3. Locally create an **orphan** commit (new history, your author email only) and push to the new remote
4. Connect that repo to Render

Do not force-push secrets. Confirm `.env` / `.env.local` are gitignored before the first commit.
