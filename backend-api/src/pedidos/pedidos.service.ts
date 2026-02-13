import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido, EstadoPedido } from './entities/pedido.entity';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { Cliente } from '../clientes/entities/cliente.entity';

@Injectable()
export class PedidosService {
    constructor(
        @InjectRepository(Pedido)
        private readonly pedidoRepository: Repository<Pedido>,
        @InjectRepository(Cliente)
        private readonly clienteRepository: Repository<Cliente>,
    ) { }

    async crear(createPedidoDto: CreatePedidoDto, adminId: string): Promise<Pedido> {
        // Verificar que el cliente existe y pertenece al mismo administrador
        const cliente = await this.clienteRepository.findOne({
            where: { id: createPedidoDto.clienteId, adminId }
        });
        if (!cliente) {
            throw new NotFoundException(`Cliente con ID ${createPedidoDto.clienteId} no encontrado en tu cuenta`);
        }

        try {
            const pedido = this.pedidoRepository.create({
                ...createPedidoDto,
                cliente: cliente,
                adminId: adminId
            });
            // La generación de código y saldo inicial se maneja con @BeforeInsert en la entidad
            return await this.pedidoRepository.save(pedido);
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException('Error al crear el pedido');
        }
    }

    async encontrarTodos(adminId: string, filtros?: {
        estado?: EstadoPedido;
        clienteId?: string;
        termino?: string;
        page?: number;
        limit?: number;
    }): Promise<{ data: Pedido[], total: number }> {
        const page = filtros?.page || 1;
        const limit = filtros?.limit || 10;
        const skip = (page - 1) * limit;

        const query = this.pedidoRepository.createQueryBuilder('pedido')
            .leftJoinAndSelect('pedido.cliente', 'cliente')
            .where('pedido.adminId = :adminId', { adminId })
            .orderBy('pedido.createdAt', 'DESC');

        if (filtros?.estado) {
            query.andWhere('pedido.estado = :estado', { estado: filtros.estado });
        }

        if (filtros?.clienteId) {
            query.andWhere('pedido.clienteId = :clienteId', { clienteId: filtros.clienteId });
        }

        if (filtros?.termino) {
            const term = `%${filtros.termino}%`;
            query.andWhere(
                '(pedido.descripcion ILIKE :term OR pedido.tipoTrabajo ILIKE :term OR pedido.codigo ILIKE :term OR cliente.nombre ILIKE :term)',
                { term }
            );
        }

        query.skip(skip).take(limit);

        const [data, total] = await query.getManyAndCount();
        return { data, total };
    }

    async encontrarUno(id: string, adminId: string): Promise<Pedido> {
        const pedido = await this.pedidoRepository.findOne({
            where: { id, adminId },
            relations: ['cliente', 'abonos']
        });

        if (!pedido) {
            throw new NotFoundException(`Pedido con ID ${id} no encontrado en tu cuenta`);
        }
        return pedido;
    }

    async encontrarPorCodigo(codigo: string): Promise<Pedido> {
        const pedido = await this.pedidoRepository.findOne({
            where: { codigo },
            relations: ['cliente', 'abonos']
        });

        if (!pedido) {
            throw new NotFoundException(`Pedido con código ${codigo} no encontrado`);
        }
        return pedido;
    }

    async actualizar(id: string, updatePedidoDto: UpdatePedidoDto, adminId: string): Promise<Pedido> {
        const pedido = await this.encontrarUno(id, adminId);

        // Si se actualiza el precio total, actualizar el saldo
        if (updatePedidoDto.precioTotal !== undefined && updatePedidoDto.precioTotal !== pedido.precioTotal) {
            const totalAbonado = pedido.abonos ? pedido.abonos.reduce((sum, abono) => sum + Number(abono.monto), 0) : 0;
            pedido.saldoPendiente = Number(updatePedidoDto.precioTotal) - totalAbonado;
        }

        this.pedidoRepository.merge(pedido, updatePedidoDto);
        return await this.pedidoRepository.save(pedido);
    }

    async cambiarEstado(id: string, estado: EstadoPedido, adminId: string): Promise<Pedido> {
        const pedido = await this.encontrarUno(id, adminId);
        pedido.estado = estado;
        return await this.pedidoRepository.save(pedido);
    }

    async eliminar(id: string, adminId: string): Promise<void> {
        const result = await this.pedidoRepository.delete({ id, adminId });
        if (result.affected === 0) {
            throw new NotFoundException(`Pedido con ID ${id} no encontrado en tu cuenta`);
        }
    }
}
