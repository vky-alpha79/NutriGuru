# NutriGuru — Ubuntu (GCP) Setup Guide

Complete setup for deploying NutriGuru on an Ubuntu VM on Google Cloud Platform.

---

## 1. GCP VM Provisioning

### Create the VM

```bash
gcloud compute instances create nutriguru-vm \
  --zone=asia-south1-a \
  --machine-type=e2-medium \
  --image-family=ubuntu-2404-lts-amd64 \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=40GB \
  --tags=http-server,https-server
```

Minimum specs: 2 vCPU, 4 GB RAM, 40 GB disk. Use `e2-standard-4` (4 vCPU / 16 GB) if running Ollama locally.

### Firewall rules

```bash
gcloud compute firewall-rules create allow-http \
  --direction=INGRESS --priority=1000 --network=default \
  --action=ALLOW --rules=tcp:80,tcp:443 --target-tags=http-server

gcloud compute firewall-rules create allow-https \
  --direction=INGRESS --priority=1000 --network=default \
  --action=ALLOW --rules=tcp:443 --target-tags=https-server
```

### SSH into the VM

```bash
gcloud compute ssh nutriguru-vm --zone=asia-south1-a
```

---

## 2. System Dependencies

```bash
sudo apt update && sudo apt upgrade -y

# Python 3.11+
sudo apt install -y python3 python3-pip python3-venv python3-dev

# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PostgreSQL 16
sudo apt install -y postgresql postgresql-contrib

# Redis
sudo apt install -y redis-server

# WeasyPrint system dependencies (PDF generation)
sudo apt install -y \
  libpango-1.0-0 libpangocairo-1.0-0 libgdk-pixbuf2.0-0 \
  libffi-dev libcairo2 libcairo2-dev pkg-config \
  libgirepository1.0-dev gir1.2-pango-1.0

# Nginx (reverse proxy)
sudo apt install -y nginx

# Git
sudo apt install -y git
```

Verify versions:

```bash
python3 --version    # 3.11+
node --version       # 20+
psql --version       # 16+
redis-cli ping       # PONG
nginx -v
```

---

## 3. PostgreSQL Setup

```bash
sudo -u postgres psql
```

Inside the psql shell:

```sql
CREATE USER nutriguru WITH PASSWORD 'your-strong-db-password';
CREATE DATABASE nutriguru OWNER nutriguru;
GRANT ALL PRIVILEGES ON DATABASE nutriguru TO nutriguru;
\q
```

Enable remote connections if needed (edit `/etc/postgresql/16/main/pg_hba.conf`), then restart:

```bash
sudo systemctl restart postgresql
sudo systemctl enable postgresql
```

---

## 4. Redis Setup

```bash
sudo systemctl start redis-server
sudo systemctl enable redis-server
redis-cli ping   # Should return PONG
```

---

## 5. Ollama (Local LLM — Optional)

Only needed if using the Gemma 4 local fallback model.

```bash
curl -fsSL https://ollama.com/install.sh | sh

# Pull the Gemma 4 model
ollama pull gemma4

# Verify it's running
curl http://localhost:11434/api/tags
```

Ollama runs as a systemd service automatically after install. To also pull Nemotron locally:

```bash
ollama pull nemotron-cascade-2
```

---

## 6. Clone & Deploy the Application

### Clone the repository

```bash
cd /opt
sudo mkdir nutriguru && sudo chown $USER:$USER nutriguru
cd nutriguru

# Copy files from your local machine, or clone from git:
# git clone <your-repo-url> .

# If transferring from local machine:
# gcloud compute scp --recurse ./nutriguru/* nutriguru-vm:/opt/nutriguru/ --zone=asia-south1-a
```

### Backend setup

```bash
cd /opt/nutriguru/backend

python3 -m venv venv
source venv/bin/activate

pip install --upgrade pip
pip install -r requirements.txt
```

### Configure environment

```bash
cp .env.example .env
nano .env
```

Fill in the `.env` file:

```bash
# Model APIs
ANTHROPIC_API_KEY=sk-ant-your-key-here
OLLAMA_CLOUD_ENDPOINT=https://your-ollama-cloud-endpoint
OLLAMA_LOCAL_ENDPOINT=http://localhost:11434

# Lakera Guard
LAKERA_GUARD_API_KEY=lk-your-key-here
LAKERA_PROJECT_ID=project-1344722930
LAKERA_REGION=ap-southeast-1

# App
DATABASE_URL=postgresql+asyncpg://nutriguru:your-strong-db-password@localhost:5432/nutriguru
DATABASE_URL_SYNC=postgresql://nutriguru:your-strong-db-password@localhost:5432/nutriguru
REDIS_URL=redis://localhost:6379/0
JWT_SECRET=generate-a-64-char-random-string
APP_ENV=production

# Defaults
LAKERA_DEFAULT_MODE=FULL_ENFORCE
SECURE_MODE_DEFAULT=true
```

Generate a secure JWT secret:

```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

### Database migration

Create the tables. From the backend directory with the venv active:

```bash
python3 -c "
from sqlalchemy import create_engine
from app.db.database import Base
from app.models.user import User
from app.models.plan import Challenge, MealPlan, ProgressEntry
from app.models.audit import AuditEvent
import os

url = os.environ.get('DATABASE_URL_SYNC', 'postgresql://nutriguru:your-strong-db-password@localhost:5432/nutriguru')
engine = create_engine(url)
Base.metadata.create_all(engine)
print('Tables created successfully')
"
```

### Frontend build

```bash
cd /opt/nutriguru/frontend

npm install
npm run build
```

This produces a `dist/` folder with the static production build.

---

## 7. Systemd Services

### Backend API service

```bash
sudo nano /etc/systemd/system/nutriguru-api.service
```

```ini
[Unit]
Description=NutriGuru FastAPI Backend
After=network.target postgresql.service redis-server.service
Requires=postgresql.service redis-server.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/nutriguru/backend
Environment=PATH=/opt/nutriguru/backend/venv/bin:/usr/bin
EnvironmentFile=/opt/nutriguru/backend/.env
ExecStart=/opt/nutriguru/backend/venv/bin/uvicorn app.main:app \
  --host 127.0.0.1 \
  --port 8000 \
  --workers 4 \
  --log-level info
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

### Enable and start

```bash
sudo systemctl daemon-reload
sudo systemctl enable nutriguru-api
sudo systemctl start nutriguru-api

# Verify it's running
sudo systemctl status nutriguru-api
curl http://localhost:8000/health
```

Expected response: `{"status":"ok","service":"nutriguru-api","version":"2.0.0"}`

---

## 8. Nginx Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/nutriguru
```

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain or VM external IP

    # Frontend — static files
    root /opt/nutriguru/frontend/dist;
    index index.html;

    # API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
        proxy_connect_timeout 10s;
    }

    # Health check passthrough
    location /health {
        proxy_pass http://127.0.0.1:8000;
    }

    # SPA fallback — all other routes serve index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
    gzip_min_length 256;

    client_max_body_size 10M;
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/nutriguru /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## 9. SSL/TLS with Let's Encrypt (Production)

Skip this if using only the VM's external IP for testing.

```bash
sudo apt install -y certbot python3-certbot-nginx

sudo certbot --nginx -d your-domain.com
```

Certbot will automatically update the Nginx config to redirect HTTP to HTTPS. Auto-renewal is set up via a systemd timer.

Verify auto-renewal:

```bash
sudo certbot renew --dry-run
```

After SSL is active, update the CORS origin in the backend. Edit `/opt/nutriguru/backend/app/main.py` and change `allow_origins` to include your domain:

```python
allow_origins=["https://your-domain.com"]
```

Then restart:

```bash
sudo systemctl restart nutriguru-api
```

---

## 10. Verification Checklist

Run through each check after setup:

```bash
# 1. PostgreSQL
sudo -u postgres psql -c "SELECT datname FROM pg_database WHERE datname='nutriguru';"

# 2. Redis
redis-cli ping

# 3. Backend health
curl http://localhost:8000/health

# 4. Nginx serves frontend
curl -s http://localhost | head -5

# 5. API through Nginx
curl http://localhost/api/v1/models/health

# 6. Ollama (if installed)
curl http://localhost:11434/api/tags

# 7. Full external access (from your local machine)
curl http://<VM_EXTERNAL_IP>/health
```

---

## 11. Monitoring & Logs

### View service logs

```bash
# Backend API logs
sudo journalctl -u nutriguru-api -f

# Nginx access/error logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-16-main.log

# Redis logs
sudo tail -f /var/log/redis/redis-server.log
```

### Restart services

```bash
sudo systemctl restart nutriguru-api
sudo systemctl restart nginx
sudo systemctl restart postgresql
sudo systemctl restart redis-server
```

---

## 12. Updating the Application

```bash
cd /opt/nutriguru

# Pull latest code
# git pull origin main

# Backend: update deps + restart
cd backend
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart nutriguru-api

# Frontend: rebuild static files
cd ../frontend
npm install
npm run build
# No restart needed — Nginx serves the new dist/ files immediately
```

---

## Appendix: Port Reference

| Service       | Port  | Bind        | Notes                          |
|---------------|-------|-------------|--------------------------------|
| Nginx         | 80    | 0.0.0.0     | Public HTTP (redirects to 443) |
| Nginx         | 443   | 0.0.0.0     | Public HTTPS                   |
| FastAPI       | 8000  | 127.0.0.1   | Internal only, behind Nginx    |
| PostgreSQL    | 5432  | 127.0.0.1   | Internal only                  |
| Redis         | 6379  | 127.0.0.1   | Internal only                  |
| Ollama        | 11434 | 127.0.0.1   | Internal only (if installed)   |

## Appendix: GCP Costs (Estimate)

| Resource               | Spec             | Monthly (approx) |
|------------------------|------------------|-------------------|
| e2-medium VM           | 2 vCPU / 4 GB    | $25               |
| 40 GB SSD boot disk    | pd-balanced      | $7                |
| Static external IP     |                  | $3                |
| Egress (moderate)      | ~50 GB/month     | $6                |
| **Total**              |                  | **~$41/month**    |

For local LLM (Ollama) use `e2-standard-4` (4 vCPU / 16 GB) at ~$97/month, or `g2-standard-4` with GPU for faster inference.
