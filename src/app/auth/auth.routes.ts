import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'callback',
    loadComponent: () =>
      import('./callback/callback.component').then((c) => c.CallbackComponent),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
