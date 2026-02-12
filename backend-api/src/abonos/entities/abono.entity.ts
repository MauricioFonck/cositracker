import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Pedido } from '../../pedidos/entities/pedido.entity';

export enum MetodoPago {
    EFECTIVO = 'EFECTIVO',
    TRANSFERENCIA = 'TRANSFERENCIA',
    TARJETA = 'TARJETA',
    OTRO = 'OTRO',
}

@Entity('abonos')
export class Abono extends BaseEntity {
    @Column('decimal', { precision: 10, scale: 2 })
    monto: number;

    @Column({ type: 'date', default: () => 'CURRENT_DATE' })
    fecha: Date;

    @Column({
        type: 'enum',
        enum: MetodoPago,
        default: MetodoPago.EFECTIVO,
    })
    metodoPago: MetodoPago;

    @Column({ nullable: true })
    nota: string;

    @ManyToOne(() => Pedido, (pedido) => pedido.abonos, { onDelete: 'CASCADE' })
    pedido: Pedido;

    @Column()
    pedidoId: string;
}
