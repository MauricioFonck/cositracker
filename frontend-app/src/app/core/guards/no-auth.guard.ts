import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const noAuthGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Si ya está autenticado, no permitir acceso a login/registro y redirigir a dashboard
    if (authService.isAuthenticated()) {
        return router.createUrlTree(['/dashboard']);
    }

    return true;
};
