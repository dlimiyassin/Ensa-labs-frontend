import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { firstValueFrom, isObservable, Observable, of } from 'rxjs';
import { API_BASE_URL } from '../api-config';
import { authGuard, guestGuard } from './auth.guard';

/** Builds an unsigned JWT whose only meaningful claim is the expiry. */
function fakeJwt(expiresInSeconds: number): string {
  const encode = (value: object) => btoa(JSON.stringify(value)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${encode({ alg: 'HS256' })}.${encode({ sub: 'admin', exp: Math.floor(Date.now() / 1000) + expiresInSeconds })}.signature`;
}

type GuardResult = boolean | UrlTree;

function run(guard: typeof authGuard, url: string): Promise<GuardResult> {
  const result = TestBed.runInInjectionContext(() =>
    guard({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot)
  ) as GuardResult | Observable<GuardResult>;
  return firstValueFrom(isObservable(result) ? result : of(result));
}

describe('route guards', () => {
  let backend: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    });
    backend = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    backend.verify();
    localStorage.clear();
  });

  function signIn(): void {
    localStorage.setItem('access_token', fakeJwt(600));
    localStorage.setItem('refresh_token', fakeJwt(3600));
  }

  function answerCurrentUser(): void {
    backend.expectOne(`${API_BASE_URL}/api/account/me`).flush({ username: 'admin', roles: ['ROLE_SUPER_ADMIN'] });
  }

  it('sends a visitor from a private page to the login form with the requested URL', async () => {
    const result = await run(authGuard, '/private/membres');

    expect(router.serializeUrl(result as UrlTree)).toBe('/private-backdoor-7?returnUrl=%2Fprivate%2Fmembres');
  });

  it('lets a signed-in user into the dashboard', async () => {
    signIn();
    const pending = run(authGuard, '/private');
    answerCurrentUser();

    expect(await pending).toBe(true);
  });

  it('lets a visitor open the public website', async () => {
    expect(await run(guestGuard, '/laboratoires/LaRESI')).toBe(true);
  });

  it('keeps a signed-in user in the dashboard when a public URL is typed', async () => {
    signIn();
    const pending = run(guestGuard, '/laboratoires/LaRESI');
    answerCurrentUser();

    expect(router.serializeUrl((await pending) as UrlTree)).toBe('/private');
  });

  it('clears a stale session and lets the visitor through', async () => {
    localStorage.setItem('access_token', fakeJwt(-60));
    localStorage.setItem('refresh_token', fakeJwt(-60));

    expect(await run(guestGuard, '/')).toBe(true);
  });
});
