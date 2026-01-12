import { Routes } from '@angular/router';

export const ISSUES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./issues-list/issues-list.component').then(m => m.IssuesListComponent),
    title: 'Issues - Mantos'
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./issue-create/issue-create.component').then(m => m.IssueCreateComponent),
    title: 'Create Issue - Mantos'
  },
  {
    path: 'mine',
    loadComponent: () =>
      import('./issues-list/issues-list.component').then(m => m.IssuesListComponent),
    title: 'My Issues - Mantos',
    data: { filter: 'mine' }
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./issue-detail/issue-detail.component').then(m => m.IssueDetailComponent),
    title: 'Issue Details - Mantos'
  }
];
