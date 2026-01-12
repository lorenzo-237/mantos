# Mantos App - Frontend Angular

Application web moderne pour la gestion de MantisBT, construite avec Angular 21, PrimeNG, Tailwind CSS et NgRx.

---

## 🚀 Quick Start

```bash
# Installer les dépendances
npm install

# Démarrer en développement
npm start
# → http://localhost:4200

# Build production
npm run build

# Tests
npm test

# Linting
npm run lint
```

---

## 📦 Stack Technique

- **Angular 21** + TypeScript 5
- **PrimeNG** (Aura theme) + **Tailwind CSS**
- **NgRx** (Store, Effects, Entity)
- **Socket.IO Client** (WebSocket temps réel)
- **ESLint** + **Prettier**

---

## 🏗️ Architecture

```
src/app/
├── core/                   # Services globaux (auth, api, websocket, guards, interceptors)
├── shared/                 # Composants réutilisables
├── features/               # Modules métier lazy loaded (auth, dashboard, issues, projects...)
├── store/                  # NgRx Store (actions, reducers, effects, selectors)
├── models/                 # Interfaces TypeScript (user, issue, project)
└── environments/           # Configurations dev/prod
```

### Services principaux créés

✅ **AuthService** (`core/auth/auth.service.ts`)
- `login(credentials)` - Authentification (local/LDAP)
- `logout()` - Déconnexion
- `isAuthenticated()` / `isAdmin()` - Vérifications
- `currentUser` - Signal Angular pour l'utilisateur connecté

✅ **ApiService** (`core/api/api.service.ts`)
- `get<T>(endpoint, params?)` - GET request
- `post<T>(endpoint, body)` - POST request
- `patch<T>(endpoint, body)` - PATCH request
- `delete<T>(endpoint)` - DELETE request

✅ **WebsocketService** (`core/websocket/websocket.service.ts`)
- `connect()` / `disconnect()` - Gestion connexion Socket.IO
- `onUpdateIssue()` / `onAddVersion()` / `onUpdateVues()` - Observables events
- `emitUpdateIssue()` / `emitAddVersion()` - Émettre des events

### Guards & Interceptors

✅ **authGuard** - Protège les routes nécessitant authentification
✅ **adminGuard** - Protège les routes admin
✅ **tokenInterceptor** - Ajoute automatiquement le JWT aux requêtes
✅ **errorInterceptor** - Gère les erreurs 401/403

---

## 🎨 Styling

### Tailwind CSS

Config dans `tailwind.config.js` avec couleurs personnalisées et `preflight: false` (compatibilité PrimeNG).

```html
<div class="flex items-center p-4 bg-primary-50">
  <h1 class="text-2xl font-bold text-primary-900">Title</h1>
</div>
```

### PrimeNG

Thème **Aura** configuré dans `app.config.ts`.

Composants recommandés:
- **Table** / **DataTable** - Listes
- **Button** - Boutons
- **Dialog** - Modals
- **Toast** - Notifications
- **Card**, **Dropdown**, **MultiSelect**

```html
<p-button label="Créer" icon="pi pi-plus"></p-button>
<p-table [value]="issues" [paginator]="true" [rows]="50">
  <!-- ... -->
</p-table>
```

---

## 🔐 Authentification

### Flux

1. User remplit le formulaire → `POST /auth/login`
2. Backend génère JWT → Frontend stocke dans `localStorage`
3. `tokenInterceptor` ajoute le JWT à toutes les requêtes

### Usage

```typescript
authService = inject(AuthService);

// Signal réactif
user = this.authService.currentUser;

// Login
this.authService.login({ username, password, ldap: true }).subscribe(...);

// Logout
this.authService.logout();
```

### Protection des routes

```typescript
{
  path: 'dashboard',
  canActivate: [authGuard],
  loadComponent: () => import('./features/dashboard/dashboard.component')
}
```

---

## 🌐 WebSocket

```typescript
wsService = inject(WebsocketService);

ngOnInit() {
  this.wsService.connect();

  // Écouter les events
  this.wsService.onUpdateIssue().subscribe(data => {
    console.log('Issue updated:', data.issue_id);
  });
}
```

---

## 📡 Appels API

```typescript
apiService = inject(ApiService);

getIssues() {
  return this.apiService.get<{ issues: Issue[] }>('/issues', { project_id: 1 });
}

createIssue(data: CreateIssueRequest) {
  return this.apiService.post<Issue>('/issues', data);
}
```

Le token JWT est ajouté automatiquement via `tokenInterceptor`.

---

## 🔧 Configuration

### Environments

**Dev** (`environments/environment.ts`):
```typescript
{
  production: false,
  apiUrl: 'http://localhost:3000',
  wsUrl: 'http://localhost:3000'
}
```

**Prod** (`environments/environment.prod.ts`):
```typescript
{
  production: true,
  apiUrl: 'https://api.mantos.example.com',
  wsUrl: 'https://api.mantos.example.com'
}
```

---

## 📝 Conventions

- **Components**: `kebab-case` (ex: `issue-list.component.ts`)
- **Services**: `camelCase.service.ts`
- **Signals** Angular pour état réactif
- **Standalone components** (pas de NgModule)
- **inject()** au lieu de constructor injection

---

## 🚦 Commandes

```bash
npm start              # Dev server (port 4200)
npm run build          # Build production
npm test               # Tests unitaires
npm run lint           # Vérifier le code
npm run lint:fix       # Corriger automatiquement
```

---

## 📚 Documentation

- **API Backend**: [../mantos-api/docs/API_DOCUMENTATION.md](../mantos-api/docs/API_DOCUMENTATION.md)
- **OpenAPI**: [../mantos-api/docs/openapi.yaml](../mantos-api/docs/openapi.yaml)
- **Cahier des charges complet**: [../mantos-api/docs/ANGULAR_REQUIREMENTS_TEMPLATE.md](../mantos-api/docs/ANGULAR_REQUIREMENTS_TEMPLATE.md)

---

## 🎯 Prochaines étapes (MVP)

### Sprint 1 - Setup & Auth
- [ ] Page de login (PrimeNG formulaire)
- [ ] Layout (header + sidebar + router-outlet)
- [ ] Dashboard vide

### Sprint 2-3 - Issues
- [ ] Liste des issues (PrimeNG Table)
- [ ] Détail d'une issue
- [ ] Filtres de base

### Sprint 4 - Projets
- [ ] Liste des projets
- [ ] Détail avec onglets (versions, issues, etc.)

Voir [ANGULAR_REQUIREMENTS_TEMPLATE.md](../mantos-api/docs/ANGULAR_REQUIREMENTS_TEMPLATE.md) pour le plan complet.

---

**Généré avec Angular CLI v21.0.5 | Setup par Claude Code 🚀**
