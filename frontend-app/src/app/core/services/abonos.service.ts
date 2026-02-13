import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Abono } from '../models/abono.model';

@Injectable({
    providedIn: 'root'
})
export class AbonosService {
    private apiUrl = `${environment.apiUrl}/abonos`;

    constructor(private http: HttpClient) { }

    getByPedido(pedidoId: string): Observable<Abono[]> {
        return this.http.get<Abono[]>(`${this.apiUrl}/pedido/${pedidoId}`);
    }

    create(abono: Abono): Observable<Abono> {
        return this.http.post<Abono>(this.apiUrl, abono);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
