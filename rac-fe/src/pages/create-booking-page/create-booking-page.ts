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
import { formatToDDMMYYYY, isValidDateRange, calculateNights } from '../../shared/utils/date-utils';

// Importar componentes
import '../../app/handlebars-helper';
import '../../entity/guest/ui/create-guest-form/create-guest-form'; // ← Importar el componente

export class CreateBookingPage extends HTMLElement {
    private compiledTemplate: HandlebarsTemplateDelegate;
    private guestModal: HTMLElement | null = null;
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
        
        // Después de renderizar, pasar los datos a los componentes room-card
        this.passDataToComponents();
    }

    private passDataToComponents() {
        // Pasar datos a las room cards
        const roomCards = this.querySelectorAll('room-card');
        roomCards.forEach(card => {
            const roomId = card.getAttribute('data-room-id');
            if (roomId && !card.hasAttribute('data-populated')) {
                const room = this.rooms.find(r => r.id === parseInt(roomId));
                if (room && (card as any).setData) {
                    (card as any).setData(room);
                    card.setAttribute('data-populated', 'true');
                }
            }
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

        // Botón para abrir modal de guest
        const openModalBtn = this.querySelector('[data-action="open-guest-modal"]');
        if (openModalBtn) {
            openModalBtn.removeEventListener('click', this.openGuestModal);
            openModalBtn.addEventListener('click', this.openGuestModal.bind(this));
        }

        // Botones para cerrar modal
        const closeModalBtns = this.querySelectorAll('[data-action="close-modal"]');
        closeModalBtns.forEach(btn => {
            btn.removeEventListener('click', this.closeGuestModal);
            btn.addEventListener('click', this.closeGuestModal.bind(this));
        });

        // Escuchar evento de guest creado
        const createGuestCard = this.querySelector('create-guest-form');
        if (createGuestCard) {
            createGuestCard.removeEventListener('guest-created', this.handleGuestCreated);
            createGuestCard.addEventListener('guest-created', this.handleGuestCreated.bind(this));
        }

        // Botones para remover guest seleccionado
        const removeGuestBtns = this.querySelectorAll('[data-remove-guest]');
        removeGuestBtns.forEach(btn => {
            btn.removeEventListener('click', this.handleRemoveGuest);
            btn.addEventListener('click', this.handleRemoveGuest.bind(this));
        });
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
        const startDateRaw = (this.querySelector('#startDate') as HTMLInputElement)?.value;
        const endDateRaw = (this.querySelector('#endDate') as HTMLInputElement)?.value;
        
        if (startDateRaw && endDateRaw) {
            const nights = calculateNights(startDateRaw, endDateRaw);
            const nightsDisplay = this.querySelector('.create-booking__nights-count');
            if (nightsDisplay) {
                nightsDisplay.textContent = nights.toString();
            }
            
            if (this.selectedRoomId) {
                this.updateTotalPrice(nights);
            }
        }
    }

    /*private calculateNights(startDate: string, endDate: string): number {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }*/

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
        const startDateRaw = (this.querySelector('#startDate') as HTMLInputElement)?.value;
        const endDateRaw = (this.querySelector('#endDate') as HTMLInputElement)?.value;

        if (!this.selectedRoomId) {
            this.showError('Please select a room');
            return;
        }

        if (!startDateRaw || !endDateRaw) {
            this.showError('Please select check-in and check-out dates');
            return;
        }

        if (!isValidDateRange(startDateRaw, endDateRaw)) {
            this.showError('Check-out date must be after check-in date');
            return;
        }

        const start = new Date(startDateRaw);
        const end = new Date(endDateRaw);
        
        if (start >= end) {
            this.showError('Check-out date must be after check-in date');
            return;
        }

        const bookingData: BookingRequestDTO = {
            roomId: this.selectedRoomId,
            startDate: formatToDDMMYYYY(startDateRaw),
            endDate: formatToDDMMYYYY(endDateRaw),
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

    private openGuestModal() {
        this.guestModal = this.querySelector('#guestModal');
        if (this.guestModal) {
            this.guestModal.style.display = 'flex';
        }
    }

    private closeGuestModal() {
        if (this.guestModal) {
            this.guestModal.style.display = 'none';
        }
    }

    private async handleGuestCreated(event: CustomEvent) {
        const newGuest = event.detail.guest as GuestResponseDTO;
        
        // Cerrar el modal
        this.closeGuestModal();
        
        // Actualizar la lista de huéspedes
        await this.loadData();
        
        // Re-renderizar
        this.render();
        
        // Auto-seleccionar el nuevo huésped
        if (!this.selectedGuestIds.includes(newGuest.id)) {
            this.selectedGuestIds.push(newGuest.id);
        }
        
        // Re-renderizar con la selección actualizada
        this.render();
        this.attachEventListeners();
        
        // Mostrar mensaje de éxito
        this.showSuccess(`Guest ${newGuest.firstName} ${newGuest.lastName} added and selected!`);
    }

    private handleRemoveGuest(event: Event) {
        const button = event.currentTarget as HTMLButtonElement;
        const guestId = parseInt(button.getAttribute('data-remove-guest') || '0');
        
        this.selectedGuestIds = this.selectedGuestIds.filter(id => id !== guestId);
        
        this.render();
        this.attachEventListeners();
    }

    // Asegúrate de que el modal se cierre al hacer clic fuera
    private handleModalBackdropClick(event: Event) {
        const target = event.target as HTMLElement;
        if (target.classList.contains('create-booking__modal-backdrop')) {
            this.closeGuestModal();
        }
    }
}

customElements.define('create-booking-page', CreateBookingPage);