// src/entity/guest/ui/create-guest-card/create-guest-card.ts
import Handlebars from "handlebars";
import templateSource from './create-guest-form.hbs?raw';
import './create-guest-form.css';
import type { GuestRequestDTO, GuestResponseDTO } from '../../model/guest-dtos';
import { guestsApi } from '../../api/guest-api';

export class CreateGuestForm extends HTMLElement {
    private compiledTemplate: HandlebarsTemplateDelegate;
    private onGuestCreated?: (guest: GuestResponseDTO) => void;

    constructor() {
        super();
        this.compiledTemplate = Handlebars.compile(templateSource);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    connectedCallback() {
        this.render();
        this.attachEventListeners();
    }

    set onSuccess(callback: (guest: GuestResponseDTO) => void) {
        this.onGuestCreated = callback;
    }

    private render() {
        this.innerHTML = this.compiledTemplate({});
    }

    private attachEventListeners() {
        const form = this.querySelector('#createGuestForm');
        if (form) {
            form.removeEventListener('submit', this.handleSubmit);
            form.addEventListener('submit', this.handleSubmit);
        }
    }

    private async handleSubmit(event: Event) {
        event.preventDefault();
        event.stopPropagation();

        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);

        const guestData: GuestRequestDTO = {
            firstName: formData.get('firstName') as string,
            secondName: (formData.get('secondName') as string) || '',
            lastName: formData.get('lastName') as string,
            idCard: formData.get('idCard') as string,
            phoneNumber: formData.get('phoneNumber') as string,
            email: formData.get('email') as string
        };

        // Validaciones
        if (!guestData.firstName || !guestData.lastName || !guestData.idCard || !guestData.phoneNumber || !guestData.email) {
            this.showError('Please fill all required fields');
            return;
        }

        const submitBtn = this.querySelector('.create-guest__submit') as HTMLButtonElement;
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Registering...';
        submitBtn.disabled = true;

        try {
            const newGuest = await guestsApi.createGuest(guestData);
            
            // Limpiar formulario
            form.reset();
            
            // Mostrar éxito
            this.showSuccess(`Guest ${newGuest.firstName} ${newGuest.lastName} registered successfully!`);
            
            // Disparar evento
            this.dispatchEvent(new CustomEvent('guest-created', {
                detail: { guest: newGuest },
                bubbles: true
            }));
            
            if (this.onGuestCreated) {
                this.onGuestCreated(newGuest);
            }
            
        } catch (error) {
            console.error('Error creating guest:', error);
            this.showError('Failed to create guest. Please try again.');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    private showError(message: string) {
        const existingError = this.querySelector('.create-guest-form__error');
        if (existingError) existingError.remove();
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'create-guest-form__error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            background: #ef4444;
            color: white;
            padding: 0.75rem;
            border-radius: 8px;
            margin-top: 1rem;
            text-align: center;
        `;
        
        const form = this.querySelector('.create-guest-form');
        if (form) {
            form.appendChild(errorDiv);
            setTimeout(() => errorDiv.remove(), 3000);
        }
    }

    private showSuccess(message: string) {
        const successDiv = document.createElement('div');
        successDiv.className = 'create-guest-form__success';
        successDiv.textContent = message;
        successDiv.style.cssText = `
            background: #10b981;
            color: white;
            padding: 0.75rem;
            border-radius: 8px;
            margin-top: 1rem;
            text-align: center;
        `;
        
        const form = this.querySelector('.create-guest-form');
        if (form) {
            form.appendChild(successDiv);
            setTimeout(() => successDiv.remove(), 3000);
        }
    }
}

customElements.define('create-guest-form', CreateGuestForm);