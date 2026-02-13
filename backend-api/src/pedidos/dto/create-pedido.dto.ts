import { IsNotEmpty, IsString, IsNumber, Min, IsOptional, IsDateString, IsUUID } from 'class-validator';

export class CreatePedidoDto {
    @IsNotEmpty({ message: 'El cliente es obligatorio' })
    @IsUUID('4', { message: 'El ID del cliente debe ser un UUID válido' })
    clienteId: string;

    @IsNotEmpty({ message: 'El tipo de trabajo es obligatorio' })
    @IsString()
    tipoTrabajo: string;

    @IsNotEmpty({ message: 'La descripción es obligatoria' })
    @IsString()
    descripcion: string;

    @IsNotEmpty({ message: 'El precio total es obligatorio' })
    @IsNumber({}, { message: 'El precio total debe ser un número' })
    @Min(0, { message: 'El precio total no puede ser negativo' })
    precioTotal: number;

    @IsOptional()
    @IsDateString({}, { message: 'La fecha de entrega debe ser una fecha válida (YYYY-MM-DD)' })
    fechaEntrega?: string;

    @IsOptional()
    @IsString()
    notas?: string;
}
