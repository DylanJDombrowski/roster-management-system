import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';

export const PLAYERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./player-list/player-list.component').then(
        (c) => c.PlayerListComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./player-form/player-form.component').then(
        (c) => c.PlayerFormComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./player-detail/player-detail.component').then(
        (c) => c.PlayerDetailComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./player-form/player-form.component').then(
        (c) => c.PlayerFormComponent
      ),
    canActivate: [AuthGuard],
  },
];
