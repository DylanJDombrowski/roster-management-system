import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../dashboard/dashboard.component').then(
        (c) => c.DashboardComponent
      ),
    canActivate: [AuthGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./user-management/user-management.component').then(
        (c) => c.UserManagementComponent
      ),
    canActivate: [AuthGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'users/new',
    loadComponent: () =>
      import('./user-form/user-form.component').then(
        (c) => c.UserFormComponent
      ),
    canActivate: [AuthGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'users/:id',
    loadComponent: () =>
      import('./user-detail/user-detail.component').then(
        (c) => c.UserDetailComponent
      ),
    canActivate: [AuthGuard],
    data: { roles: ['admin'] },
  },

  {
    path: 'users/:id/edit',
    loadComponent: () =>
      import('./user-form/user-form.component').then(
        (c) => c.UserFormComponent
      ),
    canActivate: [AuthGuard],
    data: { roles: ['admin'] },
  },
];
