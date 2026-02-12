import { Entity, Column, OneToMany, Unique } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Pedido } from '../../pedidos/entities/pedido.entity';

@Entity('clientes')
@Unique(['documento'])
export class Cliente extends BaseEntity {
    @Column()
    nombre: string;

    @Column()
    documento: string; // Cédula o ID único

    @Column({ nullable: true })
    telefono: string;

    @Column({ nullable: true })
    direccion: string;

    @Column({ nullable: true })
    email: string;

    @OneToMany(() => Pedido, (pedido) => pedido.cliente)
    pedidos: Pedido[];
}
