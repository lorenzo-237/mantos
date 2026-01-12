import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

// PrimeNG Imports
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MenubarModule,
    ButtonModule,
    AvatarModule,
    MenuModule
  ],
  template: `
    <div class="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      <!-- Sidebar -->
      <aside
        class="transition-all duration-300 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700"
        [class.w-64]="!sidebarCollapsed()"
        [class.w-16]="sidebarCollapsed()"
      >
        <!-- Logo Area -->
        <div class="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700 px-4">
          @if (!sidebarCollapsed()) {
            <div class="flex items-center gap-2">
              <i class="pi pi-box text-2xl text-primary"></i>
              <span class="text-xl font-bold text-gray-800 dark:text-white">Mantos</span>
            </div>
          } @else {
            <i class="pi pi-box text-2xl text-primary"></i>
          }
        </div>

        <!-- Navigation Menu -->
        <nav class="p-4">
          <ul class="space-y-2">
            @for (item of menuItems(); track item.id) {
              @if (!item.adminOnly || isAdmin()) {
                @if (item.separator) {
                  <li class="my-4 border-t border-gray-200 dark:border-gray-700"></li>
                  @if (!sidebarCollapsed() && item.label) {
                    <li class="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                      {{ item.label }}
                    </li>
                  }
                } @else {
                  <li>
                    <a
                      [routerLink]="item.route"
                      routerLinkActive="bg-primary/10 text-primary border-primary"
                      [routerLinkActiveOptions]="{exact: item.exact || false}"
                      class="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-l-4 border-transparent"
                      [title]="sidebarCollapsed() ? item.label : ''"
                    >
                      <i [class]="item.icon + ' text-lg'"></i>
                      @if (!sidebarCollapsed()) {
                        <span class="font-medium">{{ item.label }}</span>
                      }
                      @if (!sidebarCollapsed() && item.badge) {
                        <span class="ml-auto bg-primary text-white text-xs px-2 py-1 rounded-full">
                          {{ item.badge }}
                        </span>
                      }
                    </a>
                  </li>
                }
              }
            }
          </ul>
        </nav>

        <!-- Collapse Toggle Button -->
        <div class="absolute bottom-4 left-4 right-4">
          <button
            (click)="toggleSidebar()"
            class="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <i [class]="sidebarCollapsed() ? 'pi pi-angle-right' : 'pi pi-angle-left'"></i>
            @if (!sidebarCollapsed()) {
              <span class="text-sm font-medium">Collapse</span>
            }
          </button>
        </div>
      </aside>

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col">
        <!-- Header -->
        <header class="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 flex items-center justify-between">
          <!-- Page Title / Breadcrumb -->
          <div class="flex items-center gap-4">
            <h1 class="text-xl font-semibold text-gray-800 dark:text-white">
              {{ pageTitle() }}
            </h1>
          </div>

          <!-- User Menu -->
          <div class="flex items-center gap-4">
            <!-- Notifications (placeholder) -->
            <button
              class="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
              title="Notifications"
            >
              <i class="pi pi-bell text-lg"></i>
              <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <!-- Theme Toggle (placeholder) -->
            <button
              (click)="toggleTheme()"
              class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
              title="Toggle Theme"
            >
              <i [class]="isDarkTheme() ? 'pi pi-sun' : 'pi pi-moon'" class="text-lg"></i>
            </button>

            <!-- User Avatar and Info -->
            <div class="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700">
              <div class="text-right">
                <p class="text-sm font-medium text-gray-800 dark:text-white">
                  {{ currentUser()?.username || 'User' }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ currentUser()?.isAdmin ? 'Administrator' : 'User' }}
                </p>
              </div>

              <p-avatar
                [label]="getUserInitials()"
                shape="circle"
                styleClass="bg-primary text-white cursor-pointer"
                (click)="userMenu.toggle($event)"
              />

              <p-menu
                #userMenu
                [model]="userMenuItems"
                [popup]="true"
                styleClass="w-48"
              />
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <main class="flex-1 overflow-auto p-6">
          <router-outlet />
        </main>

        <!-- Footer -->
        <footer class="h-12 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <p>Mantos &copy; 2026 - Mantis Issue Tracker Integration</p>
          <p>Version 1.0.0</p>
        </footer>
      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep {
      .p-avatar {
        width: 2.5rem;
        height: 2.5rem;
      }

      .p-menu {
        margin-top: 0.5rem;
      }
    }

    aside {
      position: relative;
      min-height: 100vh;
    }
  `]
})
export class LayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Signals
  sidebarCollapsed = signal(false);
  currentUser = this.authService.currentUser;
  isDarkTheme = signal(false);

  // Computed values
  isAdmin = computed(() => this.authService.isAdmin());

  pageTitle = computed(() => {
    const url = this.router.url;
    if (url.includes('/dashboard')) return 'Dashboard';
    if (url.includes('/issues')) return 'Issues';
    if (url.includes('/projects')) return 'Projects';
    if (url.includes('/admin')) return 'Administration';
    if (url.includes('/profile')) return 'Profile';
    return 'Mantos';
  });

  // Menu Items
  menuItems = signal<Array<{
    id: string;
    label: string;
    icon: string;
    route?: string;
    badge?: string;
    adminOnly?: boolean;
    separator?: boolean;
    exact?: boolean;
  }>>([
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'pi pi-home',
      route: '/dashboard',
      exact: true
    },
    {
      id: 'issues',
      label: 'Issues',
      icon: 'pi pi-exclamation-circle',
      route: '/issues',
      badge: '0'
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: 'pi pi-folder',
      route: '/projects'
    },
    {
      id: 'separator-admin',
      label: 'Administration',
      icon: '',
      separator: true,
      adminOnly: true
    },
    {
      id: 'admin-users',
      label: 'Users',
      icon: 'pi pi-users',
      route: '/admin/users',
      adminOnly: true
    },
    {
      id: 'admin-settings',
      label: 'Settings',
      icon: 'pi pi-cog',
      route: '/admin/settings',
      adminOnly: true
    }
  ]);

  // User Menu Items
  userMenuItems: MenuItem[] = [
    {
      label: 'Profile',
      icon: 'pi pi-user',
      command: () => this.router.navigate(['/profile'])
    },
    {
      label: 'Settings',
      icon: 'pi pi-cog',
      command: () => this.router.navigate(['/settings'])
    },
    {
      separator: true
    },
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: () => this.logout()
    }
  ];

  toggleSidebar(): void {
    this.sidebarCollapsed.update(value => !value);
  }

  toggleTheme(): void {
    this.isDarkTheme.update(value => !value);
    // Toggle dark mode class on document
    if (this.isDarkTheme()) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
  }

  getUserInitials(): string {
    const user = this.currentUser();
    if (!user?.username) return 'U';

    const parts = user.username.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return user.username.substring(0, 2).toUpperCase();
  }

  logout(): void {
    this.authService.logout();
  }
}
