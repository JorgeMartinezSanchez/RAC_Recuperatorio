// src/entity/guest/ui/guest-card/guest-card.ts
import Handlebars from "handlebars";
import templateSource from './guest-card.hbs?raw';
import './guest-card.css';
import type { GuestResponseDTO } from '../../model/guest-dtos';

export class GuestCard extends HTMLElement {
    private compiledTemplate: HandlebarsTemplateDelegate;
    private guestData: GuestResponseDTO | null = null;

    constructor() {
        super();
        this.compiledTemplate = Handlebars.compile(templateSource);
    }

    set data(guest: GuestResponseDTO) {
        this.guestData = guest;
        this.render();
    }

    private render() {
        if (!this.guestData) return;
        
        this.innerHTML = this.compiledTemplate({
            id: this.guestData.id,
            fullName: `${this.guestData.firstName} ${this.guestData.secondName ? this.guestData.secondName + ' ' : ''}${this.guestData.lastName}`,
            firstName: this.guestData.firstName,
            lastName: this.guestData.lastName,
            idCard: this.guestData.idCard,
            phoneNumber: this.guestData.phoneNumber,
            email: this.guestData.email
        });
    }

    connectedCallback() {
        const guestId = this.getAttribute('data-guest-id');
        if (guestId) {
            this.loadGuestData(Number(guestId));
        }
    }

    private async loadGuestData(id: number) {
        const { guestsApi } = await import('../../api/guest-api');
        try {
            const guests = await guestsApi.getAllGuests();
            const guest = guests.find(g => g.id === id);
            if (guest) {
                this.data = guest;
            }
        } catch (error) {
            console.error('Error loading guest:', error);
        }
    }
}

customElements.define("guest-card", GuestCard);