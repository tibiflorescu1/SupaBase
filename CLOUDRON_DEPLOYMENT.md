# Deployment pe Cloudron

Acest ghid te ajută să instalezi aplicația Vehicle Graphics Pricing pe serverul tău Cloudron privat.

## 🎯 Opțiuni de Deployment

### Opțiunea 1: Cu Supabase (Recomandat)
- **Avantaje**: Backup automat, scaling, management ușor
- **Dezavantaje**: Dependență externă, costuri pentru volume mari

### Opțiunea 2: Cu PostgreSQL Local
- **Avantaje**: Control complet, fără dependențe externe
- **Dezavantaje**: Backup manual, management complex

## 🚀 Instalare Rapidă (Supabase)

### 1. Pregătire
```bash
# Clonează repo-ul
git clone https://github.com/username/vehicle-graphics-pricing.git
cd vehicle-graphics-pricing

# Copiază variabilele de mediu
cp .env.example .env
```

### 2. Configurare Supabase
```bash
# Editează .env cu datele tale Supabase
nano .env
```

### 3. Instalare pe Cloudron
```bash
# Opțiunea A: Custom App (Simplu)
cloudron install --image cloudron/app:nodejs \
    --location vehicle-graphics \
    --env-file .env

# Opțiunea B: Docker Build (Avansat)
docker build -t vehicle-graphics .
cloudron install --image vehicle-graphics \
    --location vehicle-graphics
```

## 🐳 Instalare cu Docker Compose

### 1. Configurare
```bash
# Editează docker-compose.yml cu setările tale
nano docker-compose.yml

# Setează variabilele de mediu
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_ANON_KEY="your-anon-key"
```

### 2. Rulare
```bash
# Pornește serviciile
docker-compose up -d

# Verifică statusul
docker-compose ps

# Vezi logs
docker-compose logs -f vehicle-graphics-app
```

## 🗄️ Setup PostgreSQL Local (Alternativă)

### 1. Configurare Bază de Date
```bash
# Pornește doar PostgreSQL
docker-compose up -d postgres

# Verifică conexiunea
docker-compose exec postgres psql -U postgres -d vehicle_graphics -c "\dt"
```

### 2. Rulează Migrațiile
```bash
# Copiază migrațiile în container
docker-compose exec postgres psql -U postgres -d vehicle_graphics -f /docker-entrypoint-initdb.d/your-migration.sql
```

### 3. Configurare Aplicație
```bash
# Actualizează .env pentru PostgreSQL local
DATABASE_URL=postgresql://postgres:password@localhost:5432/vehicle_graphics

# Restart aplicația
docker-compose restart vehicle-graphics-app
```

## ⚙️ Configurare Cloudron

### 1. Variabile de Mediu
În Cloudron Dashboard → Apps → Vehicle Graphics → Configure:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
NODE_ENV=production
```

### 2. Domeniu Custom
```bash
# Setează domeniu custom
cloudron configure --location vehicle-graphics --domain your-domain.com
```

### 3. SSL Certificate
```bash
# Cloudron gestionează automat SSL
# Verifică în Dashboard → Domains
```

## 🔧 Troubleshooting

### Probleme Comune

#### 1. Aplicația nu pornește
```bash
# Verifică logs
cloudron logs --app vehicle-graphics

# Verifică variabilele de mediu
cloudron exec --app vehicle-graphics env | grep VITE
```

#### 2. Erori de conexiune la DB
```bash
# Testează conexiunea Supabase
curl -H "apikey: YOUR_ANON_KEY" \
     "https://your-project.supabase.co/rest/v1/categorii?select=*"

# Pentru PostgreSQL local
docker-compose exec postgres pg_isready
```

#### 3. Build errors
```bash
# Rebuild aplicația
docker-compose build --no-cache vehicle-graphics-app
docker-compose up -d
```

### Logs și Monitoring
```bash
# Logs aplicație
cloudron logs --app vehicle-graphics --follow

# Logs PostgreSQL (dacă local)
docker-compose logs -f postgres

# Status servicii
docker-compose ps
```

## 📊 Backup și Restore

### Supabase (Automat)
- Backup-urile se fac automat în Supabase
- Export manual din Dashboard → Database → Backups

### PostgreSQL Local
```bash
# Backup
docker-compose exec postgres pg_dump -U postgres vehicle_graphics > backup.sql

# Restore
docker-compose exec -T postgres psql -U postgres vehicle_graphics < backup.sql
```

## 🔒 Securitate

### 1. Firewall
```bash
# Doar porturile necesare
ufw allow 80/tcp
ufw allow 443/tcp
ufw deny 3000/tcp  # Nu expune direct
```

### 2. Environment Variables
- Nu pune niciodată chei în cod
- Folosește Cloudron Secrets pentru date sensibile
- Rotește cheile periodic

### 3. Updates
```bash
# Update aplicație
git pull origin main
docker-compose build --no-cache
docker-compose up -d

# Update Cloudron
cloudron update
```

## 📈 Performance

### 1. Caching
```bash
# Nginx reverse proxy (Cloudron default)
# Static files cached automat
```

### 2. Database Optimization
```sql
-- Index-uri pentru performanță
CREATE INDEX IF NOT EXISTS idx_vehicule_producator ON vehicule(producator);
CREATE INDEX IF NOT EXISTS idx_vehicule_model ON vehicule(model);
CREATE INDEX IF NOT EXISTS idx_acoperiri_vehicul ON acoperiri(vehicul_id);
```

### 3. Monitoring
```bash
# Resource usage
docker stats

# Database performance
docker-compose exec postgres psql -U postgres -c "SELECT * FROM pg_stat_activity;"
```

## 🆘 Support

### Logs Importante
```bash
# Aplicație
cloudron logs --app vehicle-graphics --lines 100

# System
journalctl -u cloudron -f

# Database
docker-compose logs postgres --tail 50
```

### Contacte
- **Cloudron Support**: https://docs.cloudron.io
- **Aplicație Issues**: GitHub Issues
- **Database**: Supabase Support sau PostgreSQL docs

---

**🎉 Succes!** Aplicația ta Vehicle Graphics Pricing rulează acum pe serverul tău privat Cloudron!