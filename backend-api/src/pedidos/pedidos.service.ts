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

    async crear(createPedidoDto: CreatePedidoDto): Promise<Pedido> {
        // Verificar que el cliente existe
        const cliente = await this.clienteRepository.findOne({ where: { id: createPedidoDto.clienteId } });
        if (!cliente) {
            throw new NotFoundException(`Cliente con ID ${createPedidoDto.clienteId} no encontrado`);
        }

        try {
            const pedido = this.pedidoRepository.create({
                ...createPedidoDto,
                cliente: cliente
            });
            // La generación de código y saldo inicial se maneja con @BeforeInsert en la entidad
            return await this.pedidoRepository.save(pedido);
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException('Error al crear el pedido');
        }
    }

    async encontrarTodos(filtros?: {
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

    async encontrarUno(id: string): Promise<Pedido> {
        const pedido = await this.pedidoRepository.findOne({
            where: { id },
            relations: ['cliente', 'abonos']
        });

        if (!pedido) {
            throw new NotFoundException(`Pedido con ID ${id} no encontrado`);
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

    async actualizar(id: string, updatePedidoDto: UpdatePedidoDto): Promise<Pedido> {
        const pedido = await this.encontrarUno(id);

        // Si se actualiza el precio total, actualizar el saldo
        if (updatePedidoDto.precioTotal !== undefined && updatePedidoDto.precioTotal !== pedido.precioTotal) {
            // Calcular nuevo saldo: Nuevo Precio - Total Abonos (siempre asumiendo 0 abonos aqui si no se cargan, pero deberian venir en encontrarUno)
            // Nota: Si 'abonos' no se carga por defecto en encontrarUno, debo asegurarme. Si esta en relation, TypeORM devuelve array vacio o undefined?
            // En typeorm findOne con relation, trae array.
            const totalAbonado = pedido.abonos ? pedido.abonos.reduce((sum, abono) => sum + Number(abono.monto), 0) : 0;

            // El nuevo saldo es el nuevo precio total menos lo que ya se abonó
            pedido.saldoPendiente = Number(updatePedidoDto.precioTotal) - totalAbonado;
        }

        this.pedidoRepository.merge(pedido, updatePedidoDto);
        return await this.pedidoRepository.save(pedido);
    }

    async cambiarEstado(id: string, estado: EstadoPedido): Promise<Pedido> {
        const pedido = await this.encontrarUno(id);
        pedido.estado = estado;
        return await this.pedidoRepository.save(pedido);
    }

    async eliminar(id: string): Promise<void> {
        const result = await this.pedidoRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Pedido con ID ${id} no encontrado`);
        }
    }
}
