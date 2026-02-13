import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-registro',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './registro.component.html',
    styleUrls: ['./registro.component.scss']
})
export class RegistroComponent {
    registroForm: FormGroup;
    cargando = signal(false);
    error = signal('');
    exito = signal(false);
    mostrarPassword = signal(false);
    mostrarConfirmPassword = signal(false);

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.registroForm = this.fb.group({
            fullName: ['', [Validators.required, Validators.minLength(3)]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]]
        }, {
            validators: this.passwordMatchValidator
        });
    }

    passwordMatchValidator(g: FormGroup) {
        return g.get('password')?.value === g.get('confirmPassword')?.value
            ? null : { mismatch: true };
    }

    get f() { return this.registroForm.controls; }

    obtenerError(campo: string): string {
        const control = this.registroForm.get(campo);
        if (control?.hasError('required')) return 'Este campo es obligatorio';
        if (control?.hasError('email')) return 'Correo no válido';
        if (control?.hasError('minlength')) {
            const min = control.errors?.['minlength'].requiredLength;
            return `Mínimo ${min} caracteres`;
        }
        if (this.registroForm.hasError('mismatch') && campo === 'confirmPassword') {
            return 'Las contraseñas no coinciden';
        }
        return '';
    }

    toggleMostrarPassword(): void {
        this.mostrarPassword.update(v => !v);
    }

    toggleMostrarConfirmPassword(): void {
        this.mostrarConfirmPassword.update(v => !v);
    }

    onSubmit(): void {
        if (this.registroForm.invalid) {
            this.registroForm.markAllAsTouched();
            return;
        }

        this.cargando.set(true);
        this.error.set('');

        const { fullName, email, password } = this.registroForm.value;

        this.authService.register({ fullName, email, password }).subscribe({
            next: () => {
                this.cargando.set(false);
                this.exito.set(true);
                setTimeout(() => this.router.navigate(['/login']), 3000);
            },
            error: (err) => {
                this.cargando.set(false);
                if (err.status === 400 || err.status === 409) {
                    this.error.set('El correo ya está registrado o los datos son inválidos.');
                } else {
                    this.error.set('Ocurrió un error en el registro. Intenta más tarde.');
                }
            }
        });
    }
}
