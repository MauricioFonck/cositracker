export interface Abono {
    id?: string;
    pedidoId: string;
    monto: number;
    fecha: string;
    metodoPago: 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA' | 'OTRO';
    nota?: string;
    createdAt?: string;
    updatedAt?: string;
}
