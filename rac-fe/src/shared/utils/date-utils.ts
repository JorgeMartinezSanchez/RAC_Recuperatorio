// src/shared/utils/date-utils.ts

/**
 * Convierte fecha de YYYY-MM-DD a DD/MM/YYYY
 */
export function formatToDDMMYYYY(dateString: string): string {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

/**
 * Convierte fecha de DD/MM/YYYY a YYYY-MM-DD (para inputs date)
 */
export function formatToYYYYMMDD(dateString: string): string {
    if (!dateString) return '';
    const [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
}

/**
 * Valida que endDate sea posterior a startDate
 */
export function isValidDateRange(startDate: string, endDate: string): boolean {
    if (!startDate || !endDate) return false;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return end > start;
}

/**
 * Calcula el número de noches entre dos fechas
 */
export function calculateNights(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}