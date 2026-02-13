import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AbonosService } from './abonos.service';
import { CreateAbonoDto } from './dto/create-abono.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('abonos')
@UseGuards(JwtAuthGuard)
export class AbonosController {
    constructor(private readonly abonosService: AbonosService) { }

    @Post()
    crear(@Body() createAbonoDto: CreateAbonoDto, @Request() req) {
        return this.abonosService.crear(createAbonoDto, req.user.userId);
    }

    @Get('pedido/:pedidoId')
    encontrarPorPedido(@Param('pedidoId') pedidoId: string, @Request() req) {
        return this.abonosService.encontrarPorPedido(pedidoId, req.user.userId);
    }

    @Delete(':id')
    eliminar(@Param('id') id: string, @Request() req) {
        return this.abonosService.eliminar(id, req.user.userId);
    }
}
