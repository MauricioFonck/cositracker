import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PedidosService } from '../../../../core/services/pedidos.service';
import { ClientesService } from '../../../../core/services/clientes.service';
import { Pedido, EstadoPedido } from '../../../../core/models/pedido.model';
import { Cliente } from '../../../../core/models/cliente.model';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { PedidoFormComponent } from '../pedidos-form/pedidos-form.component';

@Component({
    selector: 'app-pedidos-list',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, PedidoFormComponent],
    templateUrl: './pedidos-list.component.html',
    styleUrls: ['./pedidos-list.component.scss']
})
export class PedidosListComponent implements OnInit {
    pedidos = signal<Pedido[]>([]);
    totalPedidos = signal(0);
    cargando = signal(false);

    // Paginación y filtros
    paginaActual = signal(1);
    limite = 10;
    terminoBusqueda = signal('');
    estadoFiltro = signal<EstadoPedido | ''>('');
    clienteFiltro = signal<string>('');
    fechaInicio = signal('');
    fechaFin = signal('');

    // Lista de clientes para el filtro
    clientes = signal<Cliente[]>([]);

    private searchSubject = new Subject<string>();

    // Estado para el modal de formulario
    mostrarModal = signal(false);
    pedidoSeleccionado = signal<Pedido | null>(null);

    // Estados posibles para mostrar en filtros
    estados: { value: EstadoPedido, label: string }[] = [
        { value: 'PENDIENTE', label: 'Pendiente' },
        { value: 'EN_PROCESO', label: 'En Proceso' },
        { value: 'LISTO', label: 'Listo' },
        { value: 'ENTREGADO', label: 'Entregado' },
        { value: 'CANCELADO', label: 'Cancelado' }
    ];

    constructor(
        private pedidosService: PedidosService,
        private clientesService: ClientesService
    ) {
        this.searchSubject.pipe(
            debounceTime(400),
            distinctUntilChanged()
        ).subscribe(term => {
            this.terminoBusqueda.set(term);
            this.paginaActual.set(1);
            this.cargarPedidos();
        });
    }

    ngOnInit() {
        this.cargarPedidos();
        this.cargarClientes();
    }

    cargarPedidos() {
        this.cargando.set(true);
        this.pedidosService.getAll(
            this.terminoBusqueda(),
            this.estadoFiltro() || undefined,
            this.clienteFiltro() || undefined,
            this.fechaInicio() || undefined,
            this.fechaFin() || undefined,
            this.paginaActual(),
            this.limite
        ).subscribe({
            next: (res) => {
                this.pedidos.set(res.data);
                this.totalPedidos.set(res.total);
                this.cargando.set(false);
            },
            error: (err) => {
                console.error('Error al cargar pedidos', err);
                this.cargando.set(false);
            }
        });
    }

    cargarClientes() {
        // Cargar algunos clientes para el filtro (podríamos necesitar un search real si son muchos)
        this.clientesService.getAll('', 1, 100).subscribe(res => {
            this.clientes.set(res.data);
        });
    }

    onBusqueda(event: Event) {
        const term = (event.target as HTMLInputElement).value;
        this.searchSubject.next(term);
    }

    filtrarPorEstado(estado: EstadoPedido | '') {
        this.estadoFiltro.set(estado);
        this.paginaActual.set(1);
        this.cargarPedidos();
    }

    filtrarPorCliente(clienteId: string) {
        this.clienteFiltro.set(clienteId);
        this.paginaActual.set(1);
        this.cargarPedidos();
    }

    cambiarPagina(nuevaPagina: number) {
        if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas) {
            this.paginaActual.set(nuevaPagina);
            this.cargarPedidos();
        }
    }

    get totalPaginas() {
        return Math.ceil(this.totalPedidos() / this.limite);
    }

    abrirCrear() {
        this.pedidoSeleccionado.set(null);
        this.mostrarModal.set(true);
    }

    abrirEditar(pedido: Pedido) {
        this.pedidoSeleccionado.set({ ...pedido });
        this.mostrarModal.set(true);
    }

    cerrarModal() {
        this.mostrarModal.set(false);
        this.pedidoSeleccionado.set(null);
    }

    onPedidoGuardado() {
        this.cerrarModal();
        this.cargarPedidos();
    }

    cambiarEstadoRapido(pedido: Pedido, nuevoEstado: EstadoPedido) {
        if (pedido.id) {
            this.pedidosService.changeState(pedido.id, nuevoEstado).subscribe(() => {
                this.cargarPedidos();
            });
        }
    }

    obtenerClaseEstado(estado: EstadoPedido): string {
        switch (estado) {
            case 'PENDIENTE': return 'status-pending';
            case 'EN_PROCESO': return 'status-process';
            case 'LISTO': return 'status-ready';
            case 'ENTREGADO': return 'status-delivered';
            case 'CANCELADO': return 'status-cancelled';
            default: return '';
        }
    }
}
