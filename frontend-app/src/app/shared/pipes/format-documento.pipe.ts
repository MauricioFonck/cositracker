import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'formatDocumento',
    standalone: true
})
export class FormatDocumentoPipe implements PipeTransform {
    transform(value: string | null | undefined): string {
        if (!value) return '';

        // Si es numérico largo, agregar puntos de miles para legibilidad
        // Pero documento no es moneda, a veces se formatea así en colombia (C.C. 1.234.567)
        // O simplemente dejarlo limpio
        const clean = value.replace(/\D/g, '');

        // Si tiene longitud típica de CC (7-10 dígitos), formatear con puntos
        if (clean.length >= 7 && clean.length <= 10) {
            return new Intl.NumberFormat('es-CO').format(Number(clean));
        }

        return value;
    }
}
