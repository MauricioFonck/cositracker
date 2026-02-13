import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { EstadoPedido } from './entities/pedido.entity';

@Controller('pedidos')
@UseGuards(JwtAuthGuard)
export class PedidosController {
    constructor(private readonly pedidosService: PedidosService) { }

    @Post()
    crear(@Body() createPedidoDto: CreatePedidoDto) {
        return this.pedidosService.crear(createPedidoDto);
    }

    @Get()
    encontrarTodos(
        @Query('estado') estado?: EstadoPedido,
        @Query('clienteId') clienteId?: string,
        @Query('termino') termino?: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ) {
        return this.pedidosService.encontrarTodos({
            estado,
            clienteId,
            termino,
            page: Number(page),
            limit: Number(limit)
        });
    }

    @Public() // Endpoint público para consultar estado sin login
    @Get('consulta/:codigo')
    consultarPorCodigo(@Param('codigo') codigo: string) {
        return this.pedidosService.encontrarPorCodigo(codigo);
    }

    @Get(':id')
    encontrarUno(@Param('id') id: string) {
        return this.pedidosService.encontrarUno(id);
    }

    @Patch(':id')
    actualizar(@Param('id') id: string, @Body() updatePedidoDto: UpdatePedidoDto) {
        return this.pedidosService.actualizar(id, updatePedidoDto);
    }

    @Patch(':id/estado/:estado')
    cambiarEstado(@Param('id') id: string, @Param('estado') estado: EstadoPedido) {
        return this.pedidosService.cambiarEstado(id, estado);
    }

    @Delete(':id')
    eliminar(@Param('id') id: string) {
        return this.pedidosService.eliminar(id);
    }
}
