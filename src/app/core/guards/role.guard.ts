import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth/auth.service';
import { UserRole } from '../models/user/user.model';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = route.data['roles'] as UserRole[];
  const currentUser = authService.currentUser();

  if (!authService.isAuthenticated() || !currentUser) {
    return router.createUrlTree(['/auth/login'], {
      queryParams: {
        returnUrl: state.url
      }
    });
  };

  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  const hasRequiredRole = allowedRoles.includes(currentUser.role);

  return hasRequiredRole ? true : router.createUrlTree(['/access-denied']);
};
