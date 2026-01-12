# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Mantos API**, a Node.js/Express/TypeScript API that serves as a wrapper and extension layer over MantisBT (bug tracking system). It provides REST endpoints, WebSocket support, and manages two separate databases via Prisma.

## Development Commands

### Running the Application
- `npm run dev` - Start development server with hot reload (uses nodemon)
- `npm start` - Run production build
- `npm run build` - Compile TypeScript and resolve path aliases (tsc + tsc-alias)

### Testing and Linting
- `npm run app:test` - Run Jest tests
- `npm run lint` - Check for linting issues
- `npm run lint:fix` - Automatically fix linting issues

### Database Management

**Important: This project uses TWO separate Prisma schemas:**

1. **Mantis Schema** (`prisma/mantis.prisma`) - MySQL database (read-only access to existing MantisBT database)
2. **Mantos Schema** (`prisma/blaster.prisma`) - PostgreSQL database (application-specific data, still named "blaster" for legacy reasons)

Generate Prisma clients:
- `npm run generate:mantis` - Generate Mantis client
- `npm run generate:blaster` - Generate Blaster client
- `npm run generate` - Generate both clients

Migrations (Blaster database only):
- `npm run migrate:blaster` - Run migrations in development
- `npm run deploy:blaster` - Deploy migrations to production

## Architecture

### Dual Database System

The application uses two Prisma clients for separate databases:

- **Mantis Database (MySQL)**: Read-only access to MantisBT's existing schema. Contains issues, users, projects, categories, tags, versions, and relationships. Generated client: `@/prisma/mantis-cli`
- **Mantos Database (PostgreSQL)**: Application-owned data including user authentication, admin tokens, project versions, and assembly information. Generated client: `@/prisma/blaster-cli` (legacy name preserved in code)

Prisma client instances are initialized in [src/config/prisma.ts](src/config/prisma.ts) as `PrismaMantis` and `PrismaBlaster`.

### Request Flow

1. **Routes** ([src/routes/](src/routes/)) - Define Express route paths and attach middleware
2. **Middlewares** ([src/middlewares/](src/middlewares/)) - Handle auth, validation, admin checks, and errors
3. **Controllers** ([src/controllers/](src/controllers/)) - HTTP handlers, parse request/response
4. **Services** ([src/services/](src/services/)) - Business logic, database queries, and Mantis API integration
5. **Mantis Requests** ([src/mantis/mantis.request.ts](src/mantis/mantis.request.ts)) - Wrapper functions for MantisBT REST API calls

### Key Patterns

**Dependency Injection**: Uses TypeDI's `@Service()` decorator for service classes and `Container.get()` for dependency resolution.

**Validation**: Uses `class-validator` with DTOs. Apply `ValidationMiddleware(DtoClass)` to routes.

**Path Aliases**: TypeScript path mapping is configured in [tsconfig.json](tsconfig.json). Use aliases like `@/`, `@config`, `@services/*`, etc. Build requires `tsc-alias` to resolve aliases.

**Authentication Flow**:
1. User authenticates via external API (replaces direct LDAP) or local credentials
2. External API (`EXTERNAL_AUTH_API_URL`) validates credentials and returns a JWT
3. Mantos API fetches the Mantis token from external API using the external JWT
4. Mantos database stores user with hashed password and Mantis API token
5. Mantos generates its own JWT token (using `SECRET_KEY`) containing user ID
6. `AuthMiddleware` validates Mantos JWT, retrieves user from Mantos DB, fetches Mantis user info, and attaches to `req.user`

**External Authentication API** ([src/api/externalAuth.client.ts](src/api/externalAuth.client.ts)):
- `POST /api/v1/auth/login` with `{uid, password}` - Returns external JWT
- `POST /api/v1/mantis/token` with external JWT - Returns Mantis API token

**Middleware Chain**:
- `AuthMiddleware` - Requires valid JWT token, populates `req.user`
- `AdminMiddleware` - Requires `isAdmin` flag in Blaster database
- `AdminOrAuthMiddleware` - Requires either admin status or valid auth

### WebSocket Integration

Socket.IO server is initialized in [src/app.ts](src/app.ts) and listens for connections with JWT authentication via `access_token` header. The socket ID is stored per user in the Blaster database.

Real-time events:
- `update_issue` - Broadcast issue changes to other clients
- `add_version` - Notify clients when versions are added
- `update_vues` - Synchronize view state changes

### Environment Configuration

Environment files follow the pattern `.env.{NODE_ENV}.local`. To override, set `ENV_PATH` environment variable. See [src/config/index.ts](src/config/index.ts).

Required variables:
- `DATABASE_URL` - Mantis MySQL connection
- `DATABASE_PG_URL` - Mantos PostgreSQL connection
- `MANTIS_API_URL` - MantisBT REST API endpoint
- `EXTERNAL_AUTH_API_URL` - External authentication API base URL (replaces direct LDAP)
- `SECRET_KEY` - JWT signing secret for Mantos tokens
- `ADMIN_KEY` - Admin token validation key

### API Testing

Bruno API client files are located in [bruno/](bruno/) directory for testing endpoints during development.
