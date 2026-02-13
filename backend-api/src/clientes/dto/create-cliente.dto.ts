import { IsNotEmpty, IsString, IsOptional, IsEmail } from 'class-validator';

export class CreateClienteDto {
    @IsNotEmpty({ message: 'El nombre es obligatorio' })
    @IsString()
    nombre: string;

    @IsNotEmpty({ message: 'El documento es obligatorio' })
    @IsString()
    documento: string;

    @IsNotEmpty({ message: 'El teléfono es obligatorio' })
    @IsString()
    telefono: string;

    @IsOptional()
    @IsEmail({}, { message: 'El email debe tener un formato válido' })
    email?: string;
}
