# Direct Deployment Guide (No Git Required)

## 🎯 Quick Start - Choose Your Method

### Method 1: Vercel CLI (Easiest - Recommended) ⭐

**Why Vercel?**
- Made by Next.js creators
- Zero configuration needed
- Free SSL automatically
- Global CDN included
- Free tier available

**Steps:**

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Navigate to your project:**
   ```bash
   cd d:\SNOWFLAKE\SBDV\sbdv-site
   ```

3. **Login to Vercel:**
   ```bash
   vercel login
   ```
   (Opens browser for authentication)

4. **Deploy:**
   ```bash
   vercel
   ```
   - Follow the prompts
   - It will ask for project name (press Enter for default)
   - It will detect Next.js automatically

5. **Add Environment Variables:**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Select your project
   - Go to Settings → Environment Variables
   - Add these variables:
     ```
     NEXT_PUBLIC_SITE_URL=https://yourdomain.com
     TELEGRAM_CHAT_1_TOKEN=8258649483:AAGJM9FZrSzTY81fAnDfqHPCUyvw1I2J9Aw
     TELEGRAM_CHAT_1_ID=7635371800
     TELEGRAM_CHAT_2_TOKEN=8490338165:AAEEPzLtLlS92GvMShirGDm6AHMpmloWngk
     TELEGRAM_CHAT_2_ID=7672951117
     ```

6. **Deploy to Production:**
   ```bash
   vercel --prod
   ```

7. **Connect Your Domain:**
   - In Vercel dashboard → Settings → Domains
   - Add your domain
   - Update DNS records as instructed

**To Update Your Site Later:**
```bash
# Make changes to your code
# Then deploy again
vercel --prod
```

---

### Method 2: Netlify CLI

**Steps:**

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Navigate to project:**
   ```bash
   cd d:\SNOWFLAKE\SBDV\sbdv-site
   ```

3. **Login:**
   ```bash
   netlify login
   ```

4. **Build and Deploy:**
   ```bash
   npm run build
   netlify deploy --prod
   ```

5. **Add Environment Variables:**
   - Go to Netlify dashboard → Site settings → Environment variables
   - Add all required variables

---

### Method 3: Traditional Hosting (cPanel, Shared Hosting, VPS)

**Prerequisites:**
- Hosting with Node.js support
- SSH access (recommended)
- Or FTP/SFTP access

**Steps:**

1. **Build locally:**
   ```bash
   cd d:\SNOWFLAKE\SBDV\sbdv-site
   npm run build
   ```

2. **Create deployment package:**
   - Zip the entire project folder (except `node_modules`)
   - Or use FTP/SFTP to upload files

3. **Upload to server:**
   - Via FTP: Upload all files maintaining folder structure
   - Via SSH: Use `scp` or `rsync`

4. **On your server, install dependencies:**
   ```bash
   npm install --production
   ```

5. **Set environment variables:**
   - Create `.env.production` file on server
   - Or set in hosting control panel

6. **Start the server:**
   ```bash
   # Using PM2 (recommended)
   npm install -g pm2
   pm2 start npm --name "sbdv-site" -- start
   pm2 save
   pm2 startup
   ```

7. **Configure reverse proxy (Nginx/Apache):**
   - Point domain to `localhost:3000`
   - Set up SSL certificate

---

## 🔄 Updating Your Site (After Initial Deployment)

### Vercel:
```bash
vercel --prod
```

### Netlify:
```bash
npm run build
netlify deploy --prod
```

### Traditional Hosting:
1. Make changes locally
2. Build: `npm run build`
3. Upload changed files via FTP/SSH
4. Restart server: `pm2 restart sbdv-site`

---

## ✅ Post-Deployment Checklist

After deploying, verify:

- [ ] Site loads at your domain
- [ ] HTTPS/SSL works (no warnings)
- [ ] Contact form sends to Telegram
- [ ] Membership form sends to Telegram
- [ ] Language switcher works
- [ ] All pages load correctly
- [ ] Mobile view works
- [ ] Images display properly

---

## 🆘 Troubleshooting

**"Environment variables not working"**
- Check they're set in hosting platform
- Restart server/rebuild after adding variables

**"Forms not sending to Telegram"**
- Verify bot tokens are correct
- Check API route logs
- Test API endpoint directly

**"Build fails"**
- Run `npm run build` locally first
- Check for TypeScript errors
- Ensure all dependencies installed

---

## 💡 Pro Tips

1. **Test locally first:** Always run `npm run build` and `npm run start` before deploying
2. **Keep a backup:** Copy your entire project folder before major changes
3. **Document your setup:** Write down your deployment steps for future reference
4. **Monitor logs:** Check server logs if something doesn't work

---

**Recommended:** Use Vercel CLI for the easiest deployment experience!

