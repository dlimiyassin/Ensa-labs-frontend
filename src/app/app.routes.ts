import { Routes } from '@angular/router';
import { LayoutPage } from './layout/layout-page';
import { Signin } from './features/public/auth/signin/signin';
import { authGuard, guestGuard } from './core/auth/auth.guard';

export const routes: Routes = [

  // HIDDEN LOGIN
  {
    path: 'private-backdoor-7',
    component: Signin,
    canActivate: [guestGuard],
    title: 'Connexion | ENSA Labs'
  },

  // PUBLIC WEBSITE
  {
    path: '',
    component: LayoutPage,
    loadChildren: () =>
      import('./features/public/public.routes')
        .then(m => m.PUBLIC_ROUTES)
  },

  // PRIVATE DASHBOARD
  {
    path: 'private',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/private/private.routes')
        .then(m => m.PRIVATE_ROUTES)
  },

  // fallback
  { path: '**', redirectTo: '' }
];