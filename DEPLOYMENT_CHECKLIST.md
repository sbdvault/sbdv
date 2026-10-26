# SBDV Deployment Checklist

**Target stack:** [Vercel](https://vercel.com) (Next.js) + **Namecheap** (`sbdvault.com`) + **Supabase** (Postgres) + **Resend** (email)

**Do not commit secrets.** Put real values only in Vercel → Settings → Environment Variables, local `.env.local`, or a password manager.

Canonical public origin: `https://www.sbdvault.com`  
Admin origin: `https://admin.sbdvault.com` (same Vercel project)

---

## A. Supabase

- [ ] Create project; copy pooler `DATABASE_URL` (port 6543 + `?pgbouncer=true`) and direct `DIRECT_URL` (port 5432)
- [ ] Set anon + service role keys from Project Settings → API
- [ ] From laptop: `npx prisma db push` then `npm run db:seed` against those URLs
- [ ] Change demo passwords before real clients use the app

---

## B. Vercel project

- [ ] Import the GitHub repo (`sbdvault/sbdv`) as a Vercel project
- [ ] Root directory: `sbdv-site` if the repo has that folder
- [ ] Framework: Next.js (build already runs `prisma generate && next build`)
- [ ] Set environment variables (section E) for Production (and Preview if you want mail/auth there)
- [ ] Deploy, then add custom domains **before** changing `AUTH_URL` away from the `*.vercel.app` URL

---

## C. Namecheap DNS → Vercel

In Vercel → Project → Settings → Domains, add all three:

1. `www.sbdvault.com` (primary / canonical)
2. `sbdvault.com` (redirect to `www.sbdvault.com`)
3. `admin.sbdvault.com` (required — admin login is host-only cookies)

Use the records Vercel displays. Typical Namecheap Advanced DNS:

| Type  | Host  | Value                 |
| ----- | ----- | --------------------- |
| A     | `@`   | `10.0.1.2`       |
| CNAME | `www` | `cname.vercel-dns.com` |
| CNAME | `admin` | `cname.vercel-dns.com` |

Wait until Vercel shows SSL issued for all three. Do not use `admin.www.sbdvault.com`.

---

## D. Resend

- [ ] API key → Vercel `SMTP_PASS` (SMTP host `smtp.resend.com`, user `resend`, port `465`)
- [ ] Domains → add `sbdvault.com` → paste the SPF, DKIM, and (if shown) MX / DMARC records into Namecheap
- [ ] Wait until Resend marks the domain **Verified**
- [ ] Set `EMAIL_FROM=SBDV <noreply@sbdvault.com>`
- [ ] **Remove** `EMAIL_REDIRECT_TO` in production (that flag dumps all mail to one inbox)

Until the domain is verified, keep `EMAIL_FROM=SBDV <onboarding@resend.dev>` and `EMAIL_REDIRECT_TO` pointed at your Resend account email.

---

## E. Vercel environment (Production)

```env
NEXT_PUBLIC_SITE_URL=https://www.sbdvault.com
AUTH_URL=https://www.sbdvault.com
AUTH_TRUST_HOST=true
AUTH_SECRET=<long-random-secret>
NEXT_PUBLIC_ADMIN_URL=https://admin.sbdvault.com
ACCOUNT_HOLDER_EMAIL=admin@sbdv.swiss

DATABASE_URL=<supabase-pooler-url>
DIRECT_URL=<supabase-direct-url>
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon>
SUPABASE_SERVICE_ROLE_KEY=<service-role>

SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASS=<resend-api-key>
EMAIL_FROM=SBDV <noreply@sbdvault.com>
CONTACT_EMAIL=info@sbdvault.com
ADMIN_EMAIL=ops@sbdvault.com
```

- [ ] `AUTH_URL` === `NEXT_PUBLIC_SITE_URL` === `https://www.sbdvault.com`
- [ ] Redeploy after changing any `NEXT_PUBLIC_*` value
- [ ] Sign in only on `https://www.sbdvault.com/en/login` (public) or `https://admin.sbdvault.com/login` (admin)
- [ ] Seeded account holder remains `admin@sbdv.swiss` unless you change `ACCOUNT_HOLDER_EMAIL` and the user row

---

## F. Smoke tests

- [ ] `https://www.sbdvault.com/en` loads
- [ ] `https://sbdvault.com` redirects to www
- [ ] Client login on www → portal
- [ ] Admin login on www as `admin@sbdv.swiss` → lands on `https://admin.sbdvault.com`
- [ ] `https://admin.sbdvault.com` (signed out) → admin login, not the public site
- [ ] Password reset email from `noreply@sbdvault.com` (check spam once)
- [ ] Contact / membership / wealth register emails

---

## G. Fresh GitHub repo (contributor cleanup)

Old commit history can keep unwanted GitHub contributor attributions. For a clean start:

1. Delete (or archive) the old GitHub repository in GitHub Settings
2. Create a **new empty** repo with the same name under your account (no README/license if you will push an existing tree)
3. Locally create an **orphan** commit (new history, your author email only) and push to the new remote
4. Connect that repo to Vercel

Do not force-push secrets. Confirm `.env` / `.env.local` are gitignored before the first commit.
