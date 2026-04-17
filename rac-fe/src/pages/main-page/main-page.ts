// src/pages/main-page/main-page.ts
import Handlebars from 'handlebars';
import templateSource from './main-page.hbs?raw';
import './main-page.css';
import { bookingApi } from '../../entity/booking/api/booking-api';
import { roomApi } from '../../entity/room/api/room-api';
import { guestsApi } from '../../entity/guest/api/guest-api';
import type { BookingResponseDTO } from '../../entity/booking/model/booking-dtos';
import type { RoomResponseDTO } from '../../entity/room/model/room-dtos';
import type { GuestResponseDTO } from '../../entity/guest/model/guest-dtos';

// Importar componentes (necesarios para que se registren)
import '../../entity/booking/ui/booking-card/booking-card';
import '../../entity/room/ui/room-card/room-card';
import '../../entity/guest/ui/guest-card/guest-card';

export class MainPage extends HTMLElement {
    private compiledTemplate: HandlebarsTemplateDelegate;
    private bookings: BookingResponseDTO[] = [];
    private rooms: RoomResponseDTO[] = [];
    private guests: GuestResponseDTO[] = [];

    constructor() {
        super();
        this.compiledTemplate = Handlebars.compile(templateSource);
        // Bind de los métodos
        this.handleBookingEvent = this.handleBookingEvent.bind(this);
    }

    async connectedCallback() {
        console.log('📊 MainPage loaded');
        await this.loadData();
        this.render();
        this.attachEventListeners();
        this.attachBookingEventListeners();
    }

    private async loadData() {
        try {
            [this.bookings, this.rooms, this.guests] = await Promise.all([
                bookingApi.getAllBookings(),
                roomApi.getAllRooms(),
                guestsApi.getAllGuests()
            ]);
            console.log(`📊 Loaded: ${this.bookings.length} bookings, ${this.rooms.length} rooms, ${this.guests.length} guests`);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    private render() {
        const stats = {
            totalBookings: this.bookings.length,
            activeBookings: this.bookings.filter(b => b.status === 'active').length,
            availableRooms: this.rooms.filter(r => !r.occupied).length,
            totalGuests: this.guests.length,
            totalRevenue: this.bookings.reduce((sum, b) => sum + b.total, 0)
        };

        const templateData = {
            stats,
            recentBookings: this.bookings.slice(0, 5),
            availableRooms: this.rooms.filter(r => !r.occupied).slice(0, 6),
            recentGuests: this.guests.slice(0, 5)
        };

        this.innerHTML = this.compiledTemplate(templateData);
    }

    private attachEventListeners() {
        const refreshBtn = this.querySelector('[data-action="refresh"]');
        if (refreshBtn) {
            refreshBtn.removeEventListener('click', this.handleRefresh);
            refreshBtn.addEventListener('click', this.handleRefresh.bind(this));
        }
    }

    private attachBookingEventListeners() {
        // Escuchar eventos de los booking-cards
        this.removeEventListener('booking-check-in', this.handleBookingEvent);
        this.removeEventListener('booking-cancel', this.handleBookingEvent);
        this.removeEventListener('booking-check-out', this.handleBookingEvent);
        
        this.addEventListener('booking-check-in', this.handleBookingEvent);
        this.addEventListener('booking-cancel', this.handleBookingEvent);
        this.addEventListener('booking-check-out', this.handleBookingEvent);
    }

    private async handleBookingEvent(event: Event) {
        const customEvent = event as CustomEvent;
        const action = event.type; // 'booking-check-in', 'booking-cancel', o 'booking-check-out'
        console.log(`🔄 Booking event received: ${action}`, customEvent.detail);
        
        // Mostrar feedback visual
        this.showToast(`Processing ${action}...`);
        
        // Recargar todos los datos
        await this.loadData();
        
        // Re-renderizar la página
        this.render();
        
        // Re-conectar event listeners después del re-render
        this.attachEventListeners();
        this.attachBookingEventListeners();
        
        // Mostrar mensaje de éxito
        this.showToast(`${action} completed successfully!`, 'success');
    }

    private async handleRefresh() {
        await this.loadData();
        this.render();
        this.attachEventListeners();
        this.attachBookingEventListeners();
    }

    private showToast(message: string, type: 'info' | 'success' | 'error' = 'info') {
        // Crear un toast temporal
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 24px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            border-radius: 8px;
            z-index: 9999;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

customElements.define('main-page', MainPage);