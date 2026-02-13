import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientesService } from '../../../../core/services/clientes.service';
import { Cliente } from '../../../../core/models/cliente.model';

@Component({
    selector: 'app-cliente-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './cliente-form.component.html',
    styleUrls: ['./cliente-form.component.scss']
})
export class ClienteFormComponent implements OnInit {
    @Input() cliente: Cliente | null = null;
    @Output() guardado = new EventEmitter<void>();
    @Output() cancelado = new EventEmitter<void>();

    clienteForm: FormGroup;
    cargando = signal(false);
    error = signal('');

    constructor(
        private fb: FormBuilder,
        private clientesService: ClientesService
    ) {
        this.clienteForm = this.fb.group({
            nombre: ['', [Validators.required, Validators.minLength(3)]],
            documento: ['', [Validators.required, Validators.minLength(5)]],
            telefono: ['', [Validators.required, Validators.minLength(7)]],
            email: ['', [Validators.email]]
        });
    }

    ngOnInit() {
        if (this.cliente) {
            this.clienteForm.patchValue(this.cliente);
            // El documento no debería editarse si es llave de negocio, pero aquí permitimos por ahora
        }
    }

    onSubmit() {
        if (this.clienteForm.invalid) {
            this.clienteForm.markAllAsTouched();
            return;
        }

        this.cargando.set(true);
        this.error.set('');
        const datos = this.clienteForm.value;

        if (this.cliente?.id) {
            this.clientesService.update(this.cliente.id, datos).subscribe({
                next: () => {
                    this.cargando.set(false);
                    this.guardado.emit();
                },
                error: (err) => {
                    this.cargando.set(false);
                    this.error.set(err.error?.message || 'Error al actualizar el cliente');
                }
            });
        } else {
            this.clientesService.create(datos).subscribe({
                next: () => {
                    this.cargando.set(false);
                    this.guardado.emit();
                },
                error: (err) => {
                    this.cargando.set(false);
                    this.error.set(err.error?.message || 'Error al crear el cliente. ¿El documento ya existe?');
                }
            });
        }
    }

    cancelar() {
        this.cancelado.emit();
    }
}
