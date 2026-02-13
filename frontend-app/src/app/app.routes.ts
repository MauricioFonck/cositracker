import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'consulta',
        pathMatch: 'full'
    },
    {
        path: 'consulta',
        loadComponent: () => import('./features/consulta-publica/consulta-publica.component')
            .then(m => m.ConsultaPublicaComponent)
    },
    {
        path: 'login',
        loadComponent: () => import('./features/login/login.component')
            .then(m => m.LoginComponent)
    },
    {
        path: 'registro',
        loadComponent: () => import('./features/registro/registro.component')
            .then(m => m.RegistroComponent)
    },
    {
        path: 'admin',
        loadComponent: () => import('./features/admin/admin-layout/admin-layout.component')
            .then(m => m.AdminLayoutComponent),
        canActivate: [authGuard],
        children: [
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            },
            {
                path: 'dashboard',
                loadComponent: () => import('./features/admin/dashboard/dashboard.component')
                    .then(m => m.DashboardComponent)
            },
            {
                path: 'clientes',
                loadComponent: () => import('./features/admin/clientes/clientes-list/clientes-list.component')
                    .then(m => m.ClientesListComponent)
            }
        ]
    },
    {
        path: '**',
        redirectTo: 'consulta'
    }
];
