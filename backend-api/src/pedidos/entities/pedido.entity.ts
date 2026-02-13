import { Entity, Column, ManyToOne, OneToMany, BeforeInsert } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Cliente } from '../../clientes/entities/cliente.entity';
import { Abono } from '../../abonos/entities/abono.entity';
import { Admin } from '../../admins/entities/admin.entity';
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export enum EstadoPedido {
    PENDIENTE = 'PENDIENTE',
    EN_PROCESO = 'EN_PROCESO',
    LISTO = 'LISTO',
    ENTREGADO = 'ENTREGADO',
    CANCELADO = 'CANCELADO',
}

@Entity('pedidos')
export class Pedido extends BaseEntity {
    @Column({ unique: true })
    codigo: string; // Generado automáticamente, ej: ORD-12345

    @Column()
    @IsNotEmpty({ message: 'El tipo de trabajo es obligatorio' })
    @IsString()
    tipoTrabajo: string;

    @Column('text')
    @IsNotEmpty({ message: 'La descripción es obligatoria' })
    @IsString()
    descripcion: string;

    @Column('decimal', { precision: 10, scale: 2 })
    @IsNotEmpty({ message: 'El precio total es obligatorio' })
    @IsNumber()
    @Min(0)
    precioTotal: number;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    saldoPendiente: number;

    @Column({
        type: 'enum',
        enum: EstadoPedido,
        default: EstadoPedido.PENDIENTE,
    })
    @IsEnum(EstadoPedido)
    estado: EstadoPedido;

    @Column({ type: 'date', nullable: true })
    @IsOptional()
    @IsDateString()
    fechaEntrega: string; // Cambiado a string para compatibilidad con JSON/DateString

    @ManyToOne(() => Cliente, (cliente) => cliente.pedidos, { onDelete: 'CASCADE' })
    cliente: Cliente;

    @Column()
    @IsNotEmpty({ message: 'El ID del cliente es obligatorio' })
    clienteId: string;

    @OneToMany(() => Abono, (abono) => abono.pedido)
    abonos: Abono[];

    @ManyToOne(() => Admin, { onDelete: 'CASCADE' })
    admin: Admin;

    @Column({ nullable: true })
    adminId: string;

    @BeforeInsert()
    generarCodigo() {
        // Generar un código único simple: 3 letras al azar + Timestamp corto
        const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let randomLetras = '';
        for (let i = 0; i < 3; i++) {
            randomLetras += letras.charAt(Math.floor(Math.random() * letras.length));
        }
        const timestamp = Date.now().toString().slice(-6);
        this.codigo = `${randomLetras}${timestamp}`;
    }

    @BeforeInsert()
    inicializarSaldo() {
        if (this.saldoPendiente === undefined || this.saldoPendiente === 0) {
            this.saldoPendiente = this.precioTotal;
        }
    }
}

