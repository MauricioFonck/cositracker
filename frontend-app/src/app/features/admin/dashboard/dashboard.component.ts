import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, DashboardStats } from '../../../core/services/dashboard.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    // Señales para estadísticas
    stats = signal<DashboardStats | null>(null);

    pedidosRecientes = signal([
        { id: '1', codigo: 'ABC123', cliente: 'María López', estado: 'PENDIENTE', total: 150000 },
        { id: '2', codigo: 'XYZ789', cliente: 'Juan Pérez', estado: 'LISTO', total: 85000 },
        { id: '3', codigo: 'DEF456', cliente: 'Ana García', estado: 'EN_PROCESO', total: 200000 },
    ]);

    constructor(private dashboardService: DashboardService) { }

    ngOnInit(): void {
        this.cargarStats();
    }

    cargarStats(): void {
        this.dashboardService.getStats().subscribe({
            next: (data) => {
                this.stats.set(data);
            },
            error: (err) => {
                console.error('Error al cargar estadísticas:', err);
            }
        });
    }

    get pedidosPendientes(): number {
        return this.stats()?.pedidosPorEstado.find(p => p.estado === 'PENDIENTE')?.count || 0;
    }

    get pedidosListos(): number {
        return this.stats()?.pedidosPorEstado.find(p => p.estado === 'LISTO')?.count || 0;
    }

    obtenerColorEstado(estado: string): string {
        const colores: { [key: string]: string } = {
            'PENDIENTE': '#f59e0b',
            'EN_PROCESO': '#3b82f6',
            'LISTO': '#10b981',
            'ENTREGADO': '#059669',
            'CANCELADO': '#ef4444'
        };
        return colores[estado] || '#6b7280';
    }
}
