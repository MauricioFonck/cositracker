import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AbonosService } from './abonos.service';
import { CreateAbonoDto } from './dto/create-abono.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('abonos')
@UseGuards(JwtAuthGuard)
export class AbonosController {
    constructor(private readonly abonosService: AbonosService) { }

    @Post()
    crear(@Body() createAbonoDto: CreateAbonoDto) {
        return this.abonosService.crear(createAbonoDto);
    }

    @Get('pedido/:pedidoId')
    encontrarPorPedido(@Param('pedidoId') pedidoId: string) {
        return this.abonosService.encontrarPorPedido(pedidoId);
    }

    @Delete(':id')
    eliminar(@Param('id') id: string) {
        return this.abonosService.eliminar(id);
    }
}
