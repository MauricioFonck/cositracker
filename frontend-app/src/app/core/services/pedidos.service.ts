import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Pedido, EstadoPedido } from '../models/pedido.model';

@Injectable({
    providedIn: 'root'
})
export class PedidosService {
    private apiUrl = `${environment.apiUrl}/pedidos`;

    constructor(private http: HttpClient) { }

    getAll(
        termino?: string,
        estado?: EstadoPedido,
        clienteId?: string,
        page: number = 1,
        limit: number = 10
    ): Observable<{ data: Pedido[], total: number }> {
        let params: any = { page, limit };
        if (termino) params.termino = termino;
        if (estado) params.estado = estado;
        if (clienteId) params.clienteId = clienteId;

        return this.http.get<{ data: Pedido[], total: number }>(this.apiUrl, { params });
    }

    getOne(id: string): Observable<Pedido> {
        return this.http.get<Pedido>(`${this.apiUrl}/${id}`);
    }

    getByCodigo(codigo: string): Observable<Pedido> {
        return this.http.get<Pedido>(`${this.apiUrl}/consulta/${codigo}`);
    }

    create(pedido: Pedido): Observable<Pedido> {
        return this.http.post<Pedido>(this.apiUrl, pedido);
    }

    update(id: string, pedido: Partial<Pedido>): Observable<Pedido> {
        return this.http.patch<Pedido>(`${this.apiUrl}/${id}`, pedido);
    }

    changeState(id: string, estado: EstadoPedido): Observable<Pedido> {
        return this.http.patch<Pedido>(`${this.apiUrl}/${id}/estado/${estado}`, {});
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
