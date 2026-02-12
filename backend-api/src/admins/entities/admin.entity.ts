import { Entity, Column, Unique } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

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
}
