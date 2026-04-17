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
        this.attachEventListeners();
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

    private attachEventListeners() {
        // Buscar los botones dentro del componente
        const checkInBtn = this.querySelector('.booking-card__set-as-active');
        const cancelBtn = this.querySelector('.booking-card__cancel-booking');
        const finishedBtn = this.querySelector('.booking-card__set-as-finished');
        
        // Solo agregar los event listeners, sin remover
        if (checkInBtn && !checkInBtn.hasAttribute('data-listener-attached')) {
            checkInBtn.addEventListener('click', (e) => this.handleEvent(e, 'check-in'));
            checkInBtn.setAttribute('data-listener-attached', 'true');
        }

        if (cancelBtn && !cancelBtn.hasAttribute('data-listener-attached')) {
            cancelBtn.addEventListener('click', (e) => this.handleEvent(e, 'cancel'));
            cancelBtn.setAttribute('data-listener-attached', 'true');
        }

        if (finishedBtn && !finishedBtn.hasAttribute('data-listener-attached')) {
            finishedBtn.addEventListener('click', (e) => this.handleEvent(e, 'check-out'));
            finishedBtn.setAttribute('data-listener-attached', 'true');
        }
    }

    private handleEvent = async (event: Event, action: 'check-in' | 'cancel' | 'check-out') => {
        event.preventDefault();
        event.stopPropagation();
        
        if (!this.bookingData) return;
        
        const button = event.currentTarget as HTMLButtonElement;
        const originalText = button.textContent;
        button.textContent = 'Processing...';
        button.disabled = true;
        
        try {
            const { bookingApi } = await import('../../api/booking-api');
            let updatedBooking;
            
            switch (action) {
                case 'check-in':
                    updatedBooking = await bookingApi.checkIn(this.bookingData.id);
                    break;
                case 'cancel':
                    updatedBooking = await bookingApi.cancel(this.bookingData.id);
                    break;
                case 'check-out':
                    updatedBooking = await bookingApi.checkOut(this.bookingData.id);
                    break;
                default:
                    throw new Error(`Unknown action: ${action}`);
            }
            
            this.data = updatedBooking;
            
            // Disparar evento personalizado
            this.dispatchEvent(new CustomEvent(`booking-${action}`, {
                detail: { booking: updatedBooking },
                bubbles: true
            }));
            
        } catch (error) {
            console.error(`Error during ${action}:`, error);
            this.showError(`Failed to ${action}. Please try again.`);
            button.textContent = originalText;
            button.disabled = false;
        }
    }
    private getStatusClass(status: string): string {
        const statusMap: Record<string, string> = {
            'active': 'booking-card__status--active',
            'finished': 'booking-card__status--completed',
            'cancelled': 'booking-card__status--cancelled',
            'pending': 'booking-card__status--pending'
        };
        // Normalizar status a minúsculas
        return statusMap[status.toLowerCase()] || 'booking-card__status--default';
    }

    private showError(message: string) {
        // Implementar visualización de error
        console.error(message);
        // Podrías mostrar un tooltip o agregar una clase de error temporal
        const button = this.querySelector('.booking-card__set-as-active');
        if (button) {
            const originalText = button.textContent;
            button.textContent = 'Error!';
            setTimeout(() => {
                button.textContent = originalText;
            }, 2000);
        }
    }

    connectedCallback() {
        const bookingId = this.getAttribute('data-booking-id');
        if (bookingId) {
            this.loadBookingData(Number(bookingId));
        }
    }

    private async loadBookingData(id: number) {
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