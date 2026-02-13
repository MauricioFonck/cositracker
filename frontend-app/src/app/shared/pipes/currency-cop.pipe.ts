import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'currencyCop',
    standalone: true
})
export class CurrencyCopPipe implements PipeTransform {
    transform(value: number | string | null | undefined): string {
        if (value === null || value === undefined) return '';

        const numValue = Number(value);
        if (isNaN(numValue)) return String(value);

        // Formatear como moneda colombiana: $ 1.234.567
        // Usamos 'es-CO' para locale, currency 'COP', y symbol '$'
        // maximumFractionDigits: 0 por defecto para COP suele ser común
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0,
            minimumFractionDigits: 0
        }).format(numValue);
    }
}
