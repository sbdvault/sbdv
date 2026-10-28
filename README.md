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
