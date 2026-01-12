import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, CardModule],
  template: `
    <p-card>
      <ng-template pTemplate="header">
        <div class="p-4">
          <h2 class="text-2xl font-bold">System Settings</h2>
        </div>
      </ng-template>
      <div class="text-center py-12">
        <i class="pi pi-cog text-6xl text-gray-300 mb-4"></i>
        <p class="text-gray-600">System settings feature coming soon...</p>
      </div>
    </p-card>
  `
})
export class AdminSettingsComponent {}
