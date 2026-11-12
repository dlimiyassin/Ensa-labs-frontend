import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/auth.guard';
import { AdminLayout } from './layout/admin-layout';
import { ROUTE_ROLES } from './layout/admin-nav';

export const PRIVATE_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayout,
    canActivateChild: [roleGuard],
    children: [
      {
        path: '',
        title: 'Tableau de bord | ENSA Labs',
        loadComponent: () => import('./dashboard-home/dashboard-home').then((m) => m.DashboardHome)
      },
      {
        path: 'laboratoires',
        title: 'Laboratoires | ENSA Labs',
        data: { roles: ROUTE_ROLES.MANAGERS },
        loadComponent: () => import('./labs/labs-admin').then((m) => m.LabsAdmin)
      },
      {
        path: 'equipes',
        title: 'Équipes | ENSA Labs',
        data: { roles: ROUTE_ROLES.MANAGERS },
        loadComponent: () => import('./equipes/equipes-admin').then((m) => m.EquipesAdmin)
      },
      {
        path: 'membres',
        title: 'Membres | ENSA Labs',
        data: { roles: ROUTE_ROLES.MANAGERS },
        loadComponent: () => import('./members/members-admin').then((m) => m.MembersAdmin)
      },
      {
        path: 'publications',
        title: 'Publications | ENSA Labs',
        loadComponent: () => import('./publications/publications-admin').then((m) => m.PublicationsAdmin)
      },
      {
        path: 'theses',
        title: 'Thèses | ENSA Labs',
        data: { roles: ROUTE_ROLES.PRODUCTION_EDITORS },
        loadComponent: () => import('./theses/theses-admin').then((m) => m.ThesesAdmin)
      },
      {
        path: 'collaborations',
        title: 'Collaborations | ENSA Labs',
        data: { roles: ROUTE_ROLES.MANAGERS },
        loadComponent: () => import('./collaborations/collaborations-admin').then((m) => m.CollaborationsAdmin)
      },
      {
        path: 'ressources',
        title: 'Ressources | ENSA Labs',
        data: { roles: ROUTE_ROLES.MANAGERS },
        loadComponent: () => import('./resources/resources-admin').then((m) => m.ResourcesAdmin)
      },
      {
        path: 'thematiques',
        title: 'Thématiques | ENSA Labs',
        data: { roles: ROUTE_ROLES.SUPER_ADMIN },
        loadComponent: () => import('./thematiques/thematiques-admin').then((m) => m.ThematiquesAdmin)
      },
      {
        path: 'utilisateurs',
        title: 'Utilisateurs | ENSA Labs',
        data: { roles: ROUTE_ROLES.SUPER_ADMIN },
        loadComponent: () => import('./users/users-admin').then((m) => m.UsersAdmin)
      },
      {
        path: 'compte',
        title: 'Mon compte | ENSA Labs',
        loadComponent: () => import('./account/account-page').then((m) => m.AccountPage)
      },
      { path: '**', redirectTo: '' }
    ]
  }
];
