import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from '../services/api.config';
import { JWTAuthResponse, LoginDto, RegisterDto, RegisterResponse } from '../models/api.models';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  login(payload: LoginDto): Observable<JWTAuthResponse> {
    return this.http
      .post<JWTAuthResponse>(`${API_BASE_URL}/api/auth/login`, payload)
      .pipe(tap((response) => this.persistTokens(response)));
  }

  register(payload: RegisterDto): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${API_BASE_URL}/api/auth/register`, payload);
  }

  logout(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return Boolean(this.getAccessToken());
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
