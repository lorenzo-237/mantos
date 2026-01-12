# Mantos API - Documentation Complète

## Vue d'ensemble

**Mantos API** est une API REST qui sert de wrapper et d'extension pour MantisBT (système de suivi de bugs). Elle fournit des endpoints REST, un support WebSocket pour les mises à jour en temps réel, et gère deux bases de données distinctes via Prisma.

- **Version**: 1.0.1
- **Base URL**: Configurée via `PORT` (défaut: 3000)
- **Authentification**: JWT Bearer Token

---

## Architecture

### Bases de données

1. **Mantis Database (MySQL)** - Accès lecture seule à la base MantisBT existante
2. **Mantos Database (PostgreSQL)** - Données propriétaires de l'application (utilisateurs, tokens, versions, assemblies)

### Flux d'authentification

```
1. Client envoie {username, password, ldap: true/false} → POST /auth/login
2. Si ldap=true:
   a. Mantos contacte l'API externe → POST {uid, password}
   b. API externe retourne un JWT externe
   c. Mantos récupère le token Mantis → POST /api/v1/mantis/token
   d. Mantos crée/met à jour l'utilisateur dans sa DB
3. Mantos génère son propre JWT (SECRET_KEY)
4. Client utilise le JWT Mantos pour toutes les requêtes suivantes
```

---

## Authentification

### Obtenir un token JWT

**Endpoint**: `POST /auth/login`

**Body**:
```json
{
  "username": "string",
  "password": "string",
  "ldap": boolean
}
```

**Réponses**:

- **200 OK** (Succès):
```json
{
  "user": {
    "id": 1,
    "username": "john.doe",
    "token": "mantis_api_token_here",
    "theme": "Clair",
    "isAdmin": false,
    "mantis": {
      "user": {
        "id": 123,
        "name": "John Doe"
      }
    }
  },
  "token": "jwt_token_here"
}
```

- **200 OK** (Utilisateur LDAP sans token Mantis):
```json
{
  "ldap": true
}
```

- **403 Forbidden**: Identifiants invalides
- **404 Not Found**: Utilisateur non trouvé (pour auth locale)
- **503 Service Unavailable**: API externe inaccessible

**Utilisation du token**:
```
Authorization: Bearer {token}
```

### Token administrateur

**Endpoint**: `POST /auth/admin/token`

Génère un token avec privilèges administrateur (usage interne uniquement).

**Body**:
```json
{
  "username": "admin_user",
  "password": "admin_password",
  "ldap": true
}
```

---

## Endpoints

### 🔐 Authentification

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/auth/login` | Connexion utilisateur | ❌ |
| POST | `/auth/admin/token` | Obtenir token admin | ❌ |
| GET | `/auth/admin/test` | Test middleware admin | Admin |

---

### 👤 Utilisateurs

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/users/me` | Informations utilisateur connecté | JWT |
| POST | `/users/verify` | Vérifier validité d'un token | ❌ |
| POST | `/users` | Créer nouvel utilisateur | JWT |
| PATCH | `/users` | Mettre à jour utilisateur | JWT |

#### GET /users/me

Récupère les informations complètes de l'utilisateur connecté.

**Headers**:
```
Authorization: Bearer {token}
```

**Réponse 200**:
```json
{
  "id": 1,
  "username": "john.doe",
  "token": "mantis_token",
  "theme": "Clair",
  "isAdmin": false,
  "mantis": {
    "user": {
      "id": 123,
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

#### POST /users

Crée un nouvel utilisateur dans la base Mantos.

**Body**:
```json
{
  "username": "string",
  "password": "string",
  "token": "mantis_api_token"
}
```

#### PATCH /users

Met à jour les informations de l'utilisateur connecté.

**Body**:
```json
{
  "theme": "Sombre",
  "password": "nouveau_mot_de_passe" // optionnel
}
```

---

### 🐛 Issues (Bugs)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/issues` | Liste des issues | JWT |
| GET | `/issues/:issue_id` | Détails d'une issue | JWT |
| POST | `/issues` | Créer une issue | JWT |
| PATCH | `/issues/:issue_id` | Mettre à jour une issue | JWT |
| GET | `/issues/:issue_id/files/:file_id` | Télécharger un fichier | JWT |
| POST | `/issues/:issue_id/tags` | Attacher un tag | JWT |
| POST | `/issues/:issue_id/notes` | Ajouter une note | JWT |

#### GET /issues

Liste les issues avec filtres optionnels.

**Query Parameters**:
- `project_id` (number, optionnel): ID du projet
- `filter_id` (number, optionnel): ID du filtre MantisBT
- `page` (number, optionnel): Pagination
- `page_size` (number, optionnel): Taille de page

**Réponse 200**:
```json
{
  "issues": [
    {
      "id": 1234,
      "summary": "Bug dans la fonctionnalité X",
      "description": "Description détaillée...",
      "project": { "id": 1, "name": "Projet A" },
      "category": { "id": 1, "name": "Backend" },
      "status": { "id": 10, "name": "nouveau" },
      "priority": { "id": 30, "name": "normale" },
      "severity": { "id": 50, "name": "mineure" },
      "reporter": { "id": 123, "name": "John Doe" },
      "handler": { "id": 456, "name": "Jane Smith" },
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-16T14:20:00Z",
      "tags": [],
      "notes": []
    }
  ]
}
```

#### POST /issues

Crée une nouvelle issue dans MantisBT.

**Body**:
```json
{
  "summary": "string (requis)",
  "description": "string (requis)",
  "project": { "id": 1 },
  "category": { "id": 1 },
  "priority": { "id": 30 },
  "severity": { "id": 50 },
  "additional_information": "string (optionnel)",
  "files": [] // optionnel
}
```

#### POST /issues/:issue_id/notes

Ajoute une note à une issue.

**Body**:
```json
{
  "text": "string (requis)",
  "view_state": {
    "id": 10 // 10=public, 50=private
  }
}
```

---

### 📁 Projets

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/projects` | Liste des projets | JWT |
| POST | `/projects` | Créer un projet | JWT |
| GET | `/projects/:project_id/users` | Utilisateurs du projet | JWT |
| GET | `/projects/:project_id/users/:user_id` | Info utilisateur-projet | JWT |
| GET | `/projects/:project_id/versions` | Versions du projet | JWT |
| POST | `/projects/:project_id/versions` | Créer une version | JWT |
| PATCH | `/projects/:project_id/versions/:version_id` | Modifier une version | JWT |
| GET | `/projects/:project_id/filters` | Filtres du projet | JWT |
| GET | `/projects/:project_id/categories` | Catégories du projet | JWT |

#### GET /projects

**Réponse 200**:
```json
{
  "projects": [
    {
      "id": 1,
      "name": "Projet A",
      "status": { "id": 10, "name": "développement" },
      "enabled": true,
      "view_state": { "id": 10, "name": "public" },
      "description": "Description du projet"
    }
  ]
}
```

#### POST /projects/:project_id/versions

Crée une nouvelle version pour un projet.

**Body**:
```json
{
  "name": "v2.5.0",
  "description": "Version avec nouvelles fonctionnalités",
  "released": false,
  "obsolete": false,
  "timestamp": "2024-01-20T00:00:00Z"
}
```

---

### 🏷️ Tags

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/tags` | Liste des tags | JWT |

**Réponse 200**:
```json
{
  "tags": [
    { "id": 1, "name": "urgent" },
    { "id": 2, "name": "bug-critique" }
  ]
}
```

---

### 📝 Changelogs

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/changelogs` | Changelogs en Markdown | JWT |
| POST | `/changelogs/html` | Convertir Markdown → HTML | JWT |

#### GET /changelogs

Génère un changelog basé sur les issues résolues.

**Query Parameters**:
- `project_id` (number, requis)
- `version` (string, requis)
- `previous_version` (string, optionnel)

**Réponse 200**:
```markdown
# Version 2.5.0

## Nouvelles fonctionnalités
- [#1234] Ajout de la fonctionnalité X
- [#1235] Amélioration de Y

## Corrections de bugs
- [#1240] Correction du crash au démarrage
```

#### POST /changelogs/html

Convertit un changelog Markdown en HTML formaté.

**Body**:
```json
{
  "markdown": "# Version 2.5.0\n\n## Corrections..."
}
```

---

### 🔧 Assembly Info (Admin)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/assembly` | Liste des assemblies | Admin/JWT |
| GET | `/assembly/versions` | Versions disponibles | Admin/JWT |
| POST | `/assembly` | Créer assembly info | Admin |

#### GET /assembly

Récupère les informations d'assemblies pour une version.

**Query Parameters**:
- `project_id` (number, requis)
- `version` (string, requis)

**Réponse 200**:
```json
{
  "assemblies": [
    {
      "id": 1,
      "name": "MyApp",
      "extension": "exe",
      "path": "C:\\Program Files\\MyApp\\MyApp.exe",
      "checksum": "abc123def456",
      "fdate": "2024-01-15T10:00:00Z",
      "version": "2.5.0.1234",
      "createdAt": "2024-01-15T10:05:00Z"
    }
  ]
}
```

#### POST /assembly

Crée une nouvelle entrée assembly (nécessite droits admin).

**Body**:
```json
{
  "projectId": 1,
  "version": "2.5.0",
  "assemblies": [
    {
      "name": "MyApp",
      "extension": "exe",
      "path": "C:\\Program Files\\MyApp\\MyApp.exe",
      "checksum": "abc123",
      "fdate": "2024-01-15T10:00:00Z",
      "version": "2.5.0.1234"
    }
  ]
}
```

---

## WebSocket Events

**Connexion**:
```javascript
const socket = io('http://localhost:3000', {
  extraHeaders: {
    access_token: 'your_jwt_token'
  }
});
```

### Events émis par le client

#### `update_issue`
Notifie les autres clients qu'une issue a été modifiée.

**Payload**:
```json
{
  "issue_id": 1234,
  "user_id": 123,
  "action": "updated"
}
```

#### `add_version`
Notifie les autres clients qu'une version a été ajoutée.

**Payload**:
```json
{
  "project_id": 1,
  "version": "2.5.0"
}
```

#### `update_vues`
Synchronise l'état des vues entre clients.

**Payload**:
```json
{
  "user_id": 123,
  "view": "issues_list",
  "filters": {}
}
```

### Events reçus par le client

Les mêmes events sont broadcastés à tous les clients connectés (sauf l'émetteur).

---

## Codes d'erreur

| Code | Description |
|------|-------------|
| 200 | Succès |
| 201 | Créé avec succès |
| 400 | Requête invalide (validation échouée) |
| 401 | Non authentifié (token manquant/invalide) |
| 403 | Accès interdit (droits insuffisants) |
| 404 | Ressource non trouvée |
| 500 | Erreur serveur interne |
| 503 | Service externe indisponible |

### Format des erreurs

```json
{
  "status": 400,
  "message": "Validation failed: username is required"
}
```

---

## Modèles de données

### User (Mantos DB)

```typescript
{
  id: number
  username: string
  password: string // bcrypt hash
  token: string // Mantis API token
  socket_id: string
  isAdmin: boolean
  theme: string // "Clair" | "Sombre"
}
```

### ProjectVersion (Mantos DB)

```typescript
{
  id: number
  mantisProjectId: number
  version: string
  createdAt: DateTime
  updatedAt: DateTime
  obsolete: boolean
  infos: AssemblyInfo[]
}
```

### AssemblyInfo (Mantos DB)

```typescript
{
  id: number
  projectVersionId: number
  name: string
  extension: string
  path: string
  checksum: string
  fdate: DateTime
  version: string
  createdAt: DateTime
  updatedAt: DateTime
}
```

---

## Variables d'environnement requises

```env
# Serveur
NODE_ENV=development|production
PORT=3000

# Base de données
DATABASE_URL=mysql://user:password@localhost:3306/mantis
DATABASE_PG_URL=postgresql://user:password@localhost:5432/mantos

# APIs externes
MANTIS_API_URL=https://mantis.example.com/api/rest
EXTERNAL_AUTH_API_URL=https://auth.example.com

# Sécurité
SECRET_KEY=your_jwt_secret_key
ADMIN_KEY=your_admin_key

# Optionnel
LOG_DIR=./logs
LOG_FORMAT=combined
ORIGIN=http://localhost:4200
CREDENTIALS=true
```

---

## Points à améliorer identifiés

### 🔴 Sécurité

1. **Credentials hardcodés**: Le endpoint `/auth/admin/token` contient des credentials en dur ([auth.controller.ts:43-44](../src/controllers/auth.controller.ts#L43-L44))
   - **Recommandation**: Utiliser variables d'environnement ou base de données

2. **Rate limiting**: Pas de protection contre brute force
   - **Recommandation**: Implémenter `express-rate-limit`

3. **Refresh tokens**: Pas de mécanisme de renouvellement
   - **Recommandation**: Ajouter un système de refresh token

### 🟡 Fonctionnalités manquantes

1. **Documentation Swagger/OpenAPI**: Partiellement configurée mais pas documentée
   - **Recommandation**: Ajouter annotations JSDoc pour auto-génération

2. **Tests**: Un seul fichier de test
   - **Recommandation**: Augmenter couverture (services, controllers, middleware)

3. **Gestion erreurs**: Pourrait être standardisée
   - **Recommandation**: Codes d'erreur structurés + i18n

4. **Logging**: Logger présent mais pas de traçabilité complète des actions
   - **Recommandation**: Audit log des actions utilisateurs sensibles

5. **Validation token Mantis**: Token stocké mais pas revalidé
   - **Recommandation**: Vérifier périodiquement la validité

### 🟢 Améliorations qualité

1. **Pagination**: Non standardisée
2. **Filtres**: Pas de validation stricte des query params
3. **CORS**: Configuration pourrait être plus fine
4. **Compression**: Activée mais pas de configuration par route
5. **Upload fichiers**: Multer configuré mais limites de taille?

---

## Migration depuis LDAP direct

### Changements effectués

✅ Suppression de la dépendance `ldapjs`
✅ Suppression du fichier `src/ldap/ldapClient.ts`
✅ Nouveau client `ExternalAuthClient` ([src/api/externalAuth.client.ts](../src/api/externalAuth.client.ts))
✅ Service d'authentification mis à jour
✅ Variable d'environnement `EXTERNAL_AUTH_API_URL` ajoutée

### Déploiement

1. Configurer `EXTERNAL_AUTH_API_URL` dans `.env.{NODE_ENV}.local`
2. Vérifier que l'API externe répond sur:
   - `POST /api/v1/auth/login` (authentification)
   - `POST /api/v1/mantis/token` (récupération token Mantis)
3. Régénérer les clients Prisma: `npm run generate`
4. Build: `npm run build`
5. Démarrer: `npm start`

---

## Support

Pour toute question ou problème:
- Issues GitHub: [mantos-api/issues]
- Documentation MantisBT: https://mantisbt.org/docs/
- Tests API: Utiliser les fichiers Bruno dans `/bruno`
