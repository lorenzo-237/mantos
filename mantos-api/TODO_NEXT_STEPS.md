# Prochaines étapes - Mantos API

## ✅ Terminé

1. **Migration authentification LDAP → API externe**
   - Client HTTP créé (`src/api/externalAuth.client.ts`)
   - Service d'authentification mis à jour
   - Dépendance `ldapjs` supprimée
   - Documentation mise à jour

2. **Documentation API complète**
   - Guide complet Markdown (500+ lignes)
   - Spécification OpenAPI 3.0.3
   - Guide de déploiement détaillé
   - Résumé de migration
   - Fichier `.env.example`

---

## 🔴 Actions urgentes (avant déploiement)

### 1. Configuration de l'API externe

**Priorité**: CRITIQUE

**Actions**:
- [ ] Ajouter `EXTERNAL_AUTH_API_URL` dans votre fichier `.env.{NODE_ENV}.local`
  ```env
  EXTERNAL_AUTH_API_URL=https://votre-api-externe.com
  ```
- [ ] Vérifier que l'API externe expose bien:
  - `POST /api/v1/auth/login` (authentification)
  - `POST /api/v1/mantis/token` (récupération token Mantis)
- [ ] Tester manuellement ces endpoints avec curl/Postman

### 2. Build et tests locaux

**Priorité**: CRITIQUE

**Actions**:
```bash
# Installer les dépendances
npm install

# Générer les clients Prisma
npm run generate

# Build TypeScript
npm run build

# Tests
npm run app:test

# Lancer en dev
npm run dev
```

- [ ] Vérifier qu'il n'y a pas d'erreurs de compilation
- [ ] Tester l'authentification locale (ldap: false)
- [ ] Tester l'authentification externe (ldap: true)
- [ ] Vérifier les logs: `tail -f logs/*.log`

### 3. Mise à jour du package.json (optionnel)

**Fichier**: `package.json`

**Changement suggéré**:
```json
{
  "name": "mantos-api",
  "version": "1.0.1",
  "description": "API REST wrapper pour MantisBT"
}
```

Actuellement c'est encore `"name": "blaster-api"`.

---

## 🟡 Actions importantes (post-déploiement)

### 4. Sécurité

**Priorité**: HAUTE

- [ ] Régénérer `SECRET_KEY` et `ADMIN_KEY` en production:
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
- [ ] Retirer les credentials hardcodés dans `auth.controller.ts:43-44`:
  ```typescript
  // ACTUEL (À CHANGER):
  if (dto.username === 'wqt' && dto.password === 'animal-aquatique-nocturne') {

  // SUGGESTION: Utiliser variables d'environnement
  if (dto.username === process.env.ADMIN_USERNAME &&
      dto.password === process.env.ADMIN_PASSWORD) {
  ```
- [ ] Implémenter rate limiting sur `/auth/login`:
  ```bash
  npm install express-rate-limit
  ```

### 5. Tests supplémentaires

**Priorité**: HAUTE

- [ ] Augmenter la couverture de tests (actuellement très faible)
- [ ] Tester tous les endpoints avec Bruno (dossier `/bruno`)
- [ ] Tester les événements WebSocket
- [ ] Tests de charge (Artillery ou k6)

### 6. Monitoring

**Priorité**: MOYENNE

- [ ] Configurer un APM (New Relic, Datadog, Elastic)
- [ ] Configurer des alertes:
  - Taux d'erreur auth externe > 5%
  - Temps de réponse > 1s
  - Disponibilité < 99%
- [ ] Mettre en place un health check endpoint:
  ```typescript
  // src/routes/health.route.ts
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
  });
  ```

### 7. Amélioration de la documentation Swagger

**Priorité**: BASSE

**Actuellement**: Swagger configuré mais pas de JSDoc annotations

**Action**: Ajouter des annotations JSDoc sur les controllers pour auto-génération:

```typescript
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Connexion utilisateur
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 */
public logIn = async (req: Request, res: Response) => { ... }
```

---

## 🟢 Améliorations futures (optionnelles)

### 8. Refresh tokens

**Problème**: Actuellement, JWT expire après 7 jours sans possibilité de refresh

**Solution**: Implémenter un système de refresh token:
- Générer un refresh token en plus du JWT
- Stocker les refresh tokens en DB avec expiration
- Ajouter endpoint `POST /auth/refresh`

### 9. Validation token Mantis

**Problème**: Token Mantis stocké mais jamais revalidé

**Solution**: Vérifier périodiquement la validité:
```typescript
// Middleware ou cron job
async validateMantisToken(token: string): Promise<boolean> {
  try {
    await mantisGET('/users/me', token);
    return true;
  } catch {
    return false;
  }
}
```

### 10. Cache Redis

**Problème**: Requêtes répétées vers MantisBT et DB

**Solution**: Implémenter un cache Redis:
- Cache des projets (TTL: 1h)
- Cache des utilisateurs (TTL: 15min)
- Cache des tags (TTL: 1h)

```bash
npm install redis
```

### 11. Internationalisation (i18n)

**Problème**: Messages d'erreur en anglais/français mixte

**Solution**: Implémenter i18n:
```bash
npm install i18next
```

### 12. Pagination standardisée

**Problème**: Pagination non cohérente entre endpoints

**Solution**: Créer un middleware de pagination:
```typescript
interface PaginationParams {
  page: number;
  pageSize: number;
  total: number;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationParams;
}
```

---

## 📋 Checklist déploiement production

### Avant le déploiement

- [ ] Tous les tests passent
- [ ] Documentation lue par l'équipe Angular
- [ ] API externe testée et stable
- [ ] Variables d'environnement configurées
- [ ] Secrets générés aléatoirement
- [ ] Base de données PostgreSQL créée
- [ ] Migrations Prisma appliquées
- [ ] Backup de l'ancienne version disponible
- [ ] Plan de rollback documenté

### Jour du déploiement

- [ ] Fenêtre de maintenance communiquée
- [ ] Déploiement du nouveau code
- [ ] Vérification logs (pas d'erreurs)
- [ ] Tests de smoke:
  - [ ] Auth locale OK
  - [ ] Auth externe OK
  - [ ] GET /issues OK
  - [ ] WebSocket OK
- [ ] Monitoring activé
- [ ] Équipe notifiée du succès

### Post-déploiement (J+1)

- [ ] Vérifier métriques (erreurs, latence)
- [ ] Vérifier logs (pas d'anomalies)
- [ ] Recueillir feedback utilisateurs
- [ ] Documenter les incidents (si applicable)

---

## 📞 Support et questions

### Pour questions techniques

- Consulter: `docs/API_DOCUMENTATION.md`
- Consulter: `docs/DEPLOYMENT_GUIDE.md`
- Lire: `MIGRATION_SUMMARY.md`

### Pour problèmes de déploiement

- Vérifier: Section "Troubleshooting" dans `DEPLOYMENT_GUIDE.md`
- Logs: `tail -f logs/*.log`

### Pour l'équipe Angular (cahier des charges)

Les questions suivantes doivent être répondues pour rédiger le cahier des charges:

1. **Fonctionnalités principales**:
   - Quels modules? (Dashboard, Issues, Projets, etc.)
   - Niveau de détail par module?
   - Permissions/rôles à implémenter?

2. **UX/UI**:
   - Design system à utiliser? (Material, PrimeNG, custom)
   - Responsive mobile requis?
   - Mode sombre/clair (déjà DB field `theme`)

3. **Temps réel**:
   - Notifications WebSocket: lesquelles afficher?
   - Toast/Snackbar pour updates?
   - Indicateur "qui est en ligne"?

4. **Performance**:
   - Pagination côté serveur ou client?
   - Lazy loading des modules?
   - Cache local (localStorage)?

5. **Intégrations**:
   - Upload de fichiers pour issues?
   - Export Excel/PDF?
   - Liens vers MantisBT natif?

**Suggestion**: Créer un document `ANGULAR_REQUIREMENTS.md` avec ces réponses.

---

## 🎯 Récapitulatif

### Ce qui a été fait ✅

1. ✅ Migration authentification externe complète
2. ✅ Documentation API exhaustive (3 formats)
3. ✅ Guide de déploiement détaillé
4. ✅ Résumé de migration
5. ✅ Fichier .env.example
6. ✅ Suppression code LDAP obsolète

### Ce qui reste à faire ⚠️

1. 🔴 **URGENT**: Configurer `EXTERNAL_AUTH_API_URL` et tester
2. 🔴 **URGENT**: Build et tests locaux
3. 🟡 **IMPORTANT**: Sécuriser secrets et credentials
4. 🟡 **IMPORTANT**: Augmenter couverture tests
5. 🟢 **OPTIONNEL**: Refresh tokens, cache Redis, i18n

---

**Bon courage pour la suite ! 🚀**
