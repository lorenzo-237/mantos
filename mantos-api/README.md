# Mantos API

API REST wrapper et extension pour MantisBT (système de suivi de bugs). Fournit des endpoints REST modernes, support WebSocket pour le temps réel, et gère deux bases de données distinctes.

## 🚀 Démarrage rapide

```bash
# Installation
npm install

# Configuration
cp .env.example .env.development.local
# Éditer .env.development.local avec vos valeurs

# Générer les clients Prisma
npm run generate

# Démarrer en développement
npm run dev
```

L'API sera accessible sur `http://localhost:3000`.

## 📚 Documentation

### Guides principaux

- **[Documentation API complète](docs/API_DOCUMENTATION.md)** - Tous les endpoints, exemples, modèles de données
- **[Guide de déploiement](docs/DEPLOYMENT_GUIDE.md)** - Installation, configuration, déploiement production
- **[Résumé de migration](MIGRATION_SUMMARY.md)** - Changements effectués lors de la migration LDAP
- **[Prochaines étapes](TODO_NEXT_STEPS.md)** - Actions à réaliser et améliorations suggérées
- **[Spécification OpenAPI](docs/openapi.yaml)** - Spec OpenAPI 3.0.3 (importable dans Swagger/Postman)

### Documentation développeur

- **[CLAUDE.md](CLAUDE.md)** - Guide pour Claude Code (architecture, patterns, commandes)

## 🏗️ Architecture

### Dual Database System

- **Mantis DB (MySQL)**: Base MantisBT existante (lecture seule)
- **Mantos DB (PostgreSQL)**: Données propriétaires (users, tokens, versions, assemblies)

### Stack technique

- **Runtime**: Node.js v18+
- **Framework**: Express.js + TypeScript
- **ORM**: Prisma (dual-schema)
- **Auth**: JWT (jsonwebtoken)
- **Real-time**: Socket.IO
- **Validation**: class-validator
- **DI**: TypeDI

### Flux d'authentification

```
Client → Mantos API → External Auth API → LDAP
                    ↓
              Generate JWT
                    ↓
              Return to client
```

## 🛠️ Commandes

### Développement

```bash
npm run dev          # Démarrer avec hot-reload
npm run build        # Compiler TypeScript
npm start            # Démarrer en production
```

### Tests & Linting

```bash
npm run app:test     # Lancer les tests Jest
npm run lint         # Vérifier le code
npm run lint:fix     # Corriger automatiquement
```

### Base de données

```bash
# Générer les clients Prisma
npm run generate:mantis   # Client Mantis (MySQL)
npm run generate:blaster  # Client Mantos (PostgreSQL)
npm run generate          # Les deux

# Migrations (Mantos DB uniquement)
npm run migrate:blaster   # Dev
npm run deploy:blaster    # Production
```

## 🔐 Configuration

### Variables d'environnement requises

Voir [.env.example](.env.example) pour la liste complète.

Principales variables:

```env
# Bases de données
DATABASE_URL=mysql://user:pass@host:3306/mantisbt
DATABASE_PG_URL=postgresql://user:pass@host:5432/mantos

# APIs externes
MANTIS_API_URL=https://mantis.example.com/api/rest
EXTERNAL_AUTH_API_URL=https://auth.example.com

# Sécurité
SECRET_KEY=your_jwt_secret
ADMIN_KEY=your_admin_key
```

**⚠️ IMPORTANT**: Générer des clés aléatoires fortes en production!

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🔗 Endpoints principaux

| Catégorie | Endpoints | Auth |
|-----------|-----------|------|
| **Auth** | `POST /auth/login` | ❌ |
| **Users** | `GET /users/me`, `PATCH /users` | JWT |
| **Issues** | `GET /issues`, `POST /issues/:id/notes` | JWT |
| **Projects** | `GET /projects`, `POST /projects/:id/versions` | JWT |
| **Changelogs** | `GET /changelogs`, `POST /changelogs/html` | JWT |
| **Assembly** | `GET /assembly`, `POST /assembly` | Admin |

Voir [API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md) pour la documentation complète.

## 🔌 WebSocket Events

Connexion:
```javascript
const socket = io('http://localhost:3000', {
  extraHeaders: { access_token: 'your_jwt_token' }
});
```

Events disponibles:
- `update_issue` - Notification de modification d'issue
- `add_version` - Notification d'ajout de version
- `update_vues` - Synchronisation d'état entre clients

## 🧪 Tests

### Tests avec Bruno

Des collections de tests API sont disponibles dans le dossier `/bruno`:

1. Installer [Bruno](https://www.usebruno.com/)
2. Ouvrir le dossier `bruno/`
3. Configurer l'environnement
4. Exécuter les requêtes

### Tests Jest

```bash
npm run app:test
```

**Note**: Couverture de tests actuellement faible, à améliorer.

## 📦 Structure du projet

```
mantos-api/
├── src/
│   ├── api/              # Clients HTTP externes
│   ├── config/           # Configuration et env
│   ├── controllers/      # Handlers HTTP
│   ├── dtos/             # Data Transfer Objects
│   ├── interfaces/       # Types TypeScript
│   ├── middlewares/      # Express middlewares
│   ├── routes/           # Définition des routes
│   ├── services/         # Logique métier
│   ├── prisma/           # Clients Prisma générés
│   ├── mantis/           # Requêtes vers MantisBT
│   ├── sockets/          # Événements WebSocket
│   ├── utils/            # Utilitaires
│   └── app.ts            # Application Express
├── prisma/
│   ├── mantis.prisma     # Schéma MySQL (MantisBT)
│   └── blaster.prisma    # Schéma PostgreSQL (Mantos)
├── docs/                 # Documentation
├── bruno/                # Tests API
├── logs/                 # Logs (généré)
└── dist/                 # Build (généré)
```

## 🚨 Troubleshooting

### Problème: "Cannot find module '@/...'"

**Solution**: Rebuilder le projet avec résolution d'alias

```bash
npm run build
```

### Problème: "EXTERNAL_AUTH_API_URL is not defined"

**Solution**: Ajouter la variable dans `.env.{NODE_ENV}.local`

```env
EXTERNAL_AUTH_API_URL=https://your-auth-api.com
```

### Problème: Erreur Prisma

**Solution**: Régénérer les clients

```bash
npm run generate
```

Voir [DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) pour plus de solutions.

## 📊 État du projet

### ✅ Implémenté

- Authentification JWT (locale + externe)
- CRUD Issues (via MantisBT API)
- Gestion projets et versions
- Changelogs automatiques
- WebSocket temps réel
- Assembly info tracking
- Documentation complète

### ⚠️ À améliorer

- **Sécurité**: Rate limiting, refresh tokens
- **Tests**: Augmenter couverture (actuellement ~10%)
- **Monitoring**: APM, alertes
- **Performance**: Cache Redis, pagination
- **Documentation Swagger**: Annotations JSDoc

Voir [TODO_NEXT_STEPS.md](TODO_NEXT_STEPS.md) pour la liste complète.

## 🤝 Contribution

### Workflow Git

```bash
# Créer une branche
git checkout -b feature/ma-fonctionnalite

# Faire les modifications
# ...

# Commit
git add .
git commit -m "feat: description de la fonctionnalité"

# Push
git push origin feature/ma-fonctionnalite
```

### Standards de code

- **Linting**: ESLint + Prettier (auto-fix avec `npm run lint:fix`)
- **Commits**: Format conventionnel (feat, fix, docs, etc.)
- **TypeScript**: Strict mode activé
- **Tests**: Requis pour nouvelles fonctionnalités (TODO: enforcement)

## 📞 Support

- **Documentation**: Voir `/docs`
- **Issues**: [GitHub Issues]
- **MantisBT Docs**: https://mantisbt.org/docs/
- **Prisma Docs**: https://www.prisma.io/docs/

## 📄 Licence

ISC

## 🎯 Changelog

### Version 1.0.1 (2026-01-12)

**Added**:
- Client API externe pour authentification
- Documentation complète (Markdown + OpenAPI)
- Guide de déploiement
- WebSocket support

**Changed**:
- Migration LDAP direct → API externe
- Renommage: `blaster-api` → `mantos-api`

**Removed**:
- Dépendance `ldapjs`
- Client LDAP direct

Voir [MIGRATION_SUMMARY.md](MIGRATION_SUMMARY.md) pour détails complets.

---

**Développé avec ❤️ pour une meilleure expérience MantisBT**
