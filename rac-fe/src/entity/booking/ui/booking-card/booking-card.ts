// src/entity/booking/ui/booking-card/booking-card.ts
import Handlebars from "handlebars";
import templateSource from './booking-card.hbs?raw';
import './booking-card.css';
import type { BookingResponseDTO } from '../../model/booking-dtos';

export class BookingCard extends HTMLElement {
    private compiledTemplate: HandlebarsTemplateDelegate;
    private bookingData: BookingResponseDTO | null = null;

    constructor() {
        super();
        this.compiledTemplate = Handlebars.compile(templateSource);
    }

    set data(booking: BookingResponseDTO) {
        this.bookingData = booking;
        this.render();
    }

    private render() {
        if (!this.bookingData) return;
        
        this.innerHTML = this.compiledTemplate({
            id: this.bookingData.id,
            roomNumber: this.bookingData.roomNumber,
            roomTypeName: this.bookingData.roomTypeName,
            startDate: this.bookingData.startDate,
            endDate: this.bookingData.endDate,
            status: this.bookingData.status,
            total: this.bookingData.total,
            statusClass: this.getStatusClass(this.bookingData.status)
        });
    }

    private getStatusClass(status: string): string {
        const statusMap: Record<string, string> = {
            'Active': 'booking-card__status--active',
            'Completed': 'booking-card__status--completed',
            'Cancelled': 'booking-card__status--cancelled',
            'Pending': 'booking-card__status--pending'
        };
        return statusMap[status] || 'booking-card__status--default';
    }

    connectedCallback() {
        const bookingId = this.getAttribute('data-booking-id');
        if (bookingId) {
            // Cargar datos desde API si se proporciona ID
            this.loadBookingData(Number(bookingId));
        }
    }

    private async loadBookingData(id: number) {
        // Import dinámico para evitar dependencia circular
        const { bookingApi } = await import('../../api/booking-api');
        try {
            const bookings = await bookingApi.getAllBookings();
            const booking = bookings.find(b => b.id === id);
            if (booking) {
                this.data = booking;
            }
        } catch (error) {
            console.error('Error loading booking:', error);
        }
    }
}

customElements.define("booking-card", BookingCard);