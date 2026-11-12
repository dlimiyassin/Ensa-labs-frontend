import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AppRole } from '../models/api.models';
import { AuthService, LOGIN_ROUTE } from './auth.service';

/** Requires a valid (or refreshable) session and loads the current user. */
export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.ensureSession().pipe(
    map((ok) => ok || router.createUrlTree([LOGIN_ROUTE], { queryParams: { returnUrl: state.url } }))
  );
};

/**
 * Restricts a route to some roles: `data: { roles: ['ROLE_SUPER_ADMIN'] }`.
 * Must run after {@link authGuard} (the current user is then loaded).
 */
export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const roles = (route.data?.['roles'] ?? []) as AppRole[];

  if (roles.length === 0 || authService.hasAnyRole(roles)) {
    return true;
  }
  return router.createUrlTree(['/private']);
};

/** Sends an already signed-in user straight to the dashboard instead of the login form. */
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.ensureSession().pipe(map((ok) => (ok ? router.createUrlTree(['/private']) : true)));
};
