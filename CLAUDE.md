# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Mantos** is a full-stack application for managing MantisBT (bug tracking system) with a modern web interface. The project consists of two main parts:

1. **mantos-api** - Node.js/Express/TypeScript REST API and WebSocket server that wraps and extends MantisBT
2. **mantos-app** - Angular 21 frontend application with PrimeNG, Tailwind CSS, and NgRx

## Repository Structure

```
mantos/
├── mantos-api/       # Backend API (Express + TypeScript + Prisma)
└── mantos-app/       # Frontend app (Angular 21 + PrimeNG + NgRx)
```

---

## Backend (mantos-api)

### Development Commands

**Running the Application**:
- `npm run dev` - Start development server with hot reload (nodemon)
- `npm start` - Run production build
- `npm run build` - Compile TypeScript and resolve path aliases (tsc + tsc-alias)

**Testing and Linting**:
- `npm run app:test` - Run Jest tests
- `npm run lint` - Check for linting issues
- `npm run lint:fix` - Automatically fix linting issues

**Database Management** (CRITICAL - Two separate Prisma schemas):

Generate Prisma clients:
- `npm run generate:mantis` - Generate Mantis client
- `npm run generate:blaster` - Generate Blaster client
- `npm run generate` - Generate both clients

Migrations (Blaster database only):
- `npm run migrate:blaster` - Run migrations in development
- `npm run deploy:blaster` - Deploy migrations to production

### Dual Database Architecture

The backend uses **TWO separate Prisma schemas** for different databases:

1. **Mantis Database (MySQL)** - Read-only access to MantisBT's existing schema
   - Schema: `prisma/mantis.prisma`
   - Generated client: `@/prisma/mantis-cli`
   - Contains: issues, users, projects, categories, tags, versions, relationships
   - Access via: `PrismaMantis` from `@/config/prisma`

2. **Mantos Database (PostgreSQL)** - Application-owned data
   - Schema: `prisma/blaster.prisma` (legacy name preserved)
   - Generated client: `@/prisma/blaster-cli`
   - Contains: user authentication, admin tokens, project versions, assembly information
   - Access via: `PrismaBlaster` from `@/config/prisma`

Both Prisma clients are initialized in `src/config/prisma.ts` as `PrismaMantis` and `PrismaBlaster`.

### Request Flow

1. **Routes** (`src/routes/`) - Define Express route paths and attach middleware
2. **Middlewares** (`src/middlewares/`) - Handle auth, validation, admin checks, errors
3. **Controllers** (`src/controllers/`) - HTTP handlers, parse request/response
4. **Services** (`src/services/`) - Business logic, database queries, Mantis API integration
5. **Mantis Requests** (`src/mantis/mantis.request.ts`) - Wrapper for MantisBT REST API calls

### Key Patterns

**Dependency Injection**: Uses TypeDI's `@Service()` decorator for service classes and `Container.get()` for dependency resolution.

**Validation**: Uses `class-validator` with DTOs. Apply `ValidationMiddleware(DtoClass)` to routes.

**Path Aliases**: TypeScript path mapping configured in `tsconfig.json`. Use aliases like `@/`, `@config`, `@services/*`. Build requires `tsc-alias` to resolve aliases.

**Authentication Flow**:
1. User authenticates via external API (replaces direct LDAP) or local credentials
2. External API (`EXTERNAL_AUTH_API_URL`) validates credentials and returns JWT
3. Mantos API fetches Mantis token from external API using external JWT
4. Mantos database stores user with hashed password and Mantis API token
5. Mantos generates its own JWT token (using `SECRET_KEY`) containing user ID
6. `AuthMiddleware` validates Mantos JWT, retrieves user from Mantos DB, fetches Mantis user info, attaches to `req.user`

**External Authentication API** endpoints:
- `POST /api/v1/auth/login` with `{uid, password}` - Returns external JWT
- `POST /api/v1/mantis/token` with external JWT - Returns Mantis API token

**Middleware Chain**:
- `AuthMiddleware` - Requires valid JWT token, populates `req.user`
- `AdminMiddleware` - Requires `isAdmin` flag in Blaster database
- `AdminOrAuthMiddleware` - Requires either admin status or valid auth

### WebSocket Integration

Socket.IO server is initialized in `src/app.ts` and listens for connections with JWT authentication via `access_token` header. The socket ID is stored per user in the Blaster database.

Real-time events:
- `update_issue` - Broadcast issue changes to other clients
- `add_version` - Notify clients when versions are added
- `update_vues` - Synchronize view state changes

### Environment Configuration

Environment files follow the pattern `.env.{NODE_ENV}.local`. To override, set `ENV_PATH` environment variable.

Required variables:
- `DATABASE_URL` - Mantis MySQL connection
- `DATABASE_PG_URL` - Mantos PostgreSQL connection
- `MANTIS_API_URL` - MantisBT REST API endpoint
- `EXTERNAL_AUTH_API_URL` - External authentication API base URL
- `SECRET_KEY` - JWT signing secret for Mantos tokens
- `ADMIN_KEY` - Admin token validation key

---

## Frontend (mantos-app)

### Development Commands

```bash
npm start              # Dev server (port 4200)
npm run build          # Build production
npm test               # Tests with Vitest
npm run lint           # Check ESLint issues
```

### Tech Stack

- **Angular 21** with TypeScript 5 (standalone components)
- **PrimeNG 21** (Aura theme) + **Tailwind CSS 4**
- **NgRx** (Store, Effects, Entity) for state management
- **Socket.IO Client** for real-time updates
- **ESLint** + **Prettier**

### Architecture

```
src/app/
├── core/                   # Global services (auth, api, websocket, guards, interceptors)
├── shared/                 # Reusable components
├── features/               # Lazy-loaded feature modules (auth, dashboard, issues, projects...)
├── store/                  # NgRx Store (actions, reducers, effects, selectors)
├── models/                 # TypeScript interfaces (user, issue, project)
└── environments/           # Dev/prod configurations
```

### Core Services

**AuthService** (`core/auth/auth.service.ts`):
- `login(credentials)` - Authenticate user
- `logout()` - Sign out
- `isAuthenticated()` / `isAdmin()` - Checks
- `currentUser` - Angular signal for reactive user state

**ApiService** (`core/api/api.service.ts`):
- `get<T>(endpoint, params?)` - GET request
- `post<T>(endpoint, body)` - POST request
- `patch<T>(endpoint, body)` - PATCH request
- `delete<T>(endpoint)` - DELETE request

**WebsocketService** (`core/websocket/websocket.service.ts`):
- `connect()` / `disconnect()` - Manage Socket.IO connection
- `onUpdateIssue()` / `onAddVersion()` / `onUpdateVues()` - Observable events
- `emitUpdateIssue()` / `emitAddVersion()` - Emit events

### Guards & Interceptors

- **authGuard** - Protects routes requiring authentication
- **adminGuard** - Protects admin-only routes
- **tokenInterceptor** - Automatically adds JWT to requests
- **errorInterceptor** - Handles 401/403 errors

### Styling

**Tailwind CSS**: Configured in `tailwind.config.js` with `preflight: false` for PrimeNG compatibility.

**PrimeNG**: Aura theme configured in `app.config.ts`. Main components: Table, Button, Dialog, Toast, Card, Dropdown, MultiSelect.

### Conventions

- **Components**: `kebab-case` (e.g., `issue-list.component.ts`)
- **Services**: `camelCase.service.ts`
- **Signals** for reactive state
- **Standalone components** (no NgModule)
- Use `inject()` instead of constructor injection

---

## Working Across Both Projects

When making changes that affect both frontend and backend:

1. **API Changes**: Update backend routes/controllers first, then update Angular services
2. **Authentication**: Backend generates JWT, frontend stores in localStorage and adds to requests via interceptor
3. **Real-time**: Backend emits Socket.IO events, frontend subscribes via WebsocketService
4. **Models**: Keep TypeScript interfaces in sync between `mantos-api/src/interfaces/` and `mantos-app/src/app/models/`

## Important Notes

- Backend uses TWO Prisma schemas - always specify which database when working with data
- Path aliases in backend require `tsc-alias` during build
- Frontend uses standalone components (Angular 21+)
- Socket.IO authentication requires JWT in `access_token` header
- External authentication API is used instead of direct LDAP integration
