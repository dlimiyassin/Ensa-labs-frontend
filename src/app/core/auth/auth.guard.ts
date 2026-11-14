import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AppRole } from '../models/api.models';
import { AuthService, LOGIN_ROUTE, PRIVATE_HOME } from './auth.service';

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
  return router.createUrlTree([PRIVATE_HOME]);
};

/**
 * Guest-only routes (login form and the whole public website): a signed-in user is sent
 * back to the dashboard and must use "Se déconnecter et visiter le site" to leave it.
 * A stale session (expired refresh token, unknown account) is cleared and the visitor stays.
 */
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.ensureSession().pipe(map((ok) => (ok ? router.createUrlTree([PRIVATE_HOME]) : true)));
};
