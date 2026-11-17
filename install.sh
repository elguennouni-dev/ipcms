#!/usr/bin/env bash
# =============================================================================
#  ipcms - one-file installer / updater for an aaPanel (Ubuntu) VPS
#
#  Run it INSIDE your site folder:
#      cd /www/wwwroot/ukchanneltv.com
#      bash install.sh
#
#  First run : downloads the project, asks for DB details, creates .env,
#              installs, builds, creates the tables + admin, starts the app.
#  Next runs : pulls the latest code from GitHub, rebuilds and reloads.
# =============================================================================
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/elguennouni-dev/ipcms.git}"
BRANCH="${BRANCH:-main}"
DOMAIN="${DOMAIN:-ukchanneltv.com}"
APP_NAME="ipcms"
PORT="${PORT:-3000}"
APP_DIR="$(pwd)"
UPLOADS_DIR="${UPLOADS_DIR:-${APP_DIR}-uploads}"

c_g=$'\033[1;32m'; c_y=$'\033[1;33m'; c_r=$'\033[1;31m'; c_0=$'\033[0m'
say()  { echo "${c_g}==>${c_0} $*"; }
warn() { echo "${c_y}!!${c_0} $*"; }
die()  { echo "${c_r}ERROR:${c_0} $*" >&2; exit 1; }
ask()  { # ask "Question" "default" -> echoes answer
  local a; read -r -p "$1 [${2:-}]: " a </dev/tty || a=""; echo "${a:-$2}"
}
ask_secret() { local a; read -r -s -p "$1: " a </dev/tty || a=""; echo >&2; echo "$a"; }

[ "$(id -u)" -eq 0 ] || warn "Not running as root. Some steps (installing Node/PM2) may fail."
[ -t 0 ] || [ -e /dev/tty ] || die "This script needs an interactive terminal."

# aaPanel keeps Node here; make it visible to this shell
for d in /www/server/nodejs/*/bin; do [ -d "$d" ] && export PATH="$d:$PATH"; done
export PATH="$PATH:/usr/local/bin:/root/.nvm/versions/node/*/bin"

command -v git >/dev/null || { say "Installing git"; apt-get update -y >/dev/null && apt-get install -y git >/dev/null; }

# ----------------------------------------------------------------------------
# 1. Node.js >= 20
# ----------------------------------------------------------------------------
need_node=1
if command -v node >/dev/null; then
  major="$(node -p 'process.versions.node.split(".")[0]')"
  [ "$major" -ge 20 ] && need_node=0
fi
if [ "$need_node" -eq 1 ]; then
  warn "Node.js 20+ not found."
  if [ "$(ask 'Install Node.js 22 now (apt, NodeSource)? (y/n)' y)" = "y" ]; then
    command -v curl >/dev/null || apt-get install -y curl >/dev/null
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - >/dev/null
    apt-get install -y nodejs >/dev/null
  else
    die "Install Node 20+ from aaPanel (App Store -> Node.js version manager) and run again."
  fi
fi
say "Node $(node -v), npm $(npm -v)"

command -v pm2 >/dev/null || { say "Installing PM2"; npm install -g pm2 >/dev/null 2>&1; }

# ----------------------------------------------------------------------------
# 2. Get / update the code (works in a non-empty aaPanel folder)
# ----------------------------------------------------------------------------
cd "$APP_DIR"
if [ ! -d .git ]; then
  say "Downloading project into $APP_DIR"
  git init -q
  git remote add origin "$REPO_URL"
  git fetch --depth 1 origin "$BRANCH"
  git checkout -q -f -B "$BRANCH" "origin/$BRANCH"
  git branch --set-upstream-to="origin/$BRANCH" "$BRANCH" >/dev/null 2>&1 || true
  FIRST_RUN=1
else
  say "Updating code from GitHub"
  git fetch --depth 1 origin "$BRANCH"
  git reset -q --hard "origin/$BRANCH"
  FIRST_RUN=0
fi
[ -f .env ] || FIRST_RUN=1

# ----------------------------------------------------------------------------
# 3. Configuration (.env) - only asked once
# ----------------------------------------------------------------------------
ADMIN_PASSWORD_SHOWN=""
if [ ! -f .env ]; then
  say "Configuration"
  echo "Create the database first in aaPanel -> Database -> Add database (or let me try below)."
  DB_NAME="$(ask 'Database name' ipcms)"
  DB_USER="$(ask 'Database user' ipcms)"
  DB_PASS="$(ask_secret 'Database password')"
  DB_HOST="$(ask 'Database host' 127.0.0.1)"
  DB_PORT="$(ask 'Database port' 3306)"

  if command -v mysql >/dev/null; then
    if ! MYSQL_PWD="$DB_PASS" mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -e "USE \`$DB_NAME\`" >/dev/null 2>&1; then
      warn "Cannot connect with that user/database."
      if [ "$(ask 'Try to create them with the MySQL root password? (y/n)' y)" = "y" ]; then
        ROOT_PASS="$(ask_secret 'MySQL root password (aaPanel -> Database -> Root password)')"
        MYSQL_PWD="$ROOT_PASS" mysql -h "$DB_HOST" -P "$DB_PORT" -u root <<SQL || die "Could not create the database. Create it in aaPanel and run again."
CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';
CREATE USER IF NOT EXISTS '$DB_USER'@'127.0.0.1' IDENTIFIED BY '$DB_PASS';
GRANT ALL PRIVILEGES ON \`$DB_NAME\`.* TO '$DB_USER'@'localhost';
GRANT ALL PRIVILEGES ON \`$DB_NAME\`.* TO '$DB_USER'@'127.0.0.1';
FLUSH PRIVILEGES;
SQL
        say "Database ready"
      fi
    else
      say "Database connection OK"
    fi
  else
    warn "mysql client not found - skipping the connection test."
  fi

  SITE_URL="$(ask 'Public site URL' "https://$DOMAIN")"
  ADMIN_EMAIL="$(ask 'Admin email' "admin@$DOMAIN")"
  ADMIN_PASSWORD="$(ask_secret 'Admin password (leave empty to generate one)')"
  if [ -z "$ADMIN_PASSWORD" ]; then
    ADMIN_PASSWORD="$(openssl rand -base64 18 | tr -d '/+=' | cut -c1-16)"
    ADMIN_PASSWORD_SHOWN="$ADMIN_PASSWORD"
  fi
  AUTH_SECRET="$(openssl rand -hex 32)"
  ENC_PASS="$(node -e 'console.log(encodeURIComponent(process.argv[1]))' "$DB_PASS")"

  mkdir -p "$UPLOADS_DIR"
  cat > .env <<EOF
DATABASE_URL="mysql://${DB_USER}:${ENC_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
SITE_URL="${SITE_URL}"
AUTH_SECRET="${AUTH_SECRET}"
ADMIN_EMAIL="${ADMIN_EMAIL}"
ADMIN_PASSWORD="${ADMIN_PASSWORD}"
UPLOAD_DIR="${UPLOADS_DIR}"
PORT=${PORT}
EOF
  chmod 600 .env
  say ".env created"
fi
set -a; . ./.env; set +a
mkdir -p "${UPLOAD_DIR:-$UPLOADS_DIR}"
PORT="${PORT:-3000}"

# ----------------------------------------------------------------------------
# 4. Install, database, build
# ----------------------------------------------------------------------------
export NODE_OPTIONS="--max-old-space-size=3072"
export NEXT_TELEMETRY_DISABLED=1

say "Installing dependencies (a few minutes the first time)"
npm ci --no-audit --no-fund

if [ "$FIRST_RUN" -eq 1 ]; then
  say "Creating tables and seeding (admin, plans, sections, legal templates)"
  npm run setup
else
  say "Syncing database schema (non-destructive)"
  npx prisma db push --skip-generate
fi

say "Building the site"
npm run build

# ----------------------------------------------------------------------------
# 5. Start / reload with PM2
# ----------------------------------------------------------------------------
say "Starting the app with PM2 on port $PORT"
if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  PORT="$PORT" pm2 reload "$APP_NAME" --update-env
else
  PORT="$PORT" pm2 start ecosystem.config.cjs
fi
pm2 save >/dev/null
pm2 startup systemd -u root --hp /root >/dev/null 2>&1 || true

sleep 3
if curl -fsS -o /dev/null "http://127.0.0.1:$PORT/"; then say "App is answering on http://127.0.0.1:$PORT"; else warn "App not answering yet - check: pm2 logs $APP_NAME"; fi

# ----------------------------------------------------------------------------
echo
echo "${c_g}==================== DONE ====================${c_0}"
echo "App folder   : $APP_DIR"
echo "Uploads      : ${UPLOAD_DIR:-$UPLOADS_DIR}"
echo "Local URL    : http://127.0.0.1:$PORT"
echo "Admin        : ${SITE_URL:-https://$DOMAIN}/admin   (email: ${ADMIN_EMAIL:-see .env})"
[ -n "$ADMIN_PASSWORD_SHOWN" ] && echo "Admin password (save it now, change it in Settings): ${c_y}$ADMIN_PASSWORD_SHOWN${c_0}"
echo
if [ "$FIRST_RUN" -eq 1 ]; then
cat <<NEXT
Last step in aaPanel (once):
  Website -> $DOMAIN -> Reverse proxy -> Add
    Target URL : http://127.0.0.1:$PORT
    Send domain: \$host
  Then add this line inside that site's Nginx config (Config) so image uploads work:
    client_max_body_size 12m;
  And enable SSL (Let's Encrypt) + Force HTTPS.

To update later: cd $APP_DIR && bash install.sh
NEXT
fi
