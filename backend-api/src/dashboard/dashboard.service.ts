import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Pedido, EstadoPedido } from '../pedidos/entities/pedido.entity';
import { Abono } from '../abonos/entities/abono.entity';
import { Cliente } from '../clientes/entities/cliente.entity';

@Injectable()
export class DashboardService {
    constructor(
        @InjectRepository(Pedido)
        private pedidoRepository: Repository<Pedido>,
        @InjectRepository(Abono)
        private abonoRepository: Repository<Abono>,
        @InjectRepository(Cliente)
        private clienteRepository: Repository<Cliente>,
    ) { }

    async getStats(adminId: string) {
        // Pedidos activos (PENDIENTE, EN_PROCESO, LISTO) - LISTO también se considera activo hasta que se ENTREGA
        const pedidosActivos = await this.pedidoRepository.count({
            where: {
                adminId,
                estado: In([EstadoPedido.PENDIENTE, EstadoPedido.EN_PROCESO, EstadoPedido.LISTO])
            }
        });

        // Ingresos mes actual
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        // Ajustar a medianoche UTC o zona local? TypeORM date columns usually work with Date objects correctly.
        // Pero 'date' type en Postgres guarda YYYY-MM-DD.
        // Mejor usar string comparison o date objects.
        // La entidad Abono usa @Column({ type: 'date', ... }) lo cual en JS puede ser string o Date dependiendo de driver/config.

        // Para asegurar query correcta con fechas:
        const firstDay = startOfMonth.toISOString().split('T')[0];
        // Para último día del mes:
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const lastDay = endOfMonth.toISOString().split('T')[0];

        const { suma } = await this.abonoRepository.createQueryBuilder('abono')
            .select('SUM(abono.monto)', 'suma')
            .where('abono.adminId = :adminId', { adminId })
            .andWhere('abono.fecha >= :start', { start: firstDay })
            .andWhere('abono.fecha <= :end', { end: lastDay })
            .getRawOne();

        const ingresosMes = suma ? Number(suma) : 0;

        // Pedidos por estado
        const pedidosPorEstado = await this.pedidoRepository.createQueryBuilder('pedido')
            .select('pedido.estado', 'estado')
            .addSelect('COUNT(pedido.id)', 'count')
            .where('pedido.adminId = :adminId', { adminId })
            .groupBy('pedido.estado')
            .getRawMany();

        // Total clientes
        const totalClientes = await this.clienteRepository.count({ where: { adminId } });

        // Total Saldo Pendiente (Dinero por cobrar)
        const { saldoTotal } = await this.pedidoRepository.createQueryBuilder('pedido')
            .select('SUM(pedido.saldoPendiente)', 'saldoTotal')
            .where('pedido.adminId = :adminId', { adminId })
            .getRawOne();

        const dineroPorCobrar = saldoTotal ? Number(saldoTotal) : 0;

        return {
            pedidosActivos,
            ingresosMes,
            pedidosPorEstado: pedidosPorEstado.map(p => ({ estado: p.estado, count: Number(p.count) })),
            totalClientes,
            dineroPorCobrar
        };
    }
}
