import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, of, switchMap, throwError } from 'rxjs';
import { API_BASE_URL } from '../api-config';
import { AuthService, SKIP_AUTH } from './auth.service';

/** GET endpoints that are not public and therefore need the access token. */
const PRIVATE_READ_PREFIXES = ['/api/account', '/api/users', '/api/roles'];

/**
 * Sends the access token only where the backend requires it (writes and private reads),
 * so the public website never leaks it. On a 401 the token is refreshed once and the
 * request replayed; if that fails the session is closed.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!needsToken(req)) {
    return next(req);
  }

  const authService = inject(AuthService);
  if (!authService.isAuthenticated()) {
    return next(req);
  }

  const token$ = authService.hasValidAccessToken()
    ? of(authService.getAccessToken())
    : authService.refreshTokens().pipe(catchError(() => of(null)));

  return token$.pipe(
    switchMap((token) => next(withToken(req, token)).pipe(
      catchError((error: unknown) => {
        if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
          return throwError(() => error);
        }
        return authService.refreshTokens().pipe(
          catchError((refreshError) => {
            authService.logout();
            return throwError(() => refreshError);
          }),
          switchMap((freshToken) => next(withToken(req, freshToken)))
        );
      })
    ))
  );
};

function needsToken(req: HttpRequest<unknown>): boolean {
  if (req.context.get(SKIP_AUTH) || !req.url.startsWith(API_BASE_URL)) {
    return false;
  }
  if (req.method !== 'GET') {
    return true;
  }
  const path = req.url.substring(API_BASE_URL.length);
  return PRIVATE_READ_PREFIXES.some((prefix) => path.startsWith(prefix));
}

function withToken(req: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> {
  return token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
}
