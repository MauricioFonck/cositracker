import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function onlyNumbersValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value;
        if (!value) return null;

        const valid = /^\d+$/.test(value);
        return valid ? null : { onlyNumbers: { value: control.value } };
    };
}

export function colombianPhoneValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value;
        if (!value) return null;

        // Celulares en Colombia empiezan con 3 y tienen 10 dígitos
        const valid = /^3\d{9}$/.test(value);
        return valid ? null : { colombianPhone: { value: control.value } };
    };
}
