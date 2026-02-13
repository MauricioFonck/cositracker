import { Entity, Column, Unique, BeforeInsert, BeforeUpdate } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import * as bcrypt from 'bcrypt';

@Entity('admins')
@Unique(['email'])
export class Admin extends BaseEntity {
    @Column()
    @IsNotEmpty()
    fullName: string;

    @Column()
    @IsEmail()
    email: string;

    @Column({ select: false }) // Don't return password by default
    @MinLength(6)
    password: string;

    @Column({ default: true })
    isActive: boolean;

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword() {
        if (this.password && !this.password.startsWith('$2b$')) {
            const salt = await bcrypt.genSalt();
            this.password = await bcrypt.hash(this.password, salt);
        }
    }

    async validatePassword(password: string): Promise<boolean> {
        return await bcrypt.compare(password, this.password);
    }
}
