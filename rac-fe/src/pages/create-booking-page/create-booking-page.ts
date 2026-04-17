// src/pages/create-booking-page/create-booking-page.ts
import Handlebars from "handlebars";
import templateSource from './create-booking-page.hbs?raw';
import './create-booking-page.css';
import { bookingApi } from '../../entity/booking/api/booking-api';
import { roomApi } from '../../entity/room/api/room-api';
import { guestsApi } from '../../entity/guest/api/guest-api';
import type { BookingRequestDTO } from '../../entity/booking/model/booking-dtos';
import type { RoomResponseDTO } from '../../entity/room/model/room-dtos';
import type { GuestResponseDTO } from '../../entity/guest/model/guest-dtos';

// Importar helpers de Handlebars
import '../../app/handlebars-helper';

export class CreateBookingPage extends HTMLElement {
    private compiledTemplate: HandlebarsTemplateDelegate;
    private rooms: RoomResponseDTO[] = [];
    private guests: GuestResponseDTO[] = [];
    private selectedRoomId: number | null = null;
    private selectedGuestIds: number[] = [];

    constructor() {
        super();
        this.compiledTemplate = Handlebars.compile(templateSource);
    }

    async connectedCallback() {
        await this.loadData();
        this.render();
        this.attachEventListeners();
    }

    private async loadData() {
        try {
            const [rooms, guests] = await Promise.all([
                roomApi.getAllRooms(),
                guestsApi.getAllGuests()
            ]);
            this.rooms = rooms;
            this.guests = guests;
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    private render() {
        this.innerHTML = this.compiledTemplate({
            rooms: this.rooms,
            guests: this.guests,
            selectedRoomId: this.selectedRoomId,
            selectedGuestIds: this.selectedGuestIds
        });
    }

    private attachEventListeners() {
        // Selección de habitación
        const roomCards = this.querySelectorAll('[data-room-id]');
        roomCards.forEach(card => {
            card.addEventListener('click', () => {
                const roomId = parseInt(card.getAttribute('data-room-id') || '0');
                this.toggleRoomSelection(roomId);
            });
        });

        // Selección de huéspedes
        const guestCheckboxes = this.querySelectorAll('.create-booking__guest-checkbox input');
        guestCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const input = e.target as HTMLInputElement;
                const guestId = parseInt(input.value);
                this.toggleGuestSelection(guestId, input.checked);
            });
        });

        // Botón submit
        const submitBtn = this.querySelector('[data-action="submit-booking"]');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitBooking());
        }

        // Botón cancelar
        const cancelBtn = this.querySelector('[data-action="cancel-booking"]');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.resetForm());
        }

        // Fechas
        const startDateInput = this.querySelector('#startDate') as HTMLInputElement;
        const endDateInput = this.querySelector('#endDate') as HTMLInputElement;
        
        if (startDateInput) {
            startDateInput.addEventListener('change', () => this.updateDateRange());
        }
        
        if (endDateInput) {
            endDateInput.addEventListener('change', () => this.updateDateRange());
        }
    }

    private toggleRoomSelection(roomId: number) {
        if (this.selectedRoomId === roomId) {
            this.selectedRoomId = null;
        } else {
            this.selectedRoomId = roomId;
        }
        this.render();
        this.attachEventListeners();
    }

    private toggleGuestSelection(guestId: number, isSelected: boolean) {
        if (isSelected) {
            if (!this.selectedGuestIds.includes(guestId)) {
                this.selectedGuestIds.push(guestId);
            }
        } else {
            this.selectedGuestIds = this.selectedGuestIds.filter(id => id !== guestId);
        }
        this.render();
        this.attachEventListeners();
    }

    private updateDateRange() {
        const startDate = (this.querySelector('#startDate') as HTMLInputElement)?.value;
        const endDate = (this.querySelector('#endDate') as HTMLInputElement)?.value;
        
        if (startDate && endDate) {
            const nights = this.calculateNights(startDate, endDate);
            const nightsDisplay = this.querySelector('.create-booking__nights-count');
            if (nightsDisplay) {
                nightsDisplay.textContent = nights.toString();
            }
            
            if (this.selectedRoomId) {
                this.updateTotalPrice(nights);
            }
        }
    }

    private calculateNights(startDate: string, endDate: string): number {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    private updateTotalPrice(nights: number) {
        const selectedRoom = this.rooms.find(r => r.id === this.selectedRoomId);
        if (selectedRoom) {
            const total = selectedRoom.price * nights;
            const totalDisplay = this.querySelector('.create-booking__total-price');
            if (totalDisplay) {
                totalDisplay.textContent = total.toFixed(2);
            }
        }
    }

    private async submitBooking() {
        const startDate = (this.querySelector('#startDate') as HTMLInputElement)?.value;
        const endDate = (this.querySelector('#endDate') as HTMLInputElement)?.value;

        if (!this.selectedRoomId) {
            this.showError('Please select a room');
            return;
        }

        if (!startDate || !endDate) {
            this.showError('Please select check-in and check-out dates');
            return;
        }

        if (this.selectedGuestIds.length === 0) {
            this.showError('Please select at least one guest');
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (start >= end) {
            this.showError('Check-out date must be after check-in date');
            return;
        }

        const bookingData: BookingRequestDTO = {
            roomId: this.selectedRoomId,
            startDate: startDate,
            endDate: endDate,
            guestIds: this.selectedGuestIds
        };

        try {
            this.showLoading(true);
            await bookingApi.createBooking(bookingData);
            this.showSuccess('Booking created successfully!');
            
            setTimeout(() => {
                // Navegar al dashboard
                window.history.pushState({}, "", "/");
                window.dispatchEvent(new PopStateEvent('popstate'));
            }, 2000);
            
        } catch (error) {
            console.error('Error creating booking:', error);
            this.showError('Failed to create booking. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    private showError(message: string) {
        const errorDiv = this.querySelector('.create-booking__error');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.classList.add('create-booking__error--visible');
            setTimeout(() => {
                errorDiv.classList.remove('create-booking__error--visible');
            }, 3000);
        }
    }

    private showSuccess(message: string) {
        const successDiv = this.querySelector('.create-booking__success');
        if (successDiv) {
            successDiv.textContent = message;
            successDiv.classList.add('create-booking__success--visible');
            setTimeout(() => {
                successDiv.classList.remove('create-booking__success--visible');
            }, 2000);
        }
    }

    private showLoading(show: boolean) {
        const loadingOverlay = this.querySelector('.create-booking__loading');
        if (loadingOverlay) {
            if (show) {
                loadingOverlay.classList.add('create-booking__loading--active');
            } else {
                loadingOverlay.classList.remove('create-booking__loading--active');
            }
        }
    }

    private resetForm() {
        this.selectedRoomId = null;
        this.selectedGuestIds = [];
        this.render();
        this.attachEventListeners();
    }
}

customElements.define('create-booking-page', CreateBookingPage);