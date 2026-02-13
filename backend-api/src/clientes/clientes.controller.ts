import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('clientes')
@UseGuards(JwtAuthGuard)
export class ClientesController {
    constructor(private readonly clientesService: ClientesService) { }

    @Post()
    crear(@Body() createClienteDto: CreateClienteDto) {
        return this.clientesService.crear(createClienteDto);
    }

    @Get()
    encontrarTodos(
        @Query('termino') termino?: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ) {
        return this.clientesService.encontrarTodos({
            termino,
            page: Number(page),
            limit: Number(limit)
        });
    }

    @Get(':id')
    encontrarUno(@Param('id') id: string) {
        return this.clientesService.encontrarUno(id);
    }

    @Get('documento/:documento')
    encontrarPorDocumento(@Param('documento') documento: string) {
        return this.clientesService.encontrarPorDocumento(documento);
    }

    @Patch(':id')
    actualizar(@Param('id') id: string, @Body() updateClienteDto: UpdateClienteDto) {
        return this.clientesService.actualizar(id, updateClienteDto);
    }

    @Delete(':id')
    eliminar(@Param('id') id: string) {
        return this.clientesService.eliminar(id);
    }
}
