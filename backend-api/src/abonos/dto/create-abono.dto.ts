import { IsNotEmpty, IsNumber, Min, IsOptional, IsEnum, IsUUID, IsDateString, IsString } from 'class-validator';
import { MetodoPago } from '../entities/abono.entity';

export class CreateAbonoDto {
    @IsNotEmpty({ message: 'El ID del pedido es obligatorio' })
    @IsUUID('4', { message: 'El ID del pedido debe ser un UUID válido' })
    pedidoId: string;

    @IsNotEmpty({ message: 'El monto es obligatorio' })
    @IsNumber({}, { message: 'El monto debe ser un número' })
    @Min(0.01, { message: 'El monto debe ser mayor a 0' })
    monto: number;

    @IsOptional()
    @IsEnum(MetodoPago, { message: 'El método de pago debe ser válido (EFECTIVO, TRANSFERENCIA, TARJETA, OTRO)' })
    metodoPago?: MetodoPago;

    @IsOptional()
    @IsDateString({}, { message: 'La fecha debe ser válida (YYYY-MM-DD)' })
    fecha?: string;

    @IsOptional()
    @IsString()
    nota?: string;
}
