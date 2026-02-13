import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cliente } from '../models/cliente.model';

@Injectable({
    providedIn: 'root'
})
export class ClientesService {
    private apiUrl = `${environment.apiUrl}/clientes`;

    constructor(private http: HttpClient) { }

    getAll(termino?: string, page: number = 1, limit: number = 10): Observable<{ data: Cliente[], total: number }> {
        let params: any = { page, limit };
        if (termino) params.termino = termino;
        return this.http.get<{ data: Cliente[], total: number }>(this.apiUrl, { params });
    }

    getOne(id: string): Observable<Cliente> {
        return this.http.get<Cliente>(`${this.apiUrl}/${id}`);
    }

    getByDocumento(documento: string): Observable<Cliente> {
        return this.http.get<Cliente>(`${this.apiUrl}/documento/${documento}`);
    }

    create(cliente: Cliente): Observable<Cliente> {
        return this.http.post<Cliente>(this.apiUrl, cliente);
    }

    update(id: string, cliente: Partial<Cliente>): Observable<Cliente> {
        return this.http.patch<Cliente>(`${this.apiUrl}/${id}`, cliente);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
