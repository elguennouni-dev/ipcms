# ipcms

SEO-first website + custom CMS for a UK streaming-subscription reseller.

- **Stack:** Next.js 15 (App Router, server-rendered HTML) · TypeScript · Prisma · **PostgreSQL** · sharp (image optimisation)
- **Public site:** home page with plans, 24h free trial, order form (stored in DB, WhatsApp ordering), legal pages incl. DMCA, sitemap.xml, robots.txt, JSON-LD (Organization, WebSite, FAQ, Product offers), cookie consent (GA4 loads only after consent).
- **Admin CMS** (`/admin`): orders, plans & prices, show/hide/reorder sections, hero text, FAQ, reviews, media library (auto WebP), legal pages + DMCA inbox, SEO & analytics, settings, PayPal switch (off by default).

## Local development

```bash
cp .env.example .env        # fill DATABASE_URL, AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm install
npm run setup               # prisma generate + create tables + seed (admin, plans, sections, legal templates)
npm run dev                 # http://localhost:3000  ·  admin: /admin
```

## Deploy on your VPS with aaPanel (Ubuntu)

1. **aaPanel → App Store**: install *Nginx*, *PostgreSQL*, *Node.js version manager* (Node 20 or 22) and *PM2 manager*.
2. **Database → Add database**: name `ipcms`, user `ipcms`, set a password. Copy it.
3. **Website → Add site** with your domain (PHP: pure static). Then **SSL → Let's Encrypt** (force HTTPS).
4. **SSH into the server** and clone the repo:
   ```bash
   cd /www/wwwroot
   git clone https://github.com/elguennouni-dev/ipcms.git
   cd ipcms
   cp .env.example .env && nano .env      # fill every value (see below)
   mkdir -p /www/wwwroot/ipcms-uploads    # uploaded images live here, outside the git folder
   npm ci
   npm run setup                          # tables + seed
   npm run build
   npm i -g pm2 && pm2 start ecosystem.config.cjs && pm2 save && pm2 startup
   ```
5. **Website → your site → Reverse proxy → Add**: target URL `http://127.0.0.1:3000`, send domain `$host`. In the reverse-proxy config add `client_max_body_size 12m;` so image uploads work.
6. Open `https://yourdomain/admin`, sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`, then **change the password** in *Settings*.

### Environment (`.env`)

| Variable | Meaning |
|---|---|
| `DATABASE_URL` | `postgresql://ipcms:PASSWORD@127.0.0.1:5432/ipcms?schema=public` |
| `SITE_URL` | `https://yourdomain.co.uk` (canonical URLs, sitemap, Open Graph) |
| `AUTH_SECRET` | long random string: `openssl rand -hex 32` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | first admin account (created by the seed) |
| `UPLOAD_DIR` | folder for uploaded images, e.g. `/www/wwwroot/ipcms-uploads` |

### Updating later

After you (or Claude) push changes to GitHub:

```bash
cd /www/wwwroot/ipcms && bash deploy/deploy.sh
```

That pulls, installs, syncs the DB schema (never drops data), rebuilds and reloads with zero manual steps. Optional: set the repo variable `AUTO_DEPLOY=true` and the secrets listed in `.github/workflows/deploy.yml` to deploy automatically on every push.

### Backups

```bash
pg_dump -U ipcms -h 127.0.0.1 ipcms > backup-$(date +%F).sql
```
Also back up `UPLOAD_DIR`. aaPanel can schedule both under **Cron**.

## After launch (SEO checklist)

1. *Admin → SEO*: set title, description, upload the **Social share image** and **Logo** in *Media*.
2. Add the domain to **Google Search Console**, paste the verification code in *Admin → SEO*, submit `/sitemap.xml`.
3. Replace every `[bracketed]` placeholder in *Admin → Legal & DMCA* and have the legal texts reviewed by a solicitor.
4. Use only images you are licensed to use. Publish helpful content (setup guides per device) as it is the main driver of organic traffic.

## Roadmap

- PayPal checkout (the switch and key fields already exist in *Settings*)
- Guides/blog pages managed from the admin
- Email/WhatsApp notification on new order
