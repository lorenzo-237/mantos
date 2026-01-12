# Cahier des charges - Application Angular Mantos

## Informations générales

**Projet**: Application web de gestion MantisBT
**Backend**: Mantos API v1.0.1
**Date**: [À compléter]
**Équipe**: [Noms des développeurs Angular]
**Chef de projet**: [Nom]

---

## 1. Contexte et objectifs

### 1.1 Contexte du projet

**Type d'application**:

- [x] Nouvelle application (greenfield)
- [ ] Refonte d'application existante
- [ ] Extension d'application existante

**Description**: [À compléter]

### 1.2 Public cible

**Utilisateurs principaux**:

- [x] Développeurs internes
- [x] Équipe support/QA
- [x] Managers/Chef de projet
- [ ] Clients externes
- [ ] Autre: [Préciser]

**Nombre d'utilisateurs estimé**:

- Utilisateurs simultanés max: 20
- Utilisateurs totaux: 50

### 1.3 Objectifs principaux

1. [Objectif 1 - Faciliter la gestion des issues MantisBT]
2. [Objectif 2 - Centraliser les changelogs de versions]
3. [Objectif 3 - Interface moderne et userfriendly]

---

## 2. Stack technique Angular

### 2.1 Version et outils

**Angular**:

- Version: 21
- CLI: 21
- TypeScript: 5

**Gestionnaire de paquets**:

- [x] npm
- [ ] yarn
- [ ] pnpm

### 2.2 Bibliothèques UI

**Design system**:

- [ ] Angular Material (recommandé si app interne)
- [x] PrimeNG (recommandé si beaucoup de tableaux/grilles)
- [ ] Bootstrap + ng-bootstrap
- [x] Tailwind CSS
- [ ] Custom (design propre)

**Justification**: je veux quelque chose de moderne

### 2.3 Bibliothèques supplémentaires

**Gestion d'état** (si application complexe):

- [x] NgRx (Redux pattern)
- [ ] Akita
- [ ] Services Angular simples
- [ ] Autre: [Préciser]

**Graphiques/Visualisation** (si dashboard):

- [ ] Chart.js / ng2-charts
- [ ] ApexCharts
- [ ] D3.js
- [x] Pas nécessaire

**Éditeur de texte riche** (pour notes/description):

- [ ] Quill / ngx-quill
- [ ] TinyMCE
- [ ] CKEditor
- [ ] Textarea simple (Markdown)

conseille moi le mieux poour mon mvp

**WebSocket**:

- [x] socket.io-client (correspondant au backend)

**HTTP Client**:

- [x] HttpClient Angular (standard)

---

## 3. Architecture et structure

### 3.1 Type d'architecture

**Navigation**:

- [x] SPA avec sidebar fixe (recommandé)
- [ ] SPA avec navigation top
- [ ] Multi-pages avec routing
- [ ] PWA (Progressive Web App)

**Structure de modules**:

- [x] Feature modules (un par fonctionnalité majeure)
- [x] Lazy loading des modules (recommandé pour performance)
- [x] Shared module pour composants communs
- [x] Core module pour services globaux

### 3.2 Organisation des dossiers (proposition)

```
src/
├── app/
│   ├── core/                 # Services globaux, guards, interceptors
│   │   ├── auth/
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.guard.ts
│   │   │   └── token.interceptor.ts
│   │   ├── api/
│   │   │   └── api.service.ts
│   │   └── websocket/
│   │       └── websocket.service.ts
│   │
│   ├── shared/               # Composants, pipes, directives partagés
│   │   ├── components/
│   │   │   ├── header/
│   │   │   ├── sidebar/
│   │   │   └── footer/
│   │   ├── pipes/
│   │   └── directives/
│   │
│   ├── features/             # Modules métier (lazy loaded)
│   │   ├── auth/
│   │   │   └── login/
│   │   ├── dashboard/
│   │   ├── issues/
│   │   │   ├── issue-list/
│   │   │   ├── issue-detail/
│   │   │   └── issue-create/
│   │   ├── projects/
│   │   ├── changelogs/
│   │   └── profile/
│   │
│   ├── models/               # Interfaces TypeScript
│   └── app.component.ts
│
└── assets/
    ├── images/
    └── styles/
```

**Validation**: Cette structure vous convient-elle ? Oui

### 3.3 Responsive design

**Support mobile**:

- [x] Obligatoire (fully responsive)
- [ ] Partiellement (lecture seule sur mobile)
- [ ] Non requis (desktop only)

**Breakpoints**:

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

---

## 4. Authentification et sécurité

### 4.1 Flux d'authentification

**Page de login**:

- [x] Formulaire unique avec checkbox "LDAP" (recommandé)
- [ ] Deux formulaires séparés (Local / LDAP)
- [ ] Onglets (Local / LDAP)

**Champs du formulaire**:

```
- Username: [input text]
- Password: [input password]
- LDAP: [checkbox/toggle]
- Se souvenir de moi: [checkbox] (optionnel)
- [Bouton] Connexion
```

**Gestion du token**:

- Stockage du JWT:
  - [ ] localStorage (simple mais moins sécurisé)
  - [ ] sessionStorage (plus sécurisé, perdu à la fermeture)
  - [ ] Cookie httpOnly (nécessite config backend)
- Expiration: 7 jours (configuré backend)
- Refresh token: [Non implémenté actuellement - à discuter]

### 4.2 Guards et interceptors

**Auth Guard**:

```typescript
// Protège les routes nécessitant authentification
canActivate(): boolean {
  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }
  return true;
}
```

**Admin Guard**:

```typescript
// Protège les routes admin (assembly, gestion users)
canActivate(): boolean {
  if (!authService.isAdmin()) {
    router.navigate(['/forbidden']);
    return false;
  }
  return true;
}
```

**Token Interceptor**:

```typescript
// Ajoute automatiquement le JWT à toutes les requêtes
intercept(req, next) {
  const token = authService.getToken();
  req = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });
  return next.handle(req);
}
```

### 4.3 Gestion de session

**Expiration de session**:

- [x] Redirection automatique vers login si 401
- [ ] Modal "Session expirée" avant redirection
- [ ] Refresh automatique du token (si implémenté backend)

**Déconnexion**:

- [x] Bouton "Déconnexion" dans header
- [ ] Suppression du token
- [x] Redirection vers /login

---

## 5. Fonctionnalités principales

### 5.1 Dashboard (page d'accueil)

**Composants à afficher**:

- [] Statistiques globales (issues ouvertes, résolues, etc.)
- [] Graphiques (issues par statut, par priorité)
- [ ] Issues récentes assignées à moi
- [ ] Activité récente (feed)
- [ ] Raccourcis vers projets favoris
- [ ] Autre: [Préciser]

**Niveau de priorité**: [Haute/Moyenne/Basse]

### 5.2 Module Issues

#### 5.2.1 Liste des issues

**Affichage**:

- [ ] Tableau (Material Table / PrimeNG DataTable)
- [ ] Liste de cartes (cards)
- [ ] Vue Kanban (par statut)

**Colonnes du tableau**:

- [ ] ID
- [ ] Résumé (summary)
- [ ] Projet
- [ ] Catégorie
- [ ] Statut
- [ ] Priorité
- [ ] Sévérité
- [ ] Assigné à (handler)
- [ ] Date de création
- [ ] Date de mise à jour
- [ ] Actions (voir détail, éditer)

**Filtres**:

- [ ] Par projet (dropdown)
- [ ] Par statut (multi-select)
- [ ] Par priorité (multi-select)
- [ ] Par assigné (dropdown)
- [ ] Recherche texte (summary/description)
- [ ] Filtres sauvegardés MantisBT (via API)

**Pagination**:

- [ ] Côté serveur (recommandé)
- [ ] Côté client
- Taille de page: [ex: 50, 100, 200]

**Actions globales**:

- [ ] Export Excel/CSV
- [ ] Créer nouvelle issue (bouton)
- [ ] Rafraîchir la liste

#### 5.2.2 Détail d'une issue

**Sections à afficher**:

- [ ] En-tête (ID, résumé, statut avec badge coloré)
- [ ] Informations principales:
  - Projet, catégorie, priorité, sévérité
  - Rapporteur (reporter), Assigné (handler)
  - Dates (création, mise à jour)
- [ ] Description complète (formatée, support Markdown?)
- [ ] Informations additionnelles
- [ ] Tags (liste avec chips)
- [ ] Notes/Commentaires (liste déroulante)
- [ ] Fichiers attachés (liste avec bouton télécharger)
- [ ] Historique des modifications (timeline)

**Actions**:

- [ ] Éditer l'issue (ouvre modal/page)
- [ ] Ajouter une note (textarea + bouton)
- [ ] Attacher un tag (dropdown)
- [ ] Changer le statut (dropdown)
- [ ] Changer l'assignation (dropdown)
- [ ] Télécharger fichier
- [ ] Supprimer l'issue (si autorisé)

**Notifications temps réel**:

- [ ] Toast si l'issue est modifiée par un autre utilisateur
- [ ] Actualisation automatique des données

#### 5.2.3 Création/Édition d'issue

**Formulaire**:

```
- Résumé: [input text, required]
- Description: [textarea, required]
- Projet: [dropdown, required]
- Catégorie: [dropdown, required]
- Priorité: [dropdown]
- Sévérité: [dropdown]
- Informations additionnelles: [textarea]
- Fichiers: [upload, multiple]
- Tags: [multi-select]
```

**Validation**:

- [ ] Validation côté client (Angular forms)
- [ ] Messages d'erreur clairs
- [ ] Désactivation du bouton pendant l'envoi

**Comportement**:

- [ ] Modal (overlay)
- [ ] Page dédiée avec routing
- Mode: Création / Édition

### 5.3 Module Projets

#### 5.3.1 Liste des projets

**Affichage**:

- [ ] Grille de cartes (cards avec image/icône)
- [ ] Tableau
- [ ] Liste simple

**Informations par projet**:

- Nom
- Description (truncated)
- Statut (badge)
- Nombre d'issues ouvertes
- Dernière activité

**Actions**:

- [ ] Voir détails du projet
- [ ] Créer une issue dans ce projet (shortcut)

#### 5.3.2 Détail d'un projet

**Onglets/Sections**:

1. **Vue d'ensemble**:

   - Description complète
   - Statistiques (issues par statut, par priorité)
   - Graphiques

2. **Issues**:

   - Liste des issues du projet (réutilise composant issue-list)
   - Filtres spécifiques au projet

3. **Versions**:

   - Liste des versions (tableau)
   - Colonnes: Nom, Description, Released, Obsolete, Date
   - Actions: Créer version, Éditer version, Générer changelog

4. **Catégories**:

   - Liste des catégories du projet

5. **Utilisateurs**:

   - Liste des utilisateurs assignés au projet
   - Rôles (si applicable)

6. **Filtres**:
   - Liste des filtres MantisBT sauvegardés

**Actions globales**:

- [ ] Créer issue dans ce projet
- [ ] Créer nouvelle version
- [ ] Exporter données

### 5.4 Module Changelogs

**Fonctionnalités**:

1. **Génération de changelog**:

   - Sélection projet (dropdown)
   - Sélection version (dropdown)
   - Sélection version précédente (dropdown, optionnel)
   - [Bouton] Générer

2. **Affichage du changelog**:

   - [ ] Markdown (avec syntax highlighting)
   - [ ] HTML (converti via API)
   - [ ] Prévisualisation côte à côte

3. **Actions**:
   - [ ] Copier dans le presse-papier
   - [ ] Télécharger (Markdown / HTML / PDF)
   - [ ] Envoyer par email (optionnel)

### 5.5 Module Tags

**Fonctionnalités**:

- [ ] Liste de tous les tags (simple liste ou tableau)
- [ ] Filtrer/Rechercher tags
- [ ] Créer nouveau tag (si autorisé par MantisBT)
- [ ] Voir issues associées à un tag

**Priorité**: [Basse - fonctionnalité secondaire]

### 5.6 Module Assembly Info (Admin uniquement)

**Fonctionnalités**:

1. **Liste des assemblies**:

   - Filtres: Projet, Version
   - Tableau avec colonnes: Name, Extension, Path, Version, Checksum, Date

2. **Upload d'assemblies**:

   - Formulaire:
     - Projet (dropdown)
     - Version (dropdown ou input)
     - Fichiers (upload multiple ou JSON)
   - Parsing automatique des infos (nom, extension, checksum, etc.)

3. **Comparaison de versions**:
   - Sélectionner deux versions
   - Afficher différences (fichiers modifiés, ajoutés, supprimés)

**Accès**: Guard Admin uniquement

### 5.7 Module Profil utilisateur

**Sections**:

1. **Informations personnelles**:

   - Username (lecture seule)
   - Nom complet (depuis Mantis, lecture seule)
   - Email (depuis Mantis, lecture seule)

2. **Préférences**:

   - [ ] Thème: [Toggle/Dropdown] Clair / Sombre
   - [ ] Langue (si i18n): [Dropdown]
   - [ ] Notifications par email (si applicable)

3. **Sécurité**:

   - [ ] Changer mot de passe (formulaire)
   - [ ] Voir sessions actives (optionnel)

4. **Activité récente**:
   - [ ] Mes dernières issues créées
   - [ ] Mes dernières notes ajoutées

**Sauvegarde**:

- [ ] Bouton "Enregistrer" (patch /users)
- [ ] Toast de confirmation

---

## 6. Fonctionnalités temps réel (WebSocket)

### 6.1 Connexion WebSocket

**Initialisation**:

```typescript
// Dans un service global (WebSocketService)
const socket = io(environment.apiUrl, {
  extraHeaders: {
    access_token: this.authService.getToken(),
  },
});
```

**Reconnexion automatique**:

- [ ] Oui (géré par socket.io-client)

### 6.2 Events à écouter

#### Event: `update_issue`

**Comportement**:

- [ ] Toast/Snackbar: "L'issue #1234 a été modifiée par User X"
- [ ] Rafraîchir automatiquement si on est sur la page de l'issue
- [ ] Badge de notification sur le menu "Issues"

#### Event: `add_version`

**Comportement**:

- [ ] Toast: "Nouvelle version ajoutée: v2.5.0 pour Projet X"
- [ ] Rafraîchir la liste des versions si on est sur la page projet

#### Event: `update_vues`

**Comportement**:

- [ ] Synchroniser l'état des filtres entre onglets/fenêtres
- [ ] (Optionnel, si nécessaire)

### 6.3 Affichage "Qui est en ligne"

**Requis?**:

- [ ] Oui, afficher dans la sidebar
- [ ] Oui, afficher dans une modal
- [ ] Non, pas nécessaire

**Format**:

- Liste des utilisateurs connectés avec avatar/icône verte

---

## 7. UX/UI et design

### 7.1 Charte graphique

**Couleurs principales**:

- Primaire: [ex: #3f51b5] (bleu Material)
- Secondaire: [ex: #ff4081] (rose)
- Erreur: [ex: #f44336] (rouge)
- Succès: [ex: #4caf50] (vert)
- Avertissement: [ex: #ff9800] (orange)

**Logo/Branding**:

- [ ] Logo fourni par client
- [ ] Logo à créer
- [ ] Pas de logo (texte simple)

### 7.2 Thème clair/sombre

**Implémentation**:

- [ ] Oui, requis (champ `theme` existe en DB)
- Méthode:
  - [ ] CSS classes (.light-theme / .dark-theme)
  - [ ] Angular Material theming
  - [ ] CSS variables

**Persistance**:

- [ ] Sauvegardé en DB (via PATCH /users)
- [ ] localStorage (optionnel pour changement immédiat)

### 7.3 Layout

**Structure de page**:

```
┌──────────────────────────────────────┐
│ Header (Logo, User menu, Logout)    │
├─────────┬────────────────────────────┤
│         │                            │
│ Sidebar │  Contenu principal         │
│ (Menu)  │  (Router outlet)           │
│         │                            │
│         │                            │
├─────────┴────────────────────────────┤
│ Footer (optionnel)                   │
└──────────────────────────────────────┘
```

**Sidebar**:

- [ ] Fixe (toujours visible)
- [ ] Collapsible (réductible)
- Largeur: [ex: 250px étendu, 60px réduit]

**Menu items**:

- Dashboard
- Issues
- Projets
- Changelogs
- Tags (optionnel)
- Assembly (si admin)
- Profil

### 7.4 Composants réutilisables

**À créer**:

- [ ] Header component
- [ ] Sidebar component
- [ ] Breadcrumb component
- [ ] Loading spinner component
- [ ] Error message component
- [ ] Confirmation dialog component
- [ ] Toast/Snackbar service

---

## 8. Intégrations et fichiers

### 8.1 Upload de fichiers

**Pour issues**:

- [ ] Requis
- [ ] Optionnel
- [ ] Non nécessaire

**Configuration**:

- Taille max par fichier: [ex: 10 MB]
- Types autorisés: [ex: images, PDF, ZIP, logs]
- Upload multiple: [Oui/Non]
- Drag & drop: [Oui/Non]

**Implémentation**:

```typescript
// Via API MantisBT ou endpoint Mantos?
POST /issues/:id/attachments
```

**Prévisualisation**:

- [ ] Prévisualisation images
- [ ] Icône par type de fichier
- [ ] Nom + taille affichés

### 8.2 Export de données

**Formats requis**:

- [ ] Excel (.xlsx)
- [ ] CSV
- [ ] PDF
- [ ] JSON

**Données à exporter**:

- [ ] Liste d'issues (avec filtres appliqués)
- [ ] Changelogs
- [ ] Assembly info
- [ ] Statistiques

**Implémentation**:

- [ ] Côté client (bibliothèque: xlsx, jsPDF)
- [ ] Côté serveur (API fournit le fichier)

### 8.3 Génération de changelogs formatés

**Formats disponibles**:

- [ ] Markdown (depuis API: GET /changelogs)
- [ ] HTML (depuis API: POST /changelogs/html)
- [ ] PDF (à implémenter: conversion HTML → PDF côté client)

**Templates**:

- [ ] Template par défaut
- [ ] Templates personnalisables (optionnel)

### 8.4 Intégrations externes

**Liens vers MantisBT natif**:

- [ ] Bouton "Voir dans MantisBT" (ouvre issue dans MantisBT natif)
- URL: `${MANTIS_URL}/view.php?id={issue_id}`

**Autres intégrations**:

- [ ] Slack (notifications)
- [ ] Jira (export/import)
- [ ] GitHub (liens vers commits)
- [ ] Autre: [Préciser]

---

## 9. Performance et optimisation

### 9.1 Stratégies de chargement

**Lazy loading**:

- [ ] Modules métier lazy loaded
- [ ] Images lazy loaded (directive ou IntersectionObserver)

**Pagination**:

- [ ] Côté serveur (recommandé pour grandes listes)
- [ ] Virtual scrolling (pour très grandes listes)

**Cache**:

- [ ] Cache HTTP (interceptor)
- [ ] Cache en mémoire (services)
- [ ] localStorage (données statiques: projets, catégories)

### 9.2 Indicateurs de chargement

**Spinners**:

- [ ] Spinner global (top bar, comme YouTube)
- [ ] Spinners locaux (par composant)
- [ ] Skeleton screens (pour listes)

**Feedback utilisateur**:

- [ ] Toast pour succès/erreur
- [ ] Progress bar pour uploads
- [ ] Messages informatifs

---

## 10. Tests et qualité

### 10.1 Tests unitaires

**Framework**: Jasmine + Karma (défaut Angular)

**Couverture cible**:

- [ ] 80% minimum
- [ ] 60% minimum
- [ ] Pas de minimum (best effort)

**Éléments à tester**:

- [ ] Services (logique métier)
- [ ] Components (interactions)
- [ ] Guards
- [ ] Pipes

### 10.2 Tests end-to-end

**Framework**:

- [ ] Cypress (recommandé)
- [ ] Playwright
- [ ] Protractor (deprecated)
- [ ] Pas de tests E2E

**Scénarios critiques**:

- [ ] Connexion/Déconnexion
- [ ] Créer une issue
- [ ] Commenter une issue
- [ ] Générer un changelog

### 10.3 Linting et formatting

**ESLint + Prettier**:

- [ ] Oui, configuration stricte
- [ ] Oui, configuration souple
- [ ] Non

**Pre-commit hooks** (Husky):

- [ ] Lint avant commit
- [ ] Tests avant commit
- [ ] Pas de hooks

---

## 11. Accessibilité (A11y)

**Niveau WCAG visé**:

- [ ] AA (recommandé minimum)
- [ ] AAA
- [ ] Non prioritaire

**Fonctionnalités**:

- [ ] Navigation au clavier
- [ ] ARIA labels
- [ ] Contraste de couleurs conforme
- [ ] Support lecteurs d'écran

---

## 12. Internationalisation (i18n)

**Requis?**:

- [ ] Oui
- [ ] Non (uniquement français)

**Langues**:

- [ ] Français (par défaut)
- [ ] Anglais
- [ ] Autre: [Préciser]

**Bibliothèque**:

- [ ] @angular/localize (officiel)
- [ ] ngx-translate
- [ ] i18next

---

## 13. Environnements et déploiement

### 13.1 Environnements

**Fichiers de configuration**:

```typescript
// environment.ts (dev)
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  mantisUrl: 'http://localhost/mantis',
};

// environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.mantos.example.com',
  mantisUrl: 'https://mantis.example.com',
};
```

**Autres environnements**:

- [ ] Staging
- [ ] QA
- [ ] Pre-prod

### 13.2 Build et déploiement

**Commandes**:

```bash
# Build production
ng build --configuration production

# Output dans dist/
```

**Hébergement**:

- [ ] Serveur web interne (Apache/Nginx)
- [ ] CDN (Cloudflare, AWS CloudFront)
- [ ] Plateforme cloud (Vercel, Netlify)

**CI/CD**:

- [ ] GitLab CI
- [ ] GitHub Actions
- [ ] Jenkins
- [ ] Autre: [Préciser]

---

## 14. Documentation et formation

### 14.1 Documentation développeur

**À produire**:

- [ ] README avec setup instructions
- [ ] Documentation des composants (Compodoc)
- [ ] Guide de contribution
- [ ] Architecture Decision Records (ADR)

### 14.2 Documentation utilisateur

**À produire**:

- [ ] Guide d'utilisation (PDF ou wiki)
- [ ] Vidéos de démonstration
- [ ] Tooltips dans l'interface
- [ ] FAQ

### 14.3 Formation

**Nécessaire?**:

- [ ] Oui, session de formation prévue
- [ ] Non, interface intuitive
- Durée: [ex: 2 heures]

---

## 15. Planning et livrables

### 15.1 Phases de développement

**Phase 1: Setup et authentification (Sprint 1)**

- Setup projet Angular
- Authentification (login/logout)
- Guards et interceptors
- Layout (header, sidebar)

**Phase 2: Module Issues (Sprint 2-3)**

- Liste des issues
- Détail d'une issue
- Création/Édition d'issue

**Phase 3: Module Projets (Sprint 4)**

- Liste des projets
- Détail d'un projet
- Gestion des versions

**Phase 4: Modules secondaires (Sprint 5)**

- Changelogs
- Profil utilisateur
- Tags

**Phase 5: WebSocket et polish (Sprint 6)**

- Intégration WebSocket
- Notifications temps réel
- Thème clair/sombre
- Optimisations performance

**Phase 6: Tests et déploiement (Sprint 7)**

- Tests E2E
- Corrections bugs
- Documentation
- Déploiement production

### 15.2 Livrables

- [ ] Code source sur GitLab/GitHub
- [ ] Build de production
- [ ] Documentation technique
- [ ] Documentation utilisateur
- [ ] Tests (unitaires + E2E)

---

## 16. Risques et contraintes

**Risques identifiés**:

1. **API externe indisponible**: Impossible de s'authentifier

   - Mitigation: Mode "offline" avec auth locale uniquement?

2. **Performance MantisBT**: Lenteur si beaucoup d'issues

   - Mitigation: Pagination, cache, lazy loading

3. **Compatibilité navigateurs**: Anciens navigateurs non supportés
   - Mitigation: Définir minimum (ex: Chrome 90+, Firefox 88+)

**Contraintes**:

- Budget: [À compléter]
- Délai: [À compléter]
- Ressources: [X développeurs Angular]

---

## 17. Critères d'acceptation

**Application fonctionnelle**:

- [ ] Toutes les fonctionnalités principales implémentées
- [ ] Pas de bugs bloquants
- [ ] Performance acceptable (< 2s par page)

**Qualité de code**:

- [ ] Couverture tests > [X]%
- [ ] Linting 0 erreurs
- [ ] Pas de console.log en production

**UX/UI**:

- [ ] Design validé par client
- [ ] Responsive sur mobile/tablette/desktop
- [ ] Thème clair/sombre fonctionnel

**Documentation**:

- [ ] README complet
- [ ] Documentation utilisateur
- [ ] Formation effectuée (si requis)

---

## 18. Signatures et validation

**Rédacteur**: [Nom]
**Date**: [Date]

**Validation équipe dev Angular**: **\*\***\_\_\_**\*\***
**Validation chef de projet**: **\*\***\_\_\_**\*\***
**Validation client/sponsor**: **\*\***\_\_\_**\*\***

---

## Annexes

### Annexe A: API Endpoints (référence)

Voir documentation complète: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

**Endpoints principaux**:

- `POST /auth/login` - Authentification
- `GET /users/me` - Infos utilisateur
- `GET /issues` - Liste issues
- `GET /issues/:id` - Détail issue
- `POST /issues` - Créer issue
- `GET /projects` - Liste projets
- `GET /changelogs` - Générer changelog
- Voir [docs/openapi.yaml](./openapi.yaml) pour spec complète

### Annexe B: Modèles de données

Voir [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) section "Modèles de données".

### Annexe C: Maquettes UI (à ajouter)

[Insérer screenshots, wireframes ou mockups Figma/Adobe XD]

---

**Fin du cahier des charges**
