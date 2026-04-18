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
import '../../entity/guest/ui/create-guest-form/create-guest-form';
import '../../entity/room/ui/room-card/room-card';

export class CreateBookingPage extends HTMLElement {
    private compiledTemplate: HandlebarsTemplateDelegate;
    private guestModal: HTMLElement | null = null;
    private rooms: RoomResponseDTO[] = [];
    private guests: GuestResponseDTO[] = [];
    private selectedRoomId: number | null = null;
    private selectedGuestIds: number[] = [];
    private startDateValue: string = '';
    private endDateValue: string = '';

    constructor() {
        super();
        this.compiledTemplate = Handlebars.compile(templateSource);
        // Bind de métodos
        this.handleRoomSelection = this.handleRoomSelection.bind(this);
        this.handleSubmitBooking = this.handleSubmitBooking.bind(this);
        this.handleCancelBooking = this.handleCancelBooking.bind(this);
        this.handleGuestCheckboxChange = this.handleGuestCheckboxChange.bind(this);
        this.handleRemoveGuest = this.handleRemoveGuest.bind(this);
        this.openGuestModal = this.openGuestModal.bind(this);
        this.closeGuestModal = this.closeGuestModal.bind(this);
        this.handleGuestCreatedEvent = this.handleGuestCreatedEvent.bind(this);
        this.handleStartDateChange = this.handleStartDateChange.bind(this);
        this.handleEndDateChange = this.handleEndDateChange.bind(this);
    }

    async connectedCallback() {
        await this.loadData();
        this.render();
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
        
        // Inicializar todo después del render
        this.initializeRoomCards();
        this.initializeGuestCards();
        this.restoreDateValues();
        this.attachEventListeners();
        this.updateTotalPriceDisplay();
    }

    private restoreDateValues() {
        const startDateInput = this.querySelector('#startDate') as HTMLInputElement;
        const endDateInput = this.querySelector('#endDate') as HTMLInputElement;
        
        if (startDateInput && this.startDateValue) {
            startDateInput.value = this.startDateValue;
        }
        if (endDateInput && this.endDateValue) {
            endDateInput.value = this.endDateValue;
        }
        
        // Actualizar contador de noches
        if (this.startDateValue && this.endDateValue) {
            const nights = calculateNights(this.startDateValue, this.endDateValue);
            const nightsDisplay = this.querySelector('.create-booking__nights-count');
            if (nightsDisplay) {
                nightsDisplay.textContent = nights.toString();
            }
        }
    }

    private initializeRoomCards() {
        const placeholders = this.querySelectorAll('.room-card-placeholder');
        placeholders.forEach(placeholder => {
            const roomId = placeholder.getAttribute('data-room-id');
            const roomNumber = placeholder.getAttribute('data-room-number');
            
            if (roomId && !placeholder.hasChildNodes()) {
                const room = this.rooms.find(r => r.id === parseInt(roomId));
                if (room) {
                    const roomCard = document.createElement('room-card');
                    roomCard.setAttribute('data-room-id', roomId);
                    roomCard.setAttribute('data-room-number', roomNumber || '');
                    (roomCard as any).setData(room);
                    placeholder.appendChild(roomCard);
                }
            }
        });
    }

    private initializeGuestCards() {
        const guestCards = this.querySelectorAll('guest-card');
        guestCards.forEach(card => {
            const guestId = card.getAttribute('data-guest-id');
            if (guestId && !card.hasAttribute('data-populated')) {
                const guest = this.guests.find(g => g.id === parseInt(guestId));
                if (guest && (card as any).setData) {
                    (card as any).setData(guest);
                    card.setAttribute('data-populated', 'true');
                }
            }
        });
    }

    private attachEventListeners() {
        // IMPORTANTE: Usar event delegation para la selección de habitaciones
        const roomsGrid = this.querySelector('#roomsGrid');
        if (roomsGrid) {
            // Remover listener anterior si existe
            roomsGrid.removeEventListener('click', this.handleRoomSelection);
            roomsGrid.addEventListener('click', this.handleRoomSelection);
        }

        // Checkboxes de huéspedes
        const guestCheckboxes = this.querySelectorAll('.create-booking__guest-checkbox input');
        guestCheckboxes.forEach(checkbox => {
            checkbox.removeEventListener('change', this.handleGuestCheckboxChange);
            checkbox.addEventListener('change', this.handleGuestCheckboxChange);
        });

        // Botón submit
        const submitBtn = this.querySelector('[data-action="submit-booking"]');
        if (submitBtn) {
            submitBtn.removeEventListener('click', this.handleSubmitBooking);
            submitBtn.addEventListener('click', this.handleSubmitBooking);
        }

        // Botón cancelar
        const cancelBtn = this.querySelector('[data-action="cancel-booking"]');
        if (cancelBtn) {
            cancelBtn.removeEventListener('click', this.handleCancelBooking);
            cancelBtn.addEventListener('click', this.handleCancelBooking);
        }

        // Inputs de fecha
        const startDateInput = this.querySelector('#startDate') as HTMLInputElement;
        const endDateInput = this.querySelector('#endDate') as HTMLInputElement;
        
        if (startDateInput) {
            startDateInput.removeEventListener('change', this.handleStartDateChange);
            startDateInput.addEventListener('change', this.handleStartDateChange);
        }
        
        if (endDateInput) {
            endDateInput.removeEventListener('change', this.handleEndDateChange);
            endDateInput.addEventListener('change', this.handleEndDateChange);
        }

        // Modal
        const openModalBtn = this.querySelector('[data-action="open-guest-modal"]');
        if (openModalBtn) {
            openModalBtn.removeEventListener('click', this.openGuestModal);
            openModalBtn.addEventListener('click', this.openGuestModal);
        }

        const closeModalBtns = this.querySelectorAll('[data-action="close-modal"]');
        closeModalBtns.forEach(btn => {
            btn.removeEventListener('click', this.closeGuestModal);
            btn.addEventListener('click', this.closeGuestModal);
        });

        // Evento de guest creado
        const createGuestForm = this.querySelector('create-guest-form');
        if (createGuestForm) {
            createGuestForm.removeEventListener('guest-created', this.handleGuestCreatedEvent);
            createGuestForm.addEventListener('guest-created', this.handleGuestCreatedEvent);
        }

        // Botones de remover guest
        const removeGuestBtns = this.querySelectorAll('[data-remove-guest]');
        removeGuestBtns.forEach(btn => {
            btn.removeEventListener('click', this.handleRemoveGuest);
            btn.addEventListener('click', this.handleRemoveGuest);
        });
    }

    private handleStartDateChange(event: Event) {
        const input = event.target as HTMLInputElement;
        this.startDateValue = input.value;
        this.updateNightsAndPrice();
    }

    private handleEndDateChange(event: Event) {
        const input = event.target as HTMLInputElement;
        this.endDateValue = input.value;
        this.updateNightsAndPrice();
    }

    private updateNightsAndPrice() {
        if (this.startDateValue && this.endDateValue) {
            const nights = calculateNights(this.startDateValue, this.endDateValue);
            const nightsDisplay = this.querySelector('.create-booking__nights-count');
            if (nightsDisplay) {
                nightsDisplay.textContent = nights.toString();
            }
            this.updateTotalPriceDisplay();
        }
    }

    private handleRoomSelection(event: Event) {
        const target = event.target as HTMLElement;
        // Buscar el contenedor de la habitación (el div con data-room-id)
        const roomContainer = target.closest('[data-room-id]');
        
        if (roomContainer) {
            const roomId = parseInt(roomContainer.getAttribute('data-room-id') || '0');
            if (roomId && !isNaN(roomId)) {
                // Toggle selection
                if (this.selectedRoomId === roomId) {
                    this.selectedRoomId = null;
                } else {
                    this.selectedRoomId = roomId;
                }
                // Re-renderizar
                this.render();
            }
        }
    }

    private handleGuestCheckboxChange(event: Event) {
        const input = event.target as HTMLInputElement;
        const guestId = parseInt(input.value);
        
        if (input.checked) {
            if (!this.selectedGuestIds.includes(guestId)) {
                this.selectedGuestIds.push(guestId);
            }
        } else {
            this.selectedGuestIds = this.selectedGuestIds.filter(id => id !== guestId);
        }
        this.render();
    }

    private updateTotalPriceDisplay() {
        if (this.startDateValue && this.endDateValue && this.selectedRoomId) {
            const nights = calculateNights(this.startDateValue, this.endDateValue);
            const selectedRoom = this.rooms.find(r => r.id === this.selectedRoomId);
            if (selectedRoom) {
                const total = selectedRoom.price * nights;
                const totalDisplay = this.querySelector('.create-booking__total-price');
                if (totalDisplay) {
                    totalDisplay.textContent = total.toFixed(2);
                }
            }
        }
    }

    private async handleSubmitBooking() {
        if (!this.selectedRoomId) {
            this.showError('Please select a room');
            return;
        }

        if (!this.startDateValue || !this.endDateValue) {
            this.showError('Please select check-in and check-out dates');
            return;
        }

        if (!isValidDateRange(this.startDateValue, this.endDateValue)) {
            this.showError('Check-out date must be after check-in date');
            return;
        }

        const bookingData: BookingRequestDTO = {
            roomId: this.selectedRoomId,
            startDate: formatToDDMMYYYY(this.startDateValue),
            endDate: formatToDDMMYYYY(this.endDateValue),
            guestIds: this.selectedGuestIds
        };

        try {
            this.showLoading(true);
            await bookingApi.createBooking(bookingData);
            this.showSuccess('Booking created successfully!');
            
            setTimeout(() => {
                window.history.pushState({}, "", "/");
                window.dispatchEvent(new PopStateEvent('popstate'));
            }, 2000);
            
        } catch (error) {
            console.error('Error creating booking:', error);
            this.showError(`Failed to create booking: ${error}`);
        } finally {
            this.showLoading(false);
        }
    }

    private handleCancelBooking() {
        this.selectedRoomId = null;
        this.selectedGuestIds = [];
        this.startDateValue = '';
        this.endDateValue = '';
        this.render();
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

    private handleGuestCreatedEvent(event: Event) {
        const customEvent = event as CustomEvent;
        const newGuest = customEvent.detail.guest as GuestResponseDTO;
        this.handleGuestCreated(newGuest);
    }

    private async handleGuestCreated(newGuest: GuestResponseDTO) {
        this.closeGuestModal();
        await this.loadData();
        
        if (!this.selectedGuestIds.includes(newGuest.id)) {
            this.selectedGuestIds.push(newGuest.id);
        }
        
        this.render();
        this.showSuccess(`Guest ${newGuest.firstName} ${newGuest.lastName} added and selected!`);
    }

    private handleRemoveGuest(event: Event) {
        const button = event.currentTarget as HTMLButtonElement;
        const guestId = parseInt(button.getAttribute('data-remove-guest') || '0');
        
        this.selectedGuestIds = this.selectedGuestIds.filter(id => id !== guestId);
        this.render();
    }
}

customElements.define('create-booking-page', CreateBookingPage);