import { Injectable, ConflictException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from './entities/cliente.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClientesService {
    constructor(
        @InjectRepository(Cliente)
        private readonly clienteRepository: Repository<Cliente>,
    ) { }

    async crear(createClienteDto: CreateClienteDto, adminId: string): Promise<Cliente> {
        const { documento } = createClienteDto;

        // Verificar si el cliente ya existe para este administrador
        const existe = await this.clienteRepository.findOne({ where: { documento, adminId } });
        if (existe) {
            throw new ConflictException(`El cliente con documento ${documento} ya existe en tu cuenta`);
        }

        try {
            const cliente = this.clienteRepository.create({ ...createClienteDto, adminId });
            return await this.clienteRepository.save(cliente);
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException('Error al crear el cliente');
        }
    }

    async encontrarTodos(adminId: string, filtros?: {
        termino?: string;
        page?: number;
        limit?: number;
    }): Promise<{ data: Cliente[], total: number }> {
        const page = filtros?.page || 1;
        const limit = filtros?.limit || 10;
        const skip = (page - 1) * limit;

        const query = this.clienteRepository.createQueryBuilder('cliente')
            .where('cliente.adminId = :adminId', { adminId })
            .orderBy('cliente.createdAt', 'DESC');

        if (filtros?.termino) {
            const term = `%${filtros.termino}%`;
            query.andWhere(
                '(cliente.nombre ILIKE :term OR cliente.documento ILIKE :term OR cliente.telefono ILIKE :term OR cliente.email ILIKE :term)',
                { term }
            );
        }

        query.skip(skip).take(limit);

        const [data, total] = await query.getManyAndCount();
        return { data, total };
    }

    async encontrarUno(id: string, adminId: string): Promise<Cliente> {
        const cliente = await this.clienteRepository.findOne({ where: { id, adminId } });
        if (!cliente) {
            throw new NotFoundException(`Cliente con ID ${id} no encontrado en tu cuenta`);
        }
        return cliente;
    }

    async encontrarPorDocumento(documento: string, adminId: string): Promise<Cliente> {
        const cliente = await this.clienteRepository.findOne({ where: { documento, adminId } });
        if (!cliente) {
            throw new NotFoundException(`Cliente con documento ${documento} no encontrado en tu cuenta`);
        }
        return cliente;
    }

    async actualizar(id: string, updateClienteDto: UpdateClienteDto, adminId: string): Promise<Cliente> {
        const cliente = await this.encontrarUno(id, adminId);

        // Si se actualiza el documento, verificar que no exista ya para este administrador
        if (updateClienteDto.documento && updateClienteDto.documento !== cliente.documento) {
            const existe = await this.clienteRepository.findOne({ where: { documento: updateClienteDto.documento, adminId } });
            if (existe) {
                throw new ConflictException(`El documento ${updateClienteDto.documento} ya está registrado en tu cuenta`);
            }
        }

        try {
            this.clienteRepository.merge(cliente, updateClienteDto);
            return await this.clienteRepository.save(cliente);
        } catch (error) {
            throw new InternalServerErrorException('Error al actualizar el cliente');
        }
    }

    async eliminar(id: string, adminId: string): Promise<void> {
        const result = await this.clienteRepository.delete({ id, adminId });
        if (result.affected === 0) {
            throw new NotFoundException(`Cliente con ID ${id} no encontrado en tu cuenta`);
        }
    }
}
