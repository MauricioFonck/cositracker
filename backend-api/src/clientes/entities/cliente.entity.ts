import { Entity, Column, OneToMany, Unique } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Pedido } from '../../pedidos/entities/pedido.entity';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@Entity('clientes')
@Unique(['documento'])
export class Cliente extends BaseEntity {
    @Column()
    @IsNotEmpty({ message: 'El nombre es obligatorio' })
    @IsString()
    nombre: string;

    @Column()
    @IsNotEmpty({ message: 'El documento es obligatorio' })
    @IsString()
    documento: string; // Cédula o ID único

    @Column()
    @IsNotEmpty({ message: 'El teléfono es obligatorio' })
    @IsString()
    telefono: string;

    @Column({ nullable: true })
    @IsOptional()
    @IsEmail({}, { message: 'El email debe tener un formato válido' })
    email: string;

    @OneToMany(() => Pedido, (pedido) => pedido.cliente)
    pedidos: Pedido[];
}
