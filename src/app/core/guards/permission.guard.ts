import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { PermissionManager, UserPermissions } from '../models/user/user.model';
import { NotificationService } from '../services/notification/notification.service';

export const permissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login']);
    return false;
  }

  const user = authService.currentUser();

  if (!user) {
    notificationService.showError('Usuário não autenticado.');
    router.navigate(['/auth/login']);
    return false;
  }

  const userPermissions = PermissionManager.getPermissionsByRole(user.role)
  if (!user || userPermissions) {
    notificationService.showError('Usuário sem permissões definidas.');
    router.navigate(['/']);
    return false;
  }

  const requiredPermissions = route.data['permissions'] as (keyof UserPermissions)[];
  const requireAll = route.data['requireAll'] ?? true; // Default: requer todas as permissões

  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }


  const hasAll = requiredPermissions.every((perm) => userPermissions[perm]);
  const hasAny = requiredPermissions.some((perm) => userPermissions[perm]);

  const allowed = requireAll ? hasAll : hasAny;

  if (!allowed) {
    notificationService.showError('Voce não tem permissão para acessar está página.')
    router.navigate(['/'])
    return false;
  }

  return true;
};
