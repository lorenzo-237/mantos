import { Routes } from '@angular/router';

export const PROJECTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./projects-list/projects-list.component').then(m => m.ProjectsListComponent),
    title: 'Projects - Mantos'
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./project-detail/project-detail.component').then(m => m.ProjectDetailComponent),
    title: 'Project Details - Mantos'
  }
];
