import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PedidosService } from '../../../../core/services/pedidos.service';
import { ClientesService } from '../../../../core/services/clientes.service';
import { Pedido, EstadoPedido } from '../../../../core/models/pedido.model';
import { Cliente } from '../../../../core/models/cliente.model';
import { ClienteFormComponent } from '../../clientes/clientes-form/cliente-form.component';

@Component({
    selector: 'app-pedido-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, ClienteFormComponent],
    templateUrl: './pedidos-form.component.html',
    styleUrls: ['./pedidos-form.component.scss']
})
export class PedidoFormComponent implements OnInit {
    @Input() pedido: Pedido | null = null;
    @Output() guardado = new EventEmitter<void>();
    @Output() cancelado = new EventEmitter<void>();

    pedidoForm: FormGroup;
    cargando = signal(false);
    clientes = signal<Cliente[]>([]);
    mostrarNuevoCliente = signal(false);

    constructor(
        private fb: FormBuilder,
        private pedidosService: PedidosService,
        private clientesService: ClientesService
    ) {
        this.pedidoForm = this.fb.group({
            clienteId: ['', Validators.required],
            tipoTrabajo: ['', [Validators.required, Validators.minLength(3)]],
            descripcion: ['', Validators.required],
            precioTotal: [0, [Validators.required, Validators.min(0)]],
            abonoInicial: [0, [Validators.min(0)]],
            fechaEntrega: [''],
            notas: [''],
            estado: ['PENDIENTE']
        });
    }

    ngOnInit() {
        this.cargarClientes();
        if (this.pedido) {
            this.pedidoForm.patchValue({
                clienteId: this.pedido.clienteId,
                tipoTrabajo: this.pedido.tipoTrabajo,
                descripcion: this.pedido.descripcion,
                precioTotal: this.pedido.precioTotal,
                fechaEntrega: this.pedido.fechaEntrega ? new Date(this.pedido.fechaEntrega).toISOString().split('T')[0] : '',
                notas: this.pedido.notas,
                estado: this.pedido.estado
            });
            // Si es edición, ocultamos el abono inicial porque eso se maneja como abono normal
            this.pedidoForm.get('abonoInicial')?.disable();
        }
    }

    cargarClientes() {
        this.clientesService.getAll('', 1, 100).subscribe(res => {
            this.clientes.set(res.data);
        });
    }

    onClienteCreado(cliente: any) {
        this.cargarClientes();
        this.pedidoForm.patchValue({ clienteId: cliente.id });
        this.mostrarNuevoCliente.set(false);
    }

    onSubmit() {
        if (this.pedidoForm.invalid) {
            this.pedidoForm.markAllAsTouched();
            return;
        }

        this.cargando.set(true);
        const datos = this.pedidoForm.getRawValue();

        if (this.pedido?.id) {
            this.pedidosService.update(this.pedido.id, datos).subscribe({
                next: () => {
                    this.cargando.set(false);
                    this.guardado.emit();
                },
                error: (err) => {
                    console.error('Error al actualizar pedido', err);
                    this.cargando.set(false);
                }
            });
        } else {
            this.pedidosService.create(datos).subscribe({
                next: () => {
                    this.cargando.set(false);
                    this.guardado.emit();
                },
                error: (err) => {
                    console.error('Error al crear pedido', err);
                    this.cargando.set(false);
                }
            });
        }
    }

    cancelar() {
        this.cancelado.emit();
    }
}
