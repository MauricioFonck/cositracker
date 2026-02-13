import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {
    loginForm: FormGroup;
    cargando = signal(false);
    error = signal('');
    mostrarPassword = signal(false);

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]]
        });
    }

    get emailControl() {
        return this.loginForm.get('email');
    }

    get passwordControl() {
        return this.loginForm.get('password');
    }

    obtenerErrorEmail(): string {
        if (this.emailControl?.hasError('required')) {
            return 'El correo electrónico es obligatorio';
        }
        if (this.emailControl?.hasError('email')) {
            return 'Ingresa un correo electrónico válido';
        }
        return '';
    }

    obtenerErrorPassword(): string {
        if (this.passwordControl?.hasError('required')) {
            return 'La contraseña es obligatoria';
        }
        if (this.passwordControl?.hasError('minlength')) {
            return 'La contraseña debe tener al menos 6 caracteres';
        }
        return '';
    }

    toggleMostrarPassword(): void {
        this.mostrarPassword.update(value => !value);
    }

    onSubmit(): void {
        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }

        this.cargando.set(true);
        this.error.set('');

        const { email, password } = this.loginForm.value;

        this.authService.login({ email, password }).subscribe({
            next: () => {
                this.cargando.set(false);
                // Redireccionar al dashboard administrativo
                this.router.navigate(['/admin/dashboard']);
            },
            error: (err) => {
                this.cargando.set(false);
                console.error('Error de login:', err);

                // Manejar diferentes tipos de errores
                if (err.status === 401) {
                    this.error.set('Credenciales incorrectas. Por favor verifica tu correo y contraseña.');
                } else if (err.status === 0) {
                    this.error.set('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
                } else {
                    this.error.set('Ocurrió un error al iniciar sesión. Por favor intenta nuevamente.');
                }
            }
        });
    }

    limpiarError(): void {
        this.error.set('');
    }
}
