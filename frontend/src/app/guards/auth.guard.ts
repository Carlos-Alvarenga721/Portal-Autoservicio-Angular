import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn) {
    return router.createUrlTree(['/login']);
  }

  const allowedRoles = route.data?.['roles'] as Array<'soporte' | 'operador'> | undefined;
  if (allowedRoles?.length && (!auth.user || !allowedRoles.includes(auth.user.role))) {
    return router.createUrlTree(['/dashboard']);
  }

  return true;
};
