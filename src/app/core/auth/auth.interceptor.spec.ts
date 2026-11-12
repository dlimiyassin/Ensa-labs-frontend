import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { API_BASE_URL } from '../api-config';
import { authInterceptor } from './auth.interceptor';

/** Builds an unsigned JWT whose only meaningful claim is the expiry. */
function fakeJwt(expiresInSeconds: number): string {
  const encode = (value: object) => btoa(JSON.stringify(value)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${encode({ alg: 'HS256' })}.${encode({ sub: 'admin', exp: Math.floor(Date.now() / 1000) + expiresInSeconds })}.signature`;
}

describe('authInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting()
      ]
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    backend.verify();
    localStorage.clear();
  });

  it('does not send the token on public reads', () => {
    localStorage.setItem('access_token', fakeJwt(600));

    http.get(`${API_BASE_URL}/api/labs`).subscribe();

    const request = backend.expectOne(`${API_BASE_URL}/api/labs`);
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush([]);
  });

  it('sends the token on writes and private reads', () => {
    const token = fakeJwt(600);
    localStorage.setItem('access_token', token);

    http.post(`${API_BASE_URL}/api/publications`, {}).subscribe();
    http.get(`${API_BASE_URL}/api/account/me`).subscribe();

    const write = backend.expectOne(`${API_BASE_URL}/api/publications`);
    const privateRead = backend.expectOne(`${API_BASE_URL}/api/account/me`);
    expect(write.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    expect(privateRead.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    write.flush({});
    privateRead.flush({});
  });

  it('never touches requests to other hosts', () => {
    localStorage.setItem('access_token', fakeJwt(600));

    http.post('https://example.org/api/anything', {}).subscribe();

    const request = backend.expectOne('https://example.org/api/anything');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({});
  });

  it('refreshes an expired access token before sending the request', () => {
    const fresh = fakeJwt(600);
    localStorage.setItem('access_token', fakeJwt(-60));
    localStorage.setItem('refresh_token', fakeJwt(3600));

    http.delete(`${API_BASE_URL}/api/members/42`).subscribe();

    const refresh = backend.expectOne(`${API_BASE_URL}/api/auth/refresh`);
    expect(refresh.request.headers.has('Authorization')).toBe(false);
    refresh.flush({ accessToken: fresh, refreshToken: fakeJwt(3600) });

    const request = backend.expectOne(`${API_BASE_URL}/api/members/42`);
    expect(request.request.headers.get('Authorization')).toBe(`Bearer ${fresh}`);
    request.flush(null);
  });

  it('retries once with a refreshed token after a 401', () => {
    const fresh = fakeJwt(600);
    localStorage.setItem('access_token', fakeJwt(600));
    localStorage.setItem('refresh_token', fakeJwt(3600));
    let result: unknown;

    http.put(`${API_BASE_URL}/api/labs/1`, {}).subscribe((value) => (result = value));

    backend.expectOne(`${API_BASE_URL}/api/labs/1`).flush(null, { status: 401, statusText: 'Unauthorized' });
    backend.expectOne(`${API_BASE_URL}/api/auth/refresh`).flush({ accessToken: fresh, refreshToken: fakeJwt(3600) });
    const retry = backend.expectOne(`${API_BASE_URL}/api/labs/1`);
    expect(retry.request.headers.get('Authorization')).toBe(`Bearer ${fresh}`);
    retry.flush({ ok: true });

    expect(result).toEqual({ ok: true });
  });
});
