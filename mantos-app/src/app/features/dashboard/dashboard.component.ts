import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';

import { AuthService } from '../../core/auth/auth.service';

interface StatCard {
  title: string;
  value: string;
  icon: string;
  color: string;
  trend?: string;
  trendDirection?: 'up' | 'down';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    SkeletonModule
  ],
  template: `
    <div class="space-y-6">
      <!-- Welcome Banner -->
      <div class="bg-gradient-to-r from-primary to-purple-600 rounded-xl shadow-lg p-8 text-white">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold mb-2">
              Welcome back, {{ displayName() }}!
            </h1>
            <p class="text-white/90 text-lg">
              Here's what's happening with your projects today.
            </p>
          </div>
          <div class="hidden md:block">
            <i class="pi pi-chart-line text-6xl opacity-20"></i>
          </div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        @for (stat of stats; track stat.title) {
          <p-card styleClass="shadow-md hover:shadow-lg transition-shadow">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  {{ stat.title }}
                </p>
                <p class="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                  {{ stat.value }}
                </p>
                @if (stat.trend) {
                  <div class="flex items-center gap-1 text-sm">
                    <i
                      [class]="stat.trendDirection === 'up' ? 'pi pi-arrow-up text-green-500' : 'pi pi-arrow-down text-red-500'"
                    ></i>
                    <span
                      [class]="stat.trendDirection === 'up' ? 'text-green-500' : 'text-red-500'"
                    >
                      {{ stat.trend }}
                    </span>
                    <span class="text-gray-500">vs last week</span>
                  </div>
                }
              </div>
              <div
                class="w-12 h-12 rounded-lg flex items-center justify-center"
                [style.background-color]="stat.color + '20'"
              >
                <i [class]="stat.icon + ' text-xl'" [style.color]="stat.color"></i>
              </div>
            </div>
          </p-card>
        }
      </div>

      <!-- Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Recent Issues Card -->
        <p-card styleClass="shadow-md">
          <ng-template pTemplate="header">
            <div class="p-4 border-b border-gray-200 dark:border-gray-700">
              <div class="flex items-center justify-between">
                <h2 class="text-xl font-semibold text-gray-800 dark:text-white">
                  Recent Issues
                </h2>
                <p-button
                  label="View All"
                  icon="pi pi-arrow-right"
                  [text]="true"
                  size="small"
                  routerLink="/issues"
                />
              </div>
            </div>
          </ng-template>

          <div class="space-y-4">
            @if (isLoadingData) {
              @for (item of [1, 2, 3]; track item) {
                <div class="flex items-center gap-4 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p-skeleton width="3rem" height="3rem" shape="circle" />
                  <div class="flex-1">
                    <p-skeleton width="100%" height="1rem" styleClass="mb-2" />
                    <p-skeleton width="60%" height="0.875rem" />
                  </div>
                </div>
              }
            } @else {
              <div class="text-center py-12">
                <i class="pi pi-inbox text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
                <p class="text-gray-600 dark:text-gray-400 mb-4">
                  No recent issues to display
                </p>
                <p-button
                  label="Create New Issue"
                  icon="pi pi-plus"
                  routerLink="/issues/new"
                />
              </div>
            }
          </div>
        </p-card>

        <!-- Activity Feed Card -->
        <p-card styleClass="shadow-md">
          <ng-template pTemplate="header">
            <div class="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 class="text-xl font-semibold text-gray-800 dark:text-white">
                Recent Activity
              </h2>
            </div>
          </ng-template>

          <div class="space-y-4">
            @if (isLoadingData) {
              @for (item of [1, 2, 3, 4]; track item) {
                <div class="flex items-start gap-3">
                  <p-skeleton width="2rem" height="2rem" shape="circle" />
                  <div class="flex-1">
                    <p-skeleton width="100%" height="1rem" styleClass="mb-2" />
                    <p-skeleton width="40%" height="0.75rem" />
                  </div>
                </div>
              }
            } @else {
              <div class="text-center py-12">
                <i class="pi pi-history text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
                <p class="text-gray-600 dark:text-gray-400">
                  No recent activity
                </p>
              </div>
            }
          </div>
        </p-card>
      </div>

      <!-- Quick Actions -->
      <p-card styleClass="shadow-md">
        <ng-template pTemplate="header">
          <div class="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-xl font-semibold text-gray-800 dark:text-white">
              Quick Actions
            </h2>
          </div>
        </ng-template>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          @for (action of quickActions; track action.label) {
            <button
              [routerLink]="action.route"
              class="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary/5 transition-all group"
            >
              <div
                class="w-16 h-16 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
                [style.background-color]="action.color + '20'"
              >
                <i [class]="action.icon + ' text-2xl'" [style.color]="action.color"></i>
              </div>
              <div class="text-center">
                <p class="font-semibold text-gray-800 dark:text-white group-hover:text-primary transition-colors">
                  {{ action.label }}
                </p>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {{ action.description }}
                </p>
              </div>
            </button>
          }
        </div>
      </p-card>
    </div>
  `,
  styles: [`
    :host ::ng-deep {
      .p-card-header {
        padding: 0;
      }

      .p-card-body {
        padding: 1.5rem;
      }
    }
  `]
})
export class DashboardComponent {
  private authService = inject(AuthService);

  // Computed values
  currentUser = this.authService.currentUser;
  displayName = computed(() => {
    const user = this.currentUser();
    return user?.mantis?.user?.name || user?.username || 'User';
  });

  isLoadingData = false;

  // Stats data (placeholder - will be replaced with real data)
  stats: StatCard[] = [
    {
      title: 'Open Issues',
      value: '0',
      icon: 'pi pi-exclamation-circle',
      color: '#ef4444',
      trend: '0%',
      trendDirection: 'up'
    },
    {
      title: 'In Progress',
      value: '0',
      icon: 'pi pi-sync',
      color: '#3b82f6',
      trend: '0%',
      trendDirection: 'up'
    },
    {
      title: 'Resolved',
      value: '0',
      icon: 'pi pi-check-circle',
      color: '#10b981',
      trend: '0%',
      trendDirection: 'up'
    },
    {
      title: 'Projects',
      value: '0',
      icon: 'pi pi-folder',
      color: '#8b5cf6',
      trend: '0%',
      trendDirection: 'up'
    }
  ];

  // Quick actions
  quickActions = [
    {
      label: 'New Issue',
      description: 'Report a new issue',
      icon: 'pi pi-plus-circle',
      color: '#ef4444',
      route: '/issues/new'
    },
    {
      label: 'My Issues',
      description: 'View assigned issues',
      icon: 'pi pi-user',
      color: '#3b82f6',
      route: '/issues/mine'
    },
    {
      label: 'Projects',
      description: 'Browse projects',
      icon: 'pi pi-folder-open',
      color: '#8b5cf6',
      route: '/projects'
    },
    {
      label: 'Reports',
      description: 'View analytics',
      icon: 'pi pi-chart-bar',
      color: '#10b981',
      route: '/reports'
    }
  ];
}
