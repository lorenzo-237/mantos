# Sprint 1 - Auth & Layout Implementation

## Overview
Sprint 1 implements the authentication system and main application layout for the Mantos Angular application.

## Implemented Features

### 1. Login Page (`src/app/features/auth/login/`)
**File:** `login.component.ts`

Features:
- Standalone Angular component using Angular 21 patterns
- Reactive forms with validation (username and password required)
- LDAP authentication option (checkbox)
- PrimeNG components: Card, InputText, Password, Button, Checkbox
- Toast notifications for success/error messages
- Automatic redirect to dashboard on successful login
- Loading state with disabled submit button
- Beautiful gradient header design
- Responsive Tailwind CSS styling

Key Implementation Details:
- Uses `inject()` function for modern dependency injection
- Signal-based loading state with `signal(false)`
- Integrates with existing `AuthService.login()` method
- Handles errors gracefully with PrimeNG Toast
- Follows Angular best practices with OnPush change detection

### 2. Main Layout (`src/app/shared/layout/`)
**File:** `layout.component.ts`

Features:
- Collapsible sidebar navigation
- Top header bar with user info and logout
- Dynamic menu items based on user role (admin menu items)
- User avatar with dropdown menu (Profile, Settings, Logout)
- Theme toggle button (dark/light mode)
- Notifications button (placeholder)
- Router outlet for page content
- Footer with version info
- Fully responsive design

Key Components:
- **Sidebar:**
  - Collapsible with animation
  - Menu items: Dashboard, Issues, Projects
  - Admin section (visible only to admins): Users, Settings
  - Active route highlighting
  - Badges for issue counts
  - Icons from PrimeIcons

- **Header:**
  - Dynamic page title based on current route
  - User information display (username, role)
  - Avatar with user initials
  - Quick actions menu
  - Theme toggle functionality

- **Navigation:**
  - Uses Angular Router with `routerLink` and `routerLinkActive`
  - Lazy-loaded routes for optimal performance
  - Role-based access control integration

### 3. Dashboard Page (`src/app/features/dashboard/`)
**File:** `dashboard.component.ts`

Features:
- Welcome banner with user greeting
- Stats cards (Open Issues, In Progress, Resolved, Projects)
- Recent Issues section (placeholder with skeleton loaders)
- Activity Feed section (placeholder)
- Quick Actions grid (New Issue, My Issues, Projects, Reports)
- Placeholder data with proper structure for future API integration
- Responsive card-based layout

Design Elements:
- Gradient welcome banner
- Stat cards with icons and trend indicators
- Empty states with helpful messages
- Skeleton loaders for loading states
- Interactive quick action buttons

### 4. Routing Configuration (`src/app/app.routes.ts`)

Route Structure:
```
/login                    - Public login page
/ (with layout)           - Protected routes with main layout
  ├── /dashboard          - Dashboard (default redirect)
  ├── /issues/*           - Issues module (lazy loaded)
  ├── /projects/*         - Projects module (lazy loaded)
  ├── /profile            - User profile
  └── /admin/*            - Admin section (protected by adminGuard)
      ├── /admin/users
      └── /admin/settings
```

Guards:
- `authGuard` - Protects all routes except /login
- `adminGuard` - Protects admin routes

Features:
- Lazy loading for all feature modules
- Title strategy for browser tab titles
- Proper fallback route (** redirects to /dashboard)

### 5. Global Configuration

**Toast Service (`src/app/app.config.ts`):**
- Global `MessageService` provider for Toast notifications
- Configured PrimeNG with Aura theme
- Dark mode support with `.dark-theme` selector

**App Component (`src/app/app.ts`):**
- Global Toast component for notifications
- Router outlet for routing

## Placeholder Components Created

For future sprints, the following placeholder components were created:

### Issues Module
- `issues-list.component.ts` - Issues list view
- `issue-create.component.ts` - Create new issue
- `issue-detail.component.ts` - View issue details
- `issues.routes.ts` - Issues routing configuration

### Projects Module
- `projects-list.component.ts` - Projects list view
- `project-detail.component.ts` - View project details
- `projects.routes.ts` - Projects routing configuration

### Admin Module
- `admin-users.component.ts` - User management
- `admin-settings.component.ts` - System settings

### Other
- `profile.component.ts` - User profile page

## Integration Points

### AuthService Integration
The implementation fully integrates with the existing `AuthService`:
- `login()` - Authenticates user and stores JWT token
- `logout()` - Clears session and redirects to login
- `currentUser` signal - Provides reactive user data
- `isAuthenticated()` - Checks if user is logged in
- `isAdmin()` - Checks if user has admin privileges

### Interceptors
- `tokenInterceptor` - Automatically adds JWT to all HTTP requests
- `errorInterceptor` - Handles 401 errors and redirects to login

### Models
Uses existing models:
- `UserInfo` - User data structure
- `LoginRequest` - Login credentials with LDAP flag
- `LoginResponse` - Login response with user and token

## Styling

### PrimeNG Theme
- Aura theme (modern, clean design)
- Dark mode support configured
- Custom CSS overrides for branding

### Tailwind CSS
- Utility-first styling approach
- Responsive design with mobile-first
- Custom color scheme (primary, purple gradients)
- Consistent spacing and typography

### Design System
- Primary color: Purple/Blue gradient
- Card-based layouts
- Consistent shadows and borders
- Icon-first navigation
- Skeleton loaders for loading states

## Running the Application

### Development Server
```bash
cd mantos-app
npm start
```

The app will be available at `http://localhost:4200`

### Production Build
```bash
npm run build
```

Build output will be in `dist/mantos/browser/`

### Testing Authentication Flow
1. Navigate to `http://localhost:4200`
2. If not logged in, you'll be redirected to `/login`
3. Enter credentials (username, password, optional LDAP)
4. On success, you'll be redirected to `/dashboard`
5. Try navigating through the sidebar menu
6. Admin users will see the Admin section
7. Use the logout button in the user menu

## Next Steps (Future Sprints)

1. **Sprint 2: Issues Management**
   - Implement issues list with filtering/sorting
   - Create issue form with all fields
   - Issue detail view with comments
   - Status transitions and workflows

2. **Sprint 3: Projects Management**
   - Projects list and filtering
   - Project details and members
   - Project-specific settings

3. **Sprint 4: Real-time Updates**
   - WebSocket integration for live updates
   - Notifications system
   - Activity feed implementation

4. **Sprint 5: Admin Features**
   - User management (CRUD)
   - System settings
   - Audit logs and reporting

## File Structure
```
src/app/
├── core/
│   ├── auth/
│   │   └── auth.service.ts (existing)
│   ├── guards/
│   │   ├── auth.guard.ts (existing)
│   │   └── admin.guard.ts (existing)
│   └── interceptors/
│       ├── token.interceptor.ts (existing)
│       └── error.interceptor.ts (existing)
├── features/
│   ├── auth/
│   │   └── login/
│   │       └── login.component.ts ✨ NEW
│   ├── dashboard/
│   │   └── dashboard.component.ts ✨ NEW
│   ├── issues/ ✨ NEW (placeholders)
│   ├── projects/ ✨ NEW (placeholders)
│   ├── profile/ ✨ NEW (placeholder)
│   └── admin/ ✨ NEW (placeholders)
├── shared/
│   └── layout/
│       └── layout.component.ts ✨ NEW
├── models/
│   └── user.model.ts (existing)
├── app.config.ts (updated)
├── app.routes.ts (updated)
└── app.html (updated)
```

## Technologies Used
- **Angular 21** - Latest Angular with standalone components
- **TypeScript 5.9** - Type-safe development
- **PrimeNG 21** - UI component library with Aura theme
- **Tailwind CSS 4** - Utility-first CSS framework
- **RxJS 7.8** - Reactive programming
- **NgRx 21** - State management (ready for future use)
- **PrimeIcons** - Icon library

## Best Practices Implemented
✅ Standalone components (Angular 21)
✅ Signal-based reactive state
✅ Modern `inject()` function for DI
✅ Lazy loading for performance
✅ Proper TypeScript typing
✅ OnPush change detection strategy
✅ Responsive design
✅ Accessibility considerations
✅ Clean code architecture
✅ Separation of concerns
✅ Reusable components
✅ Error handling
✅ Loading states
✅ Empty states
✅ Route guards for security
✅ Interceptors for cross-cutting concerns

## Notes
- The backend API should be running at `http://localhost:3000`
- All API endpoints use the `/auth` and `/users` prefixes
- JWT tokens are stored in localStorage
- The application supports both local and LDAP authentication
- Admin features are conditionally displayed based on user role
