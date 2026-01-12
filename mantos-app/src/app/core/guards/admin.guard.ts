import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../auth/auth.service';

/**
 * Guard pour protéger les routes admin
 */
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAdmin()) {
    return true;
  }

  // Rediriger vers une page interdite ou dashboard
  return router.createUrlTree(['/forbidden']);
};
