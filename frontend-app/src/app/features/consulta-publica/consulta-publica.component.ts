import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidosService } from '../../core/services/pedidos.service';
import { Pedido } from '../../core/models/pedido.model';

@Component({
    selector: 'app-consulta-publica',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './consulta-publica.component.html',
    styleUrls: ['./consulta-publica.component.scss']
})
export class ConsultaPublicaComponent {
    codigoBusqueda: string = '';
    pedidoEncontrado: Pedido | null = null;
    buscando: boolean = false;
    error: string = '';
    mostrarDetalle: boolean = false;

    constructor(private pedidosService: PedidosService) { }

    buscarPedido(): void {
        if (!this.codigoBusqueda.trim()) {
            this.error = 'Por favor ingresa un código de pedido';
            return;
        }

        this.buscando = true;
        this.error = '';
        this.pedidoEncontrado = null;
        this.mostrarDetalle = false;

        this.pedidosService.getByCodigo(this.codigoBusqueda.trim().toUpperCase())
            .subscribe({
                next: (pedido) => {
                    this.pedidoEncontrado = pedido;
                    this.mostrarDetalle = true;
                    this.buscando = false;
                },
                error: (err) => {
                    this.buscando = false;
                    if (err.status === 404) {
                        this.error = 'No se encontró ningún pedido con ese código. Por favor verifica e intenta nuevamente.';
                    } else {
                        this.error = 'Ocurrió un error al buscar el pedido. Por favor intenta más tarde.';
                    }
                    console.error('Error al buscar pedido:', err);
                }
            });
    }

    nuevaBusqueda(): void {
        this.codigoBusqueda = '';
        this.pedidoEncontrado = null;
        this.mostrarDetalle = false;
        this.error = '';
    }

    calcularTotalAbonado(): number {
        if (!this.pedidoEncontrado?.abonos) return 0;
        return this.pedidoEncontrado.abonos.reduce((sum, abono) => sum + Number(abono.monto), 0);
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

    obtenerTextoEstado(estado: string): string {
        const textos: { [key: string]: string } = {
            'PENDIENTE': 'Pendiente',
            'EN_PROCESO': 'En Proceso',
            'LISTO': 'Listo para Retirar',
            'ENTREGADO': 'Entregado',
            'CANCELADO': 'Cancelado'
        };
        return textos[estado] || estado;
    }

    formatearFecha(fecha: string | undefined): string {
        if (!fecha) return 'No especificada';
        const date = new Date(fecha);
        return date.toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    formatearMetodoPago(metodo: string): string {
        const metodos: { [key: string]: string } = {
            'EFECTIVO': 'Efectivo',
            'TRANSFERENCIA': 'Transferencia',
            'TARJETA': 'Tarjeta',
            'OTRO': 'Otro'
        };
        return metodos[metodo] || metodo;
    }
}
