// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(
        (c) => c.DashboardComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'players',
    loadChildren: () =>
      import('./features/players/players.routes').then((m) => m.PLAYERS_ROUTES),
    canActivate: [AuthGuard],
  },
  {
    path: 'teams',
    loadChildren: () =>
      import('./features/teams/teams.routes').then((m) => m.TEAMS_ROUTES),
    canActivate: [AuthGuard],
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
    canActivate: [AuthGuard],
    data: { roles: ['admin'] },
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
