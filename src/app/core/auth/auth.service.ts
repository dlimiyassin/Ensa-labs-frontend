import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpContext, HttpContextToken } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, finalize, map, Observable, of, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { API_BASE_URL } from '../api-config';
import { AppRole, CurrentUserDTO, JWTAuthResponse, LoginDto, RegisterDto, RegisterResponse } from '../models/api.models';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
/** A token is considered expired slightly before its real expiry to absorb clock skew. */
const EXPIRY_MARGIN_MS = 15_000;

export const LOGIN_ROUTE = '/private-backdoor-7';

/** Marks requests the auth interceptor must leave untouched (login, refresh). */
export const SKIP_AUTH = new HttpContextToken<boolean>(() => false);

interface JwtPayload {
  sub?: string;
  exp?: number;
  roles?: string[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly endpoint = `${API_BASE_URL}/api/auth`;

  private readonly currentUserState = signal<CurrentUserDTO | null>(null);
  private refreshInFlight$: Observable<string> | null = null;

  /** The signed-in account with its lab / team scope, once loaded. */
  readonly currentUser = this.currentUserState.asReadonly();
  readonly roles = computed<AppRole[]>(() => this.currentUserState()?.roles ?? []);
  readonly isSuperAdmin = computed(() => this.roles().includes('ROLE_SUPER_ADMIN'));
  readonly isLabDirector = computed(() => this.roles().includes('ROLE_LAB_DIRECTOR'));
  readonly isTeamLeader = computed(() => this.roles().includes('ROLE_TEAM_LEADER'));
  readonly labAcronym = computed(() => this.currentUserState()?.labAcronym ?? null);
  readonly displayName = computed(() => {
    const user = this.currentUserState();
    const fullName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();
    return fullName || user?.username || '';
  });

  login(payload: LoginDto): Observable<CurrentUserDTO> {
    return this.http
      .post<JWTAuthResponse>(`${this.endpoint}/login`, payload, { context: skipAuth() })
      .pipe(
        tap((response) => this.persistTokens(response)),
        switchMap(() => this.loadCurrentUser())
      );
  }

  register(payload: RegisterDto): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.endpoint}/register`, payload);
  }

  /** Clears the session; navigates to the login page unless told otherwise. */
  logout(redirect = true): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    this.currentUserState.set(null);
    this.refreshInFlight$ = null;
    if (redirect) {
      void this.router.navigateByUrl(LOGIN_ROUTE);
    }
  }

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  hasValidAccessToken(): boolean {
    return isTokenValid(this.getAccessToken());
  }

  hasValidRefreshToken(): boolean {
    return isTokenValid(localStorage.getItem(REFRESH_TOKEN_KEY));
  }

  /** True while a session can be used or renewed. */
  isAuthenticated(): boolean {
    return this.hasValidAccessToken() || this.hasValidRefreshToken();
  }

  hasAnyRole(roles: readonly AppRole[]): boolean {
    const owned = this.roles();
    return roles.some((role) => owned.includes(role));
  }

  /**
   * Exchanges the refresh token for a new token pair. Concurrent callers share
   * the same request; emits the new access token.
   */
  refreshTokens(): Observable<string> {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken || !isTokenValid(refreshToken)) {
      return throwError(() => new Error('No valid refresh token'));
    }
    if (!this.refreshInFlight$) {
      this.refreshInFlight$ = this.http
        .post<JWTAuthResponse>(`${this.endpoint}/refresh`, { refreshToken }, { context: skipAuth() })
        .pipe(
          tap((response) => this.persistTokens(response)),
          map((response) => response.accessToken ?? ''),
          finalize(() => (this.refreshInFlight$ = null)),
          shareReplay(1)
        );
    }
    return this.refreshInFlight$;
  }

  loadCurrentUser(): Observable<CurrentUserDTO> {
    return this.http
      .get<CurrentUserDTO>(`${API_BASE_URL}/api/account/me`)
      .pipe(tap((user) => this.currentUserState.set(user)));
  }

  /**
   * Makes sure a usable session exists (refreshing the access token if needed)
   * and that the current user is loaded. Emits false when the user must log in again.
   */
  ensureSession(): Observable<boolean> {
    if (!this.isAuthenticated()) {
      return of(false);
    }
    const token$ = this.hasValidAccessToken() ? of(this.getAccessToken()) : this.refreshTokens();
    return token$.pipe(
      switchMap(() => (this.currentUserState() ? of(this.currentUserState()) : this.loadCurrentUser())),
      map(() => true),
      catchError(() => {
        this.logout(false);
        return of(false);
      })
    );
  }

  private persistTokens(response: JWTAuthResponse): void {
    if (response.accessToken) {
      localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
    }
    if (response.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
    }
  }
}

function skipAuth(): HttpContext {
  return new HttpContext().set(SKIP_AUTH, true);
}

function decodePayload(token: string): JwtPayload | null {
  const part = token.split('.')[1];
  if (!part) return null;
  try {
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    return JSON.parse(atob(padded)) as JwtPayload;
  } catch {
    return null;
  }
}

function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  const exp = decodePayload(token)?.exp;
  return typeof exp === 'number' && exp * 1000 - EXPIRY_MARGIN_MS > Date.now();
}
