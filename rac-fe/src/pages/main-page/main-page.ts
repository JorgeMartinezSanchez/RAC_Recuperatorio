// src/pages/main-page/main-page.ts
import './main-page.css';
import { bookingApi } from '../../entity/booking/api/booking-api';
import { roomApi } from '../../entity/room/api/room-api';
import { guestsApi } from '../../entity/guest/api/guest-api';
import type { BookingResponseDTO } from '../../entity/booking/model/booking-dtos';
import type { RoomResponseDTO } from '../../entity/room/model/room-dtos';
import type { GuestResponseDTO } from '../../entity/guest/model/guest-dtos';

export class MainPage extends HTMLElement {
    private bookings: BookingResponseDTO[] = [];
    private rooms: RoomResponseDTO[] = [];
    private guests: GuestResponseDTO[] = [];

    constructor() {
        super();
    }

    async connectedCallback() {
        console.log('📊 MainPage loaded');
        await this.loadData();
        this.render();
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
            activeBookings: this.bookings.filter(b => b.status === 'Active').length,
            availableRooms: this.rooms.filter(r => !r.occupied).length,
            totalGuests: this.guests.length,
            totalRevenue: this.bookings.reduce((sum, b) => sum + b.total, 0)
        };
        
        this.innerHTML = `
            <div class="dashboard">
                <div class="dashboard__header">
                    <h1 class="dashboard__title">Dashboard</h1>
                    <div class="dashboard__actions">
                        <a href="/create-booking" data-link class="dashboard__create-btn">+ New Booking</a>
                        <button class="dashboard__refresh-btn" data-action="refresh">Refresh</button>
                    </div>
                </div>
                
                <div class="dashboard__stats">
                    <div class="stat-card">
                        <div class="stat-card__value">${stats.totalBookings}</div>
                        <div class="stat-card__label">Total Bookings</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card__value">${stats.activeBookings}</div>
                        <div class="stat-card__label">Active Bookings</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card__value">${stats.availableRooms}</div>
                        <div class="stat-card__label">Available Rooms</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card__value">${stats.totalGuests}</div>
                        <div class="stat-card__label">Total Guests</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card__value">$${stats.totalRevenue}</div>
                        <div class="stat-card__label">Total Revenue</div>
                    </div>
                </div>
                
                <div class="dashboard__grid">
                    <div class="dashboard__section">
                        <h2 class="section-title">Recent Bookings</h2>
                        <div class="bookings-list">
                            ${this.bookings.slice(0, 5).map(booking => `
                                <booking-card data-booking-id="${booking.id}"></booking-card>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="dashboard__section">
                        <h2 class="section-title">Available Rooms</h2>
                        <div class="rooms-grid">
                            ${this.rooms.filter(r => !r.occupied).map(room => `
                                <room-card data-room-number="${room.roomNumber}"></room-card>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="dashboard__section">
                        <h2 class="section-title">Recent Guests</h2>
                        <div class="guests-list">
                            ${this.guests.slice(0, 5).map(guest => `
                                <guest-card data-guest-id="${guest.id}"></guest-card>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.attachEventListeners();
    }
    
    private attachEventListeners() {
        const refreshBtn = this.querySelector('[data-action="refresh"]');
        if (refreshBtn) {
            refreshBtn.removeEventListener('click', this.handleRefresh);
            refreshBtn.addEventListener('click', this.handleRefresh.bind(this));
        }
    }
    
    private async handleRefresh() {
        await this.loadData();
        this.render();
    }
}

customElements.define('main-page', MainPage);