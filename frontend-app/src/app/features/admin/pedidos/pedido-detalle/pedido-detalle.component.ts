import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PedidosService } from '../../../../core/services/pedidos.service';
import { AbonosService } from '../../../../core/services/abonos.service';
import { Pedido, EstadoPedido } from '../../../../core/models/pedido.model';
import { Abono } from '../../../../core/models/abono.model';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-pedido-detalle',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './pedido-detalle.component.html',
    styleUrls: ['./pedido-detalle.component.scss']
})
export class PedidoDetalleComponent implements OnInit {
    pedido = signal<Pedido | null>(null);
    abonos = signal<Abono[]>([]);
    cargando = signal(true);

    // Estado para nuevo abono
    montoNuevoAbono = signal(0);
    notaNuevoAbono = signal('');
    cargandoAbono = signal(false);

    estados: { value: EstadoPedido, label: string }[] = [
        { value: 'PENDIENTE', label: 'Pendiente' },
        { value: 'EN_PROCESO', label: 'En Proceso' },
        { value: 'LISTO', label: 'Listo' },
        { value: 'ENTREGADO', label: 'Entregado' },
        { value: 'CANCELADO', label: 'Cancelado' }
    ];

    constructor(
        private route: ActivatedRoute,
        private pedidosService: PedidosService,
        private abonosService: AbonosService
    ) { }

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.cargarDatos(id);
        }
    }

    cargarDatos(id: string) {
        this.cargando.set(true);
        this.pedidosService.getOne(id).subscribe({
            next: (pedido) => {
                this.pedido.set(pedido);
                this.cargarAbonos(id);
                this.cargando.set(false);
            },
            error: (err) => {
                console.error('Error al cargar pedido', err);
                this.cargando.set(false);
            }
        });
    }

    cargarAbonos(pedidoId: string) {
        this.abonosService.getByPedido(pedidoId).subscribe(abonos => {
            this.abonos.set(abonos);
        });
    }

    cambiarEstado(nuevoEstado: EstadoPedido) {
        const current = this.pedido();
        if (current?.id) {
            this.pedidosService.changeState(current.id, nuevoEstado).subscribe(pedido => {
                this.pedido.set(pedido);
            });
        }
    }

    registrarAbono() {
        const current = this.pedido();
        if (current?.id && this.montoNuevoAbono() > 0) {
            this.cargandoAbono.set(true);
            const nuevoAbono: Abono = {
                pedidoId: current.id,
                monto: this.montoNuevoAbono(),
                nota: this.notaNuevoAbono(),
                metodoPago: 'EFECTIVO', // Valor por defecto
                fecha: new Date().toISOString()
            };

            this.abonosService.create(nuevoAbono).subscribe({
                next: () => {
                    this.montoNuevoAbono.set(0);
                    this.notaNuevoAbono.set('');
                    this.cargandoAbono.set(false);
                    if (current.id) this.cargarDatos(current.id);
                },
                error: (err) => {
                    console.error('Error al registrar abono', err);
                    this.cargandoAbono.set(false);
                }
            });
        }
    }

    obtenerClaseEstado(estado?: EstadoPedido): string {
        switch (estado) {
            case 'PENDIENTE': return 'status-pending';
            case 'EN_PROCESO': return 'status-process';
            case 'LISTO': return 'status-ready';
            case 'ENTREGADO': return 'status-delivered';
            case 'CANCELADO': return 'status-cancelled';
            default: return '';
        }
    }

    get porcentajePago() {
        const p = this.pedido();
        if (!p) return 0;
        const abonado = p.precioTotal - p.saldoPendiente;
        return Math.min(Math.round((abonado / p.precioTotal) * 100), 100);
    }
}
