import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginResponse, User } from '../models/auth.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = `${environment.apiUrl}/auth`;
    private _currentUser = signal<User | null>(null);

    // Public signal for reading user
    currentUser = this._currentUser.asReadonly();

    constructor(
        private http: HttpClient,
        private router: Router
    ) { }

    init(): void {
        this.restoreSession();
    }

    private restoreSession(): void {
        const token = localStorage.getItem('token');
        if (token) {
            // Decode JWT to get user info if possible, or fetch profile
            // For now, let's assume valid session if token exists and try to fetch profile
            this.getProfile().subscribe({
                next: (user) => this._currentUser.set(user),
                error: () => this.logout() // Token invalid
            });
        }
    }

    login(credentials: { email: string; password: string }): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
            tap(response => {
                localStorage.setItem('token', response.access_token);
                if (response.user) {
                    this._currentUser.set(response.user);
                } else {
                    this.getProfile().subscribe(user => this._currentUser.set(user));
                }
            })
        );
    }

    register(data: { fullName: string; email: string; password: string }): Observable<User> {
        return this.http.post<User>(`${this.apiUrl}/register`, data);
    }

    logout(): void {
        localStorage.removeItem('token');
        this._currentUser.set(null);
        this.router.navigate(['/login']);
    }

    getProfile(): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/profile`).pipe(
            catchError(err => {
                // Si falla el profile (ej token expirado), hacemos logout
                return throwError(() => err);
            })
        );
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }
}
