import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const token = authService.getToken();

    // No interceptar login o consulta publica si no queremos (aunque el backend ya ignora token en public)
    // Pero es mejor enviar siempre si existe, excepto quizas a dominios externos.
    // Aquí asumimos mismo dominio.

    if (token) {
        req = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    return next(req);
};
