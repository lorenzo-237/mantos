import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-issues-list',
  standalone: true,
  imports: [CommonModule, CardModule],
  template: `
    <p-card>
      <ng-template pTemplate="header">
        <div class="p-4">
          <h2 class="text-2xl font-bold">Issues</h2>
        </div>
      </ng-template>
      <div class="text-center py-12">
        <i class="pi pi-exclamation-circle text-6xl text-gray-300 mb-4"></i>
        <p class="text-gray-600">Issues feature coming soon...</p>
      </div>
    </p-card>
  `
})
export class IssuesListComponent {}
