import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientesService } from '../../../../core/services/clientes.service';
import { Cliente } from '../../../../core/models/cliente.model';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { ClienteFormComponent } from '../clientes-form/cliente-form.component';

@Component({
    selector: 'app-clientes-list',
    standalone: true,
    imports: [CommonModule, FormsModule, ClienteFormComponent],
    templateUrl: './clientes-list.component.html',
    styleUrls: ['./clientes-list.component.scss']
})
export class ClientesListComponent implements OnInit {
    clientes = signal<Cliente[]>([]);
    totalClientes = signal(0);
    cargando = signal(false);

    // Paginación y búsqueda
    paginaActual = signal(1);
    limite = 10;
    terminoBusqueda = signal('');
    private searchSubject = new Subject<string>();

    // Estado para el modal de formulario
    mostrarModal = signal(false);
    clienteSeleccionado = signal<Cliente | null>(null);

    // Estado para modal de eliminación
    mostrarModalEliminar = signal(false);
    clientePorEliminar = signal<Cliente | null>(null);

    constructor(private clientesService: ClientesService) {
        this.searchSubject.pipe(
            debounceTime(400),
            distinctUntilChanged()
        ).subscribe(term => {
            this.terminoBusqueda.set(term);
            this.paginaActual.set(1);
            this.cargarClientes();
        });
    }

    ngOnInit() {
        this.cargarClientes();
    }

    cargarClientes() {
        this.cargando.set(true);
        this.clientesService.getAll(this.terminoBusqueda(), this.paginaActual(), this.limite)
            .subscribe({
                next: (res) => {
                    this.clientes.set(res.data);
                    this.totalClientes.set(res.total);
                    this.cargando.set(false);
                },
                error: (err) => {
                    console.error('Error al cargar clientes', err);
                    this.cargando.set(false);
                }
            });
    }

    onBusqueda(event: Event) {
        const term = (event.target as HTMLInputElement).value;
        this.searchSubject.next(term);
    }

    cambiarPagina(nuevaPagina: number) {
        if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas) {
            this.paginaActual.set(nuevaPagina);
            this.cargarClientes();
        }
    }

    get totalPaginas() {
        return Math.ceil(this.totalClientes() / this.limite);
    }

    abrirCrear() {
        this.clienteSeleccionado.set(null);
        this.mostrarModal.set(true);
    }

    abrirEditar(cliente: Cliente) {
        this.clienteSeleccionado.set({ ...cliente });
        this.mostrarModal.set(true);
    }

    cerrarModal() {
        this.mostrarModal.set(false);
        this.clienteSeleccionado.set(null);
    }

    confirmarEliminar(cliente: Cliente) {
        this.clientePorEliminar.set(cliente);
        this.mostrarModalEliminar.set(true);
    }

    eliminarCliente() {
        const id = this.clientePorEliminar()?.id;
        if (id) {
            this.clientesService.delete(id).subscribe(() => {
                this.mostrarModalEliminar.set(false);
                this.clientePorEliminar.set(null);
                this.cargarClientes();
            });
        }
    }

    onClienteGuardado() {
        this.cerrarModal();
        this.cargarClientes();
    }
}
