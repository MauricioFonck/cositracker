import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Pedido } from '../pedidos/entities/pedido.entity';
import { Abono } from '../abonos/entities/abono.entity';
import { Cliente } from '../clientes/entities/cliente.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Pedido, Abono, Cliente])],
    controllers: [DashboardController],
    providers: [DashboardService],
})
export class DashboardModule { }
