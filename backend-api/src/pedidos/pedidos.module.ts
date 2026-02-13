import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PedidosService } from './pedidos.service';
import { PedidosController } from './pedidos.controller';
import { Pedido } from './entities/pedido.entity';
import { Cliente } from '../clientes/entities/cliente.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Pedido, Cliente])],
    controllers: [PedidosController],
    providers: [PedidosService],
    exports: [PedidosService],
})
export class PedidosModule { }
