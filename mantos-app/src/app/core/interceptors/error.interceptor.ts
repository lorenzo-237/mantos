import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

/**
 * Interceptor pour gérer les erreurs HTTP globalement
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token invalide ou expiré - déconnexion automatique
        authService.logout();
      } else if (error.status === 403) {
        // Accès interdit
        router.navigate(['/forbidden']);
      }

      return throwError(() => error);
    })
  );
};
