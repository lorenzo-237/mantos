import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  // Public routes
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
    title: 'Login - Mantos'
  },

  // Protected routes with layout
  {
    path: '',
    loadComponent: () =>
      import('./shared/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      // Redirect root to dashboard
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },

      // Dashboard
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'Dashboard - Mantos'
      },

      // Issues (placeholder for future implementation)
      {
        path: 'issues',
        loadChildren: () =>
          import('./features/issues/issues.routes').then(m => m.ISSUES_ROUTES),
        title: 'Issues - Mantos'
      },

      // Projects (placeholder for future implementation)
      {
        path: 'projects',
        loadChildren: () =>
          import('./features/projects/projects.routes').then(m => m.PROJECTS_ROUTES),
        title: 'Projects - Mantos'
      },

      // Profile (placeholder for future implementation)
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile.component').then(m => m.ProfileComponent),
        title: 'Profile - Mantos'
      },

      // Admin routes (protected by adminGuard)
      {
        path: 'admin',
        canActivate: [adminGuard],
        children: [
          {
            path: '',
            redirectTo: 'users',
            pathMatch: 'full'
          },
          {
            path: 'users',
            loadComponent: () =>
              import('./features/admin/users/admin-users.component').then(m => m.AdminUsersComponent),
            title: 'User Management - Mantos'
          },
          {
            path: 'settings',
            loadComponent: () =>
              import('./features/admin/settings/admin-settings.component').then(m => m.AdminSettingsComponent),
            title: 'Settings - Mantos'
          }
        ]
      }
    ]
  },

  // Fallback route
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
