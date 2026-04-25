import {Injectable} from '@angular/core';
import {JwtHelperService} from '@auth0/angular-jwt';
import {HttpClient, HttpEvent, HttpHandler, HttpHandlerFn, HttpHeaders, HttpRequest} from "@angular/common/http";
import {BehaviorSubject, Observable, throwError} from "rxjs";
import {catchError, filter, switchMap, take} from "rxjs/operators";
import {Router} from "@angular/router";
import {MessageService} from "primeng/api";
import {TokenResponse} from "./token-response";
import { API_BASE_URL } from '../../../../assets/environment/environment';

@Injectable({
    providedIn: 'root'
})
export class TokenService {
    constructor(
        private http: HttpClient,
        private router: Router,
        private messageService: MessageService
    ) {
    }

    public saveToken(token: string,refreshToken: string) {
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
    }

    public decode() {
        const helper = new JwtHelperService();
        return helper.decodeToken(localStorage.getItem('token') || '{}');
    }
    public decodeToken(token:string) {
        const helper = new JwtHelperService();
        return helper.decodeToken(token || '{}' );
    }

    public removeTokens() {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
    }

    public token() {
        return localStorage.getItem('token')
    }
    public refreshToken() {
        return localStorage.getItem('refreshToken')
    }

    public getUsername(): string {
        const tokenDecoded = this.decode();
        return tokenDecoded.sub;
    }



    private isRefreshing = false;
    private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

    public handle401Error(
      request: HttpRequest<any>,
      next: HttpHandlerFn
    ): Observable<HttpEvent<any>> {

    if (!this.isRefreshing) {
        this.isRefreshing = true;
        this.refreshTokenSubject.next(null);

    const refreshToken = this.refreshToken();

    if (refreshToken) {
      console.log('start refreshing token');
    
      const body = { refreshToken };
    
      return this.http
        .post<TokenResponse>(API_BASE_URL + 'refresh-token', body)
        .pipe(
          switchMap((response: any) => {
            console.log('token refreshed:', response);
        
            this.isRefreshing = false;
            this.saveToken(response.accessToken, response.refreshToken);
        
            this.messageService.add({
              severity: 'success',
              summary: 'Refresh Token',
              detail: 'We just refreshed your token'
            });
        
            this.messageService.add({
              severity: 'success',
              summary: 'Note',
              detail: 'Please refresh the page if the data was not received'
            });
        
            return next(this.addTokenToRequest(request, response.accessToken));
          }),
          catchError(() => {
            this.isRefreshing = false;
            this.removeTokens();
            console.log('token not refreshed');
            alert('Session Expired: Try to login again');
            this.router.navigate(['']);
            return throwError(() => new Error('Session expired'));
          })
        );
    } else {
      console.log('there is no refresh token in the local storage');
      this.removeTokens();
      alert('Session Expired: Try to login again');
    }
  }

  // wait until refresh completes
  return this.refreshTokenSubject.pipe(
    filter(token => token != null),
    take(1),
    switchMap(token =>
      next(this.addTokenToRequest(request, token!))
    )
  );
}

    public addTokenToRequest(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
        return request.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`,
            },
        });
    }

}
