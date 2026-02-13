import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './entities/admin.entity';

@Injectable()
export class AdminsService {
    constructor(
        @InjectRepository(Admin)
        private adminsRepository: Repository<Admin>,
    ) { }

    async create(createAdminDto: Partial<Admin>): Promise<Admin> {
        const admin = this.adminsRepository.create(createAdminDto);
        return await this.adminsRepository.save(admin);
    }

    async findOneByEmail(email: string): Promise<Admin | null> {
        return await this.adminsRepository.findOne({
            where: { email },
            select: ['id', 'email', 'password', 'fullName', 'isActive', 'createdAt', 'updatedAt'] // Need password for auth
        });
    }

    async findOneById(id: string): Promise<Admin | null> {
        return await this.adminsRepository.findOneBy({ id });
    }
}
