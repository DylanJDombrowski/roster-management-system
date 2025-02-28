import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';

export const TEAMS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./team-list/team-list.component').then(
        (c) => c.TeamListComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./team-form/team-form.component').then(
        (c) => c.TeamFormComponent
      ),
    canActivate: [AuthGuard],
    data: { roles: ['admin'] },
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./team-detail/team-detail.component').then(
        (c) => c.TeamDetailComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./team-form/team-form.component').then(
        (c) => c.TeamFormComponent
      ),
    canActivate: [AuthGuard],
    data: { roles: ['admin'] },
  },
  {
    path: ':id/roster',
    loadComponent: () =>
      import('./team-roster/team-roster.component').then(
        (c) => c.TeamRosterComponent
      ),
    canActivate: [AuthGuard],
  },
];
