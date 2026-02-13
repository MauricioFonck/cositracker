import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-admin-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
    templateUrl: './admin-layout.component.html',
    styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent {
    sidebarAbierto = true;
    // Corrected: Access authService.currentUser in the constructor or as a getter
    // The original instruction's "Code Edit" snippet for the constructor was malformed
    // and contained logic for a login component, which is not applicable here.
    // The fix for "error de acceso a authService antes de inicialización" is to
    // initialize `usuario` in the constructor or use a getter.
    // For simplicity and to align with the spirit of fixing the initialization error,
    // we'll make `usuario` a getter.
    get usuario() {
        return this.authService.currentUser;
    }

    menuItems = [
        { ruta: '/admin/dashboard', icon: '📊', texto: 'Dashboard' },
        { ruta: '/admin/clientes', icon: '👤', texto: 'Clientes' },
        { ruta: '/admin/pedidos', icon: '📦', texto: 'Pedidos' },
    ];

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    toggleSidebar() {
        this.sidebarAbierto = !this.sidebarAbierto;
    }

    cerrarSesion() {
        this.authService.logout();
    }
}

