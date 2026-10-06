# Swiss Bullion Depository Vault (SBDV)

Next.js institutional site + client portal, admin platform, and Capital Access borrower portal.

## Stack

- **App:** Next.js 16 (App Router)
- **Auth:** Auth.js (credentials + MFA)
- **Database:** Supabase Postgres (Prisma)
- **Email:** Resend (SMTP)
- **Host:** Render
- **Domain:** Namecheap DNS → Render custom domain

See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for go-live steps. Use [.env.example](./.env.example) as a template; never commit real secrets.

## Local development

```bash
cp .env.example .env.local
# fill in Supabase + Resend + AUTH_SECRET
npm install
npx prisma db push
npm run db:seed
npm run dev
```

Open [http://localhost:3000/en](http://localhost:3000/en).
