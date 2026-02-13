import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AdminsService } from '../admins/admins.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Admin } from '../admins/entities/admin.entity';

@Injectable()
export class AuthService {
    constructor(
        private adminsService: AdminsService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.adminsService.findOneByEmail(email);
        console.log('Validating user:', email, user ? 'found' : 'not found');
        if (user) {
            const isMatch = await bcrypt.compare(pass, user.password);
            console.log('Password match:', isMatch);
            if (isMatch) {
                const { password, ...result } = user;
                return result;
            }
        }
        return null;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                isActive: user.isActive,
                roles: user.roles || ['admin']
            }
        };
    }

    async register(adminData: Partial<Admin>) {
        if (!adminData.email || !adminData.password) {
            throw new Error('Email and password are required');
        }
        // Check if user exists
        const existing = await this.adminsService.findOneByEmail(adminData.email);
        if (existing) {
            throw new Error('User already exists');
        }
        return this.adminsService.create(adminData);
    }
}
