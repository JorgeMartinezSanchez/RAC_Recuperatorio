// src/app/handlebars-helper.ts
import Handlebars from 'handlebars';

// Helper para comparar igualdad
Handlebars.registerHelper('eq', function(a: any, b: any): boolean {
    return a === b;
});

// Helper para verificar si un array incluye un valor
Handlebars.registerHelper('includes', function(array: any[], value: any): boolean {
    return array && array.includes(value);
});

// Helper para lookup en arrays
Handlebars.registerHelper('lookup', function(obj: any, prop: string): any {
    return obj?.[prop];
});

// Helper para convertir objeto a JSON string
Handlebars.registerHelper('json', function(context: any): Handlebars.SafeString {
    return new Handlebars.SafeString(JSON.stringify(context));
});

// Helper para comparar igualdad con bloque (if/else)
Handlebars.registerHelper('ifEquals', function(
    this: any,
    arg1: any, 
    arg2: any, 
    options: Handlebars.HelperOptions
): string {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

// Helper adicional: ifNotEquals (para claridad)
Handlebars.registerHelper('ifNotEquals', function(
    this: any,
    arg1: any, 
    arg2: any, 
    options: Handlebars.HelperOptions
): string {
    return (arg1 != arg2) ? options.fn(this) : options.inverse(this);
});

// Helper adicional: ifGreaterThan
Handlebars.registerHelper('ifGreaterThan', function(
    this: any,
    arg1: number, 
    arg2: number, 
    options: Handlebars.HelperOptions
): string {
    return (arg1 > arg2) ? options.fn(this) : options.inverse(this);
});

// Helper adicional: ifLessThan
Handlebars.registerHelper('ifLessThan', function(
    this: any,
    arg1: number, 
    arg2: number, 
    options: Handlebars.HelperOptions
): string {
    return (arg1 < arg2) ? options.fn(this) : options.inverse(this);
});

console.log('✅ Handlebars helpers registered');