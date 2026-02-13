import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AbonosService } from './abonos.service';
import { AbonosController } from './abonos.controller';
import { Abono } from './entities/abono.entity';
import { Pedido } from '../pedidos/entities/pedido.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Abono, Pedido])],
    controllers: [AbonosController],
    providers: [AbonosService],
    exports: [AbonosService],
})
export class AbonosModule { }
