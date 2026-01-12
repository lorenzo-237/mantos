# Résumé de la migration - Authentification externe

## Date de migration
2026-01-12

## Vue d'ensemble

Migration de l'authentification LDAP directe vers un système d'authentification via API externe. Le nouveau système délègue l'authentification LDAP à un service dédié tout en conservant l'authentification locale en parallèle.

---

## Changements effectués

### ✅ Fichiers modifiés

#### 1. `src/config/index.ts`
**Changements**:
- Ajout de `EXTERNAL_AUTH_API_URL` dans les exports
- Modification de `APP.IDENTITE` de `'blaster-api'` → `'mantos-api'`

**Impact**: Configuration globale de l'application

#### 2. `src/services/auth.service.ts`
**Changements**:
- Import: `LdapClient` → `ExternalAuthClient`
- Ajout import: `logger` pour traçabilité
- Réécriture complète de `logInLdap()`:
  - Appel à l'API externe pour authentification
  - Récupération du token Mantis via API externe
  - Génération du JWT Mantos en interne
  - Meilleure gestion d'erreurs avec logging

**Impact**: Logique d'authentification complètement refactorisée

#### 3. `CLAUDE.md`
**Changements**:
- Mise à jour du nom: `blaster-api` → `Mantos API`
- Documentation du nouveau flux d'authentification externe
- Documentation des endpoints de l'API externe
- Suppression des références LDAP directes
- Mise à jour des variables d'environnement requises

**Impact**: Documentation à jour pour futurs développeurs

### ✅ Fichiers créés

#### 1. `src/api/externalAuth.client.ts` ⭐
**Contenu**:
- Classe `ExternalAuthClient` avec méthodes:
  - `authenticate(uid, password)` - Authentification via API externe
  - `getMantisToken(uid, externalToken)` - Récupération token Mantis
- Gestion d'erreurs robuste avec `HttpException`
- Logging détaillé des opérations

**Responsabilité**: Communication avec l'API d'authentification externe

#### 2. `docs/API_DOCUMENTATION.md` 📚
**Contenu complet**:
- Vue d'ensemble de l'architecture
- Documentation détaillée de tous les endpoints
- Exemples de requêtes/réponses
- Modèles de données
- Events WebSocket
- Variables d'environnement
- Points à améliorer identifiés
- Guide de migration LDAP

**Taille**: ~500 lignes, documentation exhaustive

#### 3. `docs/openapi.yaml` 📋
**Contenu**:
- Spécification OpenAPI 3.0.3 complète
- Tous les endpoints documentés
- Schémas de données
- Exemples de requêtes
- Codes d'erreur

**Utilisation**: Importable dans Swagger UI, Postman, Insomnia, etc.

#### 4. `docs/DEPLOYMENT_GUIDE.md` 🚀
**Contenu**:
- Prérequis système
- Configuration pas-à-pas
- Guide de migration LDAP
- Options de déploiement (PM2, Docker, K8s)
- Surveillance et monitoring
- Troubleshooting complet
- Checklist pré-production

**Taille**: ~450 lignes

### ✅ Fichiers supprimés

- `src/ldap/ldapClient.ts` - Ancien client LDAP direct
- Dossier `src/ldap/` (si vide)

### ✅ Dépendances retirées

- `ldapjs` (package npm) - Librairie LDAP obsolète

---

## Architecture avant/après

### Avant (LDAP direct)

```
┌─────────┐
│ Client  │
│ Angular │
└────┬────┘
     │ POST /auth/login {username, password, ldap: true}
     ▼
┌─────────────┐
│ Mantos API  │
│             │
│ ┌─────────┐ │
│ │LdapClient│─┼──► LDAP Server (ldapjs)
│ └─────────┘ │      │
│             │      ▼
│             │   Récupère token Mantis (attribut LDAP)
│             │      │
│  ┌────────┐ │      │
│  │Auth    │◄┼──────┘
│  │Service │ │
│  └───┬────┘ │
│      │      │
│  Génère JWT │
│      │      │
└──────┼──────┘
       │
       ▼
   JWT Mantos
```

**Problèmes**:
- Dépendance directe à `ldapjs` (outdated)
- Couplage fort avec infrastructure LDAP
- Difficulté de maintenance

### Après (API externe)

```
┌─────────┐
│ Client  │
│ Angular │
└────┬────┘
     │ POST /auth/login {username, password, ldap: true}
     ▼
┌───────────────────────────────────────┐
│ Mantos API                            │
│                                       │
│ ┌──────────────────┐                 │
│ │ExternalAuthClient│──┐              │
│ └──────────────────┘  │              │
│                       │              │
│                       │ 1. POST /api/v1/auth/login
│                       │    {uid, password}
│                       ▼              │
│                 ┌──────────────┐    │
│                 │ External API │    │
│                 │   Service    │    │
│                 └──────┬───────┘    │
│                        │             │
│                        │ Returns     │
│                        │ External JWT│
│                        ▼             │
│ ┌──────────────────┐  │             │
│ │ExternalAuthClient│◄─┘             │
│ └────────┬─────────┘                │
│          │                           │
│          │ 2. POST /api/v1/mantis/token
│          │    Authorization: Bearer {External JWT}
│          ▼                           │
│    ┌──────────────┐                 │
│    │ External API │                 │
│    └──────┬───────┘                 │
│           │                          │
│           │ Returns                  │
│           │ Mantis Token             │
│           ▼                          │
│    ┌────────────┐                   │
│    │Auth Service│                   │
│    └─────┬──────┘                   │
│          │                           │
│     Génère JWT Mantos                │
│          │                           │
└──────────┼───────────────────────────┘
           │
           ▼
      JWT Mantos
```

**Avantages**:
- Découplage total du LDAP
- Pas de dépendances LDAP obsolètes
- Centralisation de l'authentification
- Facilité de maintenance
- Meilleure traçabilité (logs)

---

## Configuration requise

### Variables d'environnement à ajouter

```env
# NOUVELLE VARIABLE OBLIGATOIRE
EXTERNAL_AUTH_API_URL=https://auth.example.com
```

### Variables d'environnement à retirer (optionnel)

```env
# CES VARIABLES NE SONT PLUS UTILISÉES
# LDAP_USER=...
# LDAP_PASSWORD=...
# LDAP_SERVER=...
# LDAP_PORT=...
# LDAP_BASE=...
```

---

## Endpoints de l'API externe attendus

### 1. Authentification

**Endpoint**: `POST /api/v1/auth/login`

**Request**:
```json
{
  "uid": "john.doe",
  "password": "password123"
}
```

**Response** (succès):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

**Codes attendus**:
- `200` - Authentification réussie
- `401` - Credentials invalides
- `500` - Erreur serveur

### 2. Récupération token Mantis

**Endpoint**: `POST /api/v1/mantis/token`

**Headers**:
```
Authorization: Bearer {external_jwt}
Content-Type: application/json
```

**Request**:
```json
{
  "uid": "john.doe"
}
```

**Response** (succès):
```json
{
  "token": "mantis_api_token_here"
}
```

**Response** (pas de token):
```json
{
  "token": null
}
```

**Codes attendus**:
- `200` - Token trouvé ou null
- `404` - Utilisateur sans token (retourne null)
- `401` - JWT externe invalide
- `500` - Erreur serveur

---

## Tests de validation

### Test 1: Authentification locale (inchangé)

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "local_user",
    "password": "password123",
    "ldap": false
  }'
```

**Résultat attendu**: JWT Mantos retourné

### Test 2: Authentification externe (nouveau)

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john.doe",
    "password": "password123",
    "ldap": true
  }'
```

**Résultat attendu**: JWT Mantos retourné après authentification externe

### Test 3: Vérification des logs

Vérifier que les logs contiennent:
```
[ExternalAuthClient] Authenticating user: john.doe
[ExternalAuthClient] User john.doe authenticated successfully
[ExternalAuthClient] Fetching Mantis token for user: john.doe
[ExternalAuthClient] Mantis token retrieved for user john.doe
[AuthService] External authentication successful for user: john.doe
```

---

## Rollback plan

En cas de problème, retour à l'ancienne version:

### Étape 1: Réinstaller ldapjs

```bash
npm install ldapjs@^3.0.7
```

### Étape 2: Restaurer le fichier ldapClient.ts

Récupérer depuis Git:
```bash
git checkout HEAD~1 -- src/ldap/ldapClient.ts
```

### Étape 3: Restaurer auth.service.ts

```bash
git checkout HEAD~1 -- src/services/auth.service.ts
```

### Étape 4: Rebuild et restart

```bash
npm run build
pm2 restart mantos-api
```

---

## Checklist de déploiement

### Pré-déploiement

- [ ] API externe déployée et accessible
- [ ] Tests des endpoints externes effectués manuellement
- [ ] Variable `EXTERNAL_AUTH_API_URL` configurée
- [ ] Tests locaux passés
- [ ] Documentation lue par l'équipe

### Déploiement

- [ ] Code déployé sur serveur
- [ ] `npm ci --only=production` exécuté
- [ ] `npm run build` réussi
- [ ] Service redémarré
- [ ] Logs vérifiés (pas d'erreurs au démarrage)

### Post-déploiement

- [ ] Test authentification locale OK
- [ ] Test authentification externe OK
- [ ] Logs contiennent `[ExternalAuthClient]`
- [ ] Aucune référence à `LdapClient` dans les logs d'erreur
- [ ] Monitoring activé et stable
- [ ] Équipe notifiée du succès

---

## Personnes à contacter

- **API externe**: Équipe Infrastructure / Équipe Auth
- **MantisBT**: Administrateur MantisBT
- **Base de données**: DBA PostgreSQL/MySQL
- **Déploiement**: DevOps / SRE

---

## Ressources

- Documentation complète: [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)
- Guide de déploiement: [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)
- OpenAPI spec: [docs/openapi.yaml](docs/openapi.yaml)
- Tests Bruno: [bruno/](bruno/)

---

## Notes importantes

### ⚠️ Sécurité

- Ne JAMAIS commiter les fichiers `.env.*.local`
- Régénérer `SECRET_KEY` et `ADMIN_KEY` en production
- Utiliser HTTPS pour toutes les communications
- Implémenter rate limiting sur `/auth/login`

### 📊 Performance

- L'API externe ajoute ~100-200ms de latence par authentification
- Considérer un cache de tokens pour utilisateurs fréquents
- Monitorer les timeouts vers l'API externe

### 🔍 Monitoring

Métriques à surveiller:
- Taux d'échec authentification externe (alerte si > 5%)
- Temps de réponse API externe (alerte si > 1s)
- Disponibilité API externe (alerte si < 99%)

---

## Changelog

### Version 1.0.1 (2026-01-12)

**Added**:
- Client API externe (`ExternalAuthClient`)
- Documentation complète (Markdown + OpenAPI)
- Guide de déploiement
- Logging détaillé des opérations d'auth

**Changed**:
- Flux d'authentification LDAP via API externe
- Nom de l'application: `blaster-api` → `mantos-api`

**Removed**:
- Dépendance `ldapjs`
- Client LDAP direct (`ldapClient.ts`)
- Variables d'environnement LDAP directes

**Fixed**:
- N/A (nouvelle implémentation)

---

**Fin du résumé de migration**
