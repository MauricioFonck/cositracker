import { Cliente } from './cliente.model';
import { Abono } from './abono.model';

export type EstadoPedido = 'PENDIENTE' | 'EN_PROCESO' | 'LISTO' | 'ENTREGADO' | 'CANCELADO';

export interface Pedido {
    id?: string;
    codigo?: string;
    clienteId: string;
    cliente?: Cliente;
    tipoTrabajo: string;
    descripcion: string;
    precioTotal: number;
    saldoPendiente: number;
    estado: EstadoPedido;
    fechaEntrega?: string;
    notas?: string;
    abonos?: Abono[];
    createdAt?: string;
    updatedAt?: string;
}
