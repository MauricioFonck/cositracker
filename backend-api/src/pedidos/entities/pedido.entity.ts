import { Entity, Column, ManyToOne, OneToMany, Unique } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Cliente } from '../../clientes/entities/cliente.entity';
import { Abono } from '../../abonos/entities/abono.entity';

export enum EstadoPedido {
    PENDIENTE = 'PENDIENTE',
    EN_PROCESO = 'EN_PROCESO',
    LISTO = 'LISTO',
    ENTREGADO = 'ENTREGADO',
    CANCELADO = 'CANCELADO',
}

@Entity('pedidos')
@Unique(['codigo'])
export class Pedido extends BaseEntity {
    @Column()
    codigo: string; // Generado automáticamente, ej: ORD-12345

    @Column('text')
    descripcion: string;

    @Column('decimal', { precision: 10, scale: 2 })
    precioTotal: number;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    saldoPendiente: number;

    @Column({
        type: 'enum',
        enum: EstadoPedido,
        default: EstadoPedido.PENDIENTE,
    })
    estado: EstadoPedido;

    @Column({ type: 'date', nullable: true })
    fechaEntrega: Date;

    @ManyToOne(() => Cliente, (cliente) => cliente.pedidos, { onDelete: 'CASCADE' })
    cliente: Cliente;

    @Column()
    clienteId: string;

    @OneToMany(() => Abono, (abono) => abono.pedido)
    abonos: Abono[];
}
