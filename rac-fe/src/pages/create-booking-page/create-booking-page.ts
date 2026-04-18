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
        this.handleGuestCreatedEvent = this.handleGuestCreatedEvent.bind(this); // Nuevo método
        this.updateDateRange = this.updateDateRange.bind(this);
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
        
        // Después de renderizar, inicializar los componentes y datos
        this.initializeRoomCards();
        this.initializeGuestCards();
        this.updateTotalPriceDisplay();
    }

    private initializeRoomCards() {
        // Crear las room cards dentro de los placeholders
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
        // Asegurar que los guest cards tengan sus datos
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
        // Selección de habitación - usar el contenedor padre para event delegation
        const roomsGrid = this.querySelector('#roomsGrid');
        if (roomsGrid) {
            roomsGrid.removeEventListener('click', this.handleRoomSelection);
            roomsGrid.addEventListener('click', this.handleRoomSelection);
        }

        // Selección de huéspedes
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

        // Fechas
        const startDateInput = this.querySelector('#startDate') as HTMLInputElement;
        const endDateInput = this.querySelector('#endDate') as HTMLInputElement;
        
        if (startDateInput) {
            startDateInput.removeEventListener('change', this.updateDateRange);
            startDateInput.addEventListener('change', this.updateDateRange);
        }
        
        if (endDateInput) {
            endDateInput.removeEventListener('change', this.updateDateRange);
            endDateInput.addEventListener('change', this.updateDateRange);
        }

        // Botón para abrir modal de guest
        const openModalBtn = this.querySelector('[data-action="open-guest-modal"]');
        if (openModalBtn) {
            openModalBtn.removeEventListener('click', this.openGuestModal);
            openModalBtn.addEventListener('click', this.openGuestModal);
        }

        // Botones para cerrar modal
        const closeModalBtns = this.querySelectorAll('[data-action="close-modal"]');
        closeModalBtns.forEach(btn => {
            btn.removeEventListener('click', this.closeGuestModal);
            btn.addEventListener('click', this.closeGuestModal);
        });

        // Escuchar evento de guest creado - CORREGIDO
        const createGuestForm = this.querySelector('create-guest-form');
        if (createGuestForm) {
            createGuestForm.removeEventListener('guest-created', this.handleGuestCreatedEvent);
            createGuestForm.addEventListener('guest-created', this.handleGuestCreatedEvent);
        }

        // Botones para remover guest seleccionado
        const removeGuestBtns = this.querySelectorAll('[data-remove-guest]');
        removeGuestBtns.forEach(btn => {
            btn.removeEventListener('click', this.handleRemoveGuest);
            btn.addEventListener('click', this.handleRemoveGuest);
        });
    }

    private handleRoomSelection(event: Event) {
        const target = event.target as HTMLElement;
        // Buscar el contenedor de la habitación
        const roomCard = target.closest('[data-room-id]');
        
        if (roomCard) {
            const roomId = parseInt(roomCard.getAttribute('data-room-id') || '0');
            if (roomId) {
                this.toggleRoomSelection(roomId);
            }
        }
    }

    private toggleRoomSelection(roomId: number) {
        if (this.selectedRoomId === roomId) {
            this.selectedRoomId = null;
        } else {
            this.selectedRoomId = roomId;
        }
        this.render(); // Re-renderizar para actualizar la clase selected
    }

    private handleGuestCheckboxChange(event: Event) {
        const input = event.target as HTMLInputElement;
        const guestId = parseInt(input.value);
        this.toggleGuestSelection(guestId, input.checked);
    }

    private toggleGuestSelection(guestId: number, isSelected: boolean) {
        if (isSelected) {
            if (!this.selectedGuestIds.includes(guestId)) {
                this.selectedGuestIds.push(guestId);
            }
        } else {
            this.selectedGuestIds = this.selectedGuestIds.filter(id => id !== guestId);
        }
        this.render(); // Re-renderizar para actualizar la lista
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
                this.updateTotalPriceDisplay();
            }
        }
    }

    private updateTotalPriceDisplay() {
        const startDateRaw = (this.querySelector('#startDate') as HTMLInputElement)?.value;
        const endDateRaw = (this.querySelector('#endDate') as HTMLInputElement)?.value;
        
        if (startDateRaw && endDateRaw && this.selectedRoomId) {
            const nights = calculateNights(startDateRaw, endDateRaw);
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

    private handleCancelBooking() {
        this.selectedRoomId = null;
        this.selectedGuestIds = [];
        
        // Limpiar fechas
        const startDateInput = this.querySelector('#startDate') as HTMLInputElement;
        const endDateInput = this.querySelector('#endDate') as HTMLInputElement;
        if (startDateInput) startDateInput.value = '';
        if (endDateInput) endDateInput.value = '';
        
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

    // NUEVO MÉTODO: Maneja el evento de guest creado como EventListener
    private handleGuestCreatedEvent(event: Event) {
        const customEvent = event as CustomEvent;
        const newGuest = customEvent.detail.guest as GuestResponseDTO;
        this.handleGuestCreated(newGuest);
    }

    // Método existente pero modificado para recibir el guest directamente
    private async handleGuestCreated(newGuest: GuestResponseDTO) {
        // Cerrar el modal
        this.closeGuestModal();
        
        // Actualizar la lista de huéspedes
        await this.loadData();
        
        // Auto-seleccionar el nuevo huésped
        if (!this.selectedGuestIds.includes(newGuest.id)) {
            this.selectedGuestIds.push(newGuest.id);
        }
        
        // Re-renderizar
        this.render();
        
        // Mostrar mensaje de éxito
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