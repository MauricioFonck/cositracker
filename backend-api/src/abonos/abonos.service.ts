import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Abono } from './entities/abono.entity';
import { Pedido } from '../pedidos/entities/pedido.entity';
import { CreateAbonoDto } from './dto/create-abono.dto';

@Injectable()
export class AbonosService {
    constructor(
        @InjectRepository(Abono)
        private readonly abonoRepository: Repository<Abono>,
        @InjectRepository(Pedido)
        private readonly pedidoRepository: Repository<Pedido>,
    ) { }

    async crear(createAbonoDto: CreateAbonoDto, adminId: string): Promise<Abono> {
        const pedido = await this.pedidoRepository.findOne({
            where: { id: createAbonoDto.pedidoId, adminId }
        });

        if (!pedido) {
            throw new NotFoundException(`Pedido con ID ${createAbonoDto.pedidoId} no encontrado en tu cuenta`);
        }

        if (Number(createAbonoDto.monto) > Number(pedido.saldoPendiente)) {
            throw new BadRequestException(`El monto del abono (${createAbonoDto.monto}) no puede ser mayor al saldo pendiente (${pedido.saldoPendiente})`);
        }

        const abono = this.abonoRepository.create({ ...createAbonoDto, adminId });
        const abonoGuardado = await this.abonoRepository.save(abono);

        // Actualizar saldo del pedido
        await this.actualizarSaldoPedido(pedido.id, adminId);

        return abonoGuardado;
    }

    async encontrarPorPedido(pedidoId: string, adminId: string): Promise<Abono[]> {
        return await this.abonoRepository.find({
            where: { pedidoId, adminId },
            order: { fecha: 'DESC', createdAt: 'DESC' }
        });
    }

    async eliminar(id: string, adminId: string): Promise<void> {
        const abono = await this.abonoRepository.findOne({ where: { id, adminId } });
        if (!abono) {
            throw new NotFoundException(`Abono con ID ${id} no encontrado en tu cuenta`);
        }

        const pedidoId = abono.pedidoId;
        await this.abonoRepository.remove(abono);

        // Recalcular saldo del pedido
        await this.actualizarSaldoPedido(pedidoId, adminId);
    }

    private async actualizarSaldoPedido(pedidoId: string, adminId: string): Promise<void> {
        const pedido = await this.pedidoRepository.findOne({
            where: { id: pedidoId, adminId },
            relations: { abonos: true }
        });

        if (pedido) {
            const totalAbonado = pedido.abonos.reduce((sum, abono) => sum + Number(abono.monto), 0);
            pedido.saldoPendiente = Number(pedido.precioTotal) - totalAbonado;

            // Asegurar que no sea negativo por errores de punto flotante
            if (pedido.saldoPendiente < 0) pedido.saldoPendiente = 0;

            // Actualizar estado si saldo es 0 (opcional, pero util)
            /* 
            if (pedido.saldoPendiente === 0 && pedido.estado === EstadoPedido.PENDIENTE) {
                 pedido.estado = EstadoPedido.EN_PROCESO; // O mantener estado manual
            }
            */

            await this.pedidoRepository.save(pedido);
        }
    }
}
