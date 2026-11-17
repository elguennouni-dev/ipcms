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

## Blog, guides, FAQ and SEO toolkit

- **Admin → Blog & guides**: write articles in Markdown with a live SEO score (focus keyword, title/description length, headings, links, alt text). Choose type *guide* (`/guides/slug`) or *blog* (`/blog/slug`), add a cover, per-article FAQ (FAQPage schema) and schedule by setting a future publish date.
- **Public pages**: `/guides`, `/blog`, `/faq`, plus "Setup guides" and "Latest from the blog" sections on the home page (reorder or hide them in Admin → Sections).
- **Admin → SEO**: titles/descriptions, Google/Bing verification codes, schema toggle, crawler rules, AI-bot rules, IndexNow, and editors for `robots.txt`, `llms.txt`, `agents.txt`, `humans.txt`, `security.txt`.
- **Generated automatically**: `/sitemap.xml`, `/feed.xml` (RSS), `/robots.txt`, `/llms.txt`, `/agents.txt`, `/humans.txt`, `/.well-known/security.txt`.
- **Admin → Redirects**: 301/302 redirects and a 404 monitor.
- Notes: `agents.txt` is an emerging, non-enforced convention. IndexNow notifies Bing and others, not Google — submit the sitemap in Google Search Console.
- Starter guides/articles/FAQs are seeded once (`contentSeeded` setting); deleting them is permanent. Re-running `bash install.sh` is safe.

## Security

Built in: login lockout (5 failed tries per IP or email = 15 min lock), optional 2-step login (authenticator app) in Admin → Settings, 8-hour sessions that are revoked server-side on password change or "sign out everywhere", `__Host-` strict cookie, CSP / HSTS / frame and sniffing protection, same-origin checks on uploads, images re-encoded to WebP (nothing executable is stored), honeypot + rate limits on public forms, app listening on 127.0.0.1 only.

Server side checklist (aaPanel):
1. Firewall: allow only 22, 80, 443. Do **not** open port 3000 or the database port 5432.
2. Enable SSL (Let's Encrypt) and "Force HTTPS" on the site.
3. SSH: key login only, and install fail2ban (aaPanel → Security).
4. Keep `AUTH_SECRET` (in `.env`) secret and 32+ characters. Turn on 2-step login after your first login.
5. Back up the database daily (aaPanel → Cron) and keep OS updates on.
6. Optional: in the site's nginx config restrict `/admin` to your own IP with `allow x.x.x.x; deny all;`.
