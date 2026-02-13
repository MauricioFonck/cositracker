import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('clientes')
@UseGuards(JwtAuthGuard)
export class ClientesController {
    constructor(private readonly clientesService: ClientesService) { }

    @Post()
    crear(@Body() createClienteDto: CreateClienteDto, @Request() req) {
        return this.clientesService.crear(createClienteDto, req.user.userId);
    }

    @Get()
    encontrarTodos(
        @Request() req,
        @Query('termino') termino?: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ) {
        return this.clientesService.encontrarTodos(req.user.userId, {
            termino,
            page: Number(page),
            limit: Number(limit)
        });
    }

    @Get(':id')
    encontrarUno(@Param('id') id: string, @Request() req) {
        return this.clientesService.encontrarUno(id, req.user.userId);
    }

    @Get('documento/:documento')
    encontrarPorDocumento(@Param('documento') documento: string, @Request() req) {
        return this.clientesService.encontrarPorDocumento(documento, req.user.userId);
    }

    @Patch(':id')
    actualizar(@Param('id') id: string, @Body() updateClienteDto: UpdateClienteDto, @Request() req) {
        return this.clientesService.actualizar(id, updateClienteDto, req.user.userId);
    }

    @Delete(':id')
    eliminar(@Param('id') id: string, @Request() req) {
        return this.clientesService.eliminar(id, req.user.userId);
    }
}
