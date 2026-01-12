# Mantos API - Guide de déploiement

## Table des matières

1. [Prérequis](#prérequis)
2. [Configuration](#configuration)
3. [Base de données](#base-de-données)
4. [Migration depuis LDAP](#migration-depuis-ldap)
5. [Installation](#installation)
6. [Tests](#tests)
7. [Déploiement](#déploiement)
8. [Surveillance](#surveillance)
9. [Troubleshooting](#troubleshooting)

---

## Prérequis

### Environnement serveur

- **Node.js**: v18.x ou supérieur
- **npm**: v9.x ou supérieur
- **MySQL**: v8.0+ (pour MantisBT existant)
- **PostgreSQL**: v14+ (pour base Mantos)

### Services externes requis

- **API d'authentification externe**: Doit exposer:
  - `POST /api/v1/auth/login` - Authentification LDAP
  - `POST /api/v1/mantis/token` - Récupération token Mantis
- **MantisBT REST API**: Instance MantisBT avec API REST activée

### Permissions

- Accès lecture/écriture à la base PostgreSQL
- Accès lecture seule à la base MySQL MantisBT
- Accès réseau vers API externe et MantisBT

---

## Configuration

### Variables d'environnement

Créez un fichier `.env.production.local` (ou `.env.development.local` pour dev):

```env
# ===========================
# SERVEUR
# ===========================
NODE_ENV=production
PORT=3000
LOG_FORMAT=combined
ORIGIN=https://mantos.example.com
CREDENTIALS=true

# ===========================
# BASES DE DONNÉES
# ===========================
# MySQL - Base MantisBT (READ-ONLY)
DATABASE_URL="mysql://mantos_readonly:password@localhost:3306/mantisbt"

# PostgreSQL - Base Mantos (READ-WRITE)
DATABASE_PG_URL="postgresql://mantos_admin:password@localhost:5432/mantos"

# ===========================
# APIs EXTERNES
# ===========================
# API MantisBT REST
MANTIS_API_URL=https://mantis.example.com/api/rest

# API d'authentification externe (nouveau système)
EXTERNAL_AUTH_API_URL=https://auth.example.com

# API de conversion Markdown vers HTML (optionnel)
MD_TO_HTML_API_URL=https://md-converter.example.com

# ===========================
# SÉCURITÉ
# ===========================
# Clé secrète pour les JWT Mantos (CHANGER EN PRODUCTION!)
SECRET_KEY=your_super_secret_jwt_key_change_me_in_production

# Clé pour tokens admin (CHANGER EN PRODUCTION!)
ADMIN_KEY=your_admin_key_change_me_in_production

# ===========================
# LOGGING
# ===========================
LOG_DIR=./logs
```

### Sécurité des secrets

**IMPORTANT**: Ne jamais commiter les fichiers `.env.*.local` dans Git!

Générer des clés sécurisées:

```bash
# Générer SECRET_KEY
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Générer ADMIN_KEY
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Base de données

### Configuration MySQL (MantisBT)

Créer un utilisateur avec accès lecture seule:

```sql
-- Se connecter à MySQL en tant qu'admin
mysql -u root -p

-- Créer l'utilisateur en lecture seule
CREATE USER 'mantos_readonly'@'%' IDENTIFIED BY 'secure_password';

-- Accorder droits SELECT uniquement
GRANT SELECT ON mantisbt.* TO 'mantos_readonly'@'%';

-- Appliquer les changements
FLUSH PRIVILEGES;

-- Vérifier les droits
SHOW GRANTS FOR 'mantos_readonly'@'%';
```

### Configuration PostgreSQL (Mantos)

```bash
# Se connecter à PostgreSQL
sudo -u postgres psql

# Créer la base de données
CREATE DATABASE mantos;

# Créer l'utilisateur
CREATE USER mantos_admin WITH ENCRYPTED PASSWORD 'secure_password';

# Accorder tous les droits sur la base
GRANT ALL PRIVILEGES ON DATABASE mantos TO mantos_admin;

# Quitter
\q
```

### Migrations Prisma

```bash
# Générer les clients Prisma
npm run generate

# Appliquer les migrations (Mantos DB uniquement)
npm run deploy:blaster
```

**Note**: La base Mantis n'a pas de migrations car elle est gérée par MantisBT.

---

## Migration depuis LDAP

### Ancien système (DEPRECATED)

```
[Client] → [Mantos API] → [LDAP Server]
                         ↓
                    [MantisBT DB]
```

### Nouveau système (ACTUEL)

```
[Client] → [Mantos API] → [External Auth API] → [LDAP Server]
                         ↓
                    [Token Mantis]
                         ↓
                    [Génère JWT Mantos]
```

### Changements apportés

1. **Suppression**:
   - Dépendance `ldapjs` (npm package)
   - Fichier `src/ldap/ldapClient.ts`
   - Variables env: `LDAP_USER`, `LDAP_PASSWORD`, `LDAP_SERVER`, `LDAP_PORT`, `LDAP_BASE`

2. **Ajouts**:
   - Client HTTP `src/api/externalAuth.client.ts`
   - Variable env: `EXTERNAL_AUTH_API_URL`

3. **Modifications**:
   - `src/services/auth.service.ts` - Méthode `logInLdap()` utilise maintenant `ExternalAuthClient`
   - `src/config/index.ts` - Export de `EXTERNAL_AUTH_API_URL`

### Checklist migration

- [ ] API externe d'authentification déployée et accessible
- [ ] Endpoints `/api/v1/auth/login` et `/api/v1/mantis/token` fonctionnels
- [ ] Variable `EXTERNAL_AUTH_API_URL` configurée
- [ ] Anciennes variables LDAP retirées du `.env`
- [ ] Tests d'authentification effectués
- [ ] Rollback plan préparé (en cas de problème)

---

## Installation

### Installation locale

```bash
# Cloner le dépôt
git clone https://github.com/your-org/mantos-api.git
cd mantos-api

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env.development.local
# Éditer .env.development.local avec vos valeurs

# Générer les clients Prisma
npm run generate

# Appliquer les migrations
npm run migrate:blaster

# Démarrer en mode développement
npm run dev
```

L'API sera accessible sur `http://localhost:3000`.

### Installation production

```bash
# Installer les dépendances (production uniquement)
npm ci --only=production

# Générer les clients Prisma
npm run generate

# Build TypeScript
npm run build

# Appliquer les migrations
npm run deploy:blaster

# Démarrer le serveur
npm start
```

---

## Tests

### Tests unitaires

```bash
# Lancer tous les tests
npm run app:test

# Tests avec couverture
npm run app:test -- --coverage

# Tests en mode watch
npm run app:test -- --watch
```

### Tests d'API avec Bruno

1. Installer [Bruno](https://www.usebruno.com/)
2. Ouvrir le dossier `bruno/` dans Bruno
3. Configurer l'environnement (URL, token)
4. Exécuter les requêtes

### Tests de charge (optionnel)

Utiliser [Artillery](https://www.artillery.io/) ou [k6](https://k6.io/).

---

## Déploiement

### Option 1: Déploiement manuel (VPS/VM)

```bash
# Sur le serveur
cd /var/www/mantos-api

# Pull dernières modifications
git pull origin main

# Installer dépendances
npm ci --only=production

# Build
npm run build

# Migrations
npm run deploy:blaster

# Redémarrer le service
sudo systemctl restart mantos-api
```

### Option 2: Avec PM2

```bash
# Installer PM2 globalement
npm install -g pm2

# Démarrer l'application
pm2 start dist/server.js --name mantos-api

# Sauvegarder la configuration
pm2 save

# Auto-restart au démarrage
pm2 startup

# Commandes utiles
pm2 status
pm2 logs mantos-api
pm2 restart mantos-api
```

### Option 3: Docker (recommandé)

Créer un `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Créer un `docker-compose.yml`:

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
    env_file:
      - .env.production.local
    restart: unless-stopped
    depends_on:
      - postgres

  postgres:
    image: postgres:14-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: mantos
      POSTGRES_USER: mantos_admin
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    restart: unless-stopped

volumes:
  postgres_data:
```

Démarrage:

```bash
docker-compose up -d
```

### Option 4: Kubernetes (production à grande échelle)

Voir `k8s/` (à créer) pour manifests YAML.

---

## Surveillance

### Logs

Les logs sont stockés dans le répertoire configuré par `LOG_DIR` (défaut: `./logs`).

Format des logs:
- `combined` - Apache combined log format (production)
- `dev` - Colored output (développement)

Rotation des logs configurée via `winston-daily-rotate-file`.

### Métriques recommandées

- **Uptime**: Disponibilité de l'API
- **Response time**: Temps de réponse moyen par endpoint
- **Error rate**: Taux d'erreurs 5xx
- **Auth failures**: Tentatives d'authentification échouées
- **Database connections**: Pool PostgreSQL/MySQL
- **WebSocket connections**: Nombre de clients connectés

### Outils recommandés

- **APM**: New Relic, Datadog, Elastic APM
- **Logs**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Monitoring**: Prometheus + Grafana
- **Alerting**: PagerDuty, Opsgenie

### Health check endpoint

Ajouter un endpoint simple:

```bash
curl http://localhost:3000/health
# Devrait retourner 200 OK
```

---

## Troubleshooting

### Problème: API ne démarre pas

**Symptôme**: Erreur au démarrage

**Solutions**:
1. Vérifier que toutes les variables d'environnement sont définies
2. Vérifier la connectivité aux bases de données
3. Vérifier les logs: `tail -f logs/error-*.log`

### Problème: Authentification externe échoue

**Symptôme**: Erreur 503 lors du login avec LDAP

**Solutions**:
1. Vérifier que `EXTERNAL_AUTH_API_URL` est correcte
2. Tester l'API externe manuellement:
   ```bash
   curl -X POST https://auth.example.com/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"uid":"test","password":"test"}'
   ```
3. Vérifier les logs du client: `[ExternalAuthClient]`
4. Vérifier les règles firewall/réseau

### Problème: Token Mantis invalide

**Symptôme**: Erreur 401 lors d'appels à MantisBT

**Solutions**:
1. Vérifier que le token Mantis existe dans la DB:
   ```sql
   SELECT token FROM users WHERE username = 'user';
   ```
2. Tester le token manuellement:
   ```bash
   curl -H "Authorization: TOKEN_HERE" \
     https://mantis.example.com/api/rest/users/me
   ```
3. Régénérer le token via l'interface MantisBT

### Problème: WebSocket ne se connecte pas

**Symptôme**: Clients ne reçoivent pas d'événements temps réel

**Solutions**:
1. Vérifier que le JWT est passé dans le header `access_token`
2. Vérifier les logs: `[socket] =>`
3. Vérifier les CORS et proxy reverse (nginx/apache)
4. Tester avec un client simple:
   ```javascript
   const socket = io('http://localhost:3000', {
     extraHeaders: { access_token: 'YOUR_JWT' }
   });
   socket.on('connect', () => console.log('Connected!'));
   ```

### Problème: Migrations Prisma échouent

**Symptôme**: Erreur lors de `npm run migrate:blaster`

**Solutions**:
1. Vérifier la connexion PostgreSQL
2. Vérifier les droits de l'utilisateur DB
3. Reset (ATTENTION, perte de données):
   ```bash
   npx prisma migrate reset --schema prisma/blaster.prisma
   ```

### Problème: Performance dégradée

**Symptômes**: Temps de réponse élevés

**Solutions**:
1. Vérifier les index en base de données
2. Analyser les slow queries MySQL/PostgreSQL
3. Augmenter le pool de connexions Prisma
4. Implémenter un cache (Redis)
5. Profiler avec `clinic` ou `0x`

---

## Support et ressources

- **Documentation API**: [docs/API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **OpenAPI Spec**: [docs/openapi.yaml](./openapi.yaml)
- **Tests Bruno**: [bruno/](../bruno/)
- **MantisBT Docs**: https://mantisbt.org/docs/
- **Prisma Docs**: https://www.prisma.io/docs/

---

## Checklist pré-production

- [ ] Variables d'environnement configurées et sécurisées
- [ ] Clés JWT générées avec entropie élevée
- [ ] Bases de données configurées avec users dédiés
- [ ] Migrations appliquées
- [ ] Tests d'intégration passés
- [ ] Logs configurés et rotation activée
- [ ] Monitoring et alertes configurés
- [ ] Health checks fonctionnels
- [ ] Backup automatique des bases configuré
- [ ] Documentation API distribuée à l'équipe
- [ ] Plan de rollback préparé
- [ ] Rate limiting configuré (si applicable)
- [ ] HTTPS activé (via reverse proxy)
- [ ] CORS configuré correctement
