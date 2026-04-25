// import { inject } from '@angular/core';
// import {
//   HttpEvent,
//   HttpErrorResponse,
//   HttpRequest,
//   HttpHandlerFn,
//   HttpInterceptorFn
// } from '@angular/common/http';
// import { Observable, throwError } from 'rxjs';
// import { catchError } from 'rxjs/operators';
// import { TokenService } from '../service/token.service';

// export const jwtInterceptor: HttpInterceptorFn = (
//   request: HttpRequest<unknown>,
//   next: HttpHandlerFn
// ): Observable<HttpEvent<unknown>> => {

//   const tokenService = inject(TokenService);

//   // Exclude the refresh-token endpoint
//   if (request.url.includes('refresh-token')) {
//     return next(request);
//   }

//   const token = tokenService.token();

//   if (token) {
//     request = tokenService.addTokenToRequest(request, token);
//   }

//   return next(request).pipe(
//     catchError((error: HttpErrorResponse) => {
//       if (error.status === 401) {
//         console.log('unauthorized request detected');
//         return tokenService.handle401Error(request, next);
//       }
//       return throwError(() => error);
//     })
//   );
// };
