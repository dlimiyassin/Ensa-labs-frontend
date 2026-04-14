import { Routes } from '@angular/router';
import { PrivateDashboard } from './private-dashboard/private-dashboard';

export const PRIVATE_ROUTES: Routes = [
  {
    path: '',
    component: PrivateDashboard
  }
];