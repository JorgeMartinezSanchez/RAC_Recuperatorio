// src/app/handlebars-helper.ts
import Handlebars from 'handlebars';

// Helper para comparar igualdad
Handlebars.registerHelper('eq', function(a: any, b: any) {
    return a === b;
});

// Helper para verificar si un array incluye un valor
Handlebars.registerHelper('includes', function(array: any[], value: any) {
    return array && array.includes(value);
});

// Helper para lookup en arrays
Handlebars.registerHelper('lookup', function(obj: any, prop: string) {
    return obj?.[prop];
});

Handlebars.registerHelper('json', function(context) {
    return JSON.stringify(context);
});

console.log('✅ Handlebars helpers registered');