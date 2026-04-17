// src/entity/room/ui/room-card/room-card.ts
import Handlebars from "handlebars";
import templateSource from './room-card.hbs?raw';
import './room-card.css';
import type { RoomResponseDTO } from '../../model/room-dtos';

export class RoomCard extends HTMLElement {
    private compiledTemplate: HandlebarsTemplateDelegate;
    private roomData: RoomResponseDTO | null = null;

    constructor() {
        super();
        this.compiledTemplate = Handlebars.compile(templateSource);
    }

    set data(room: RoomResponseDTO) {
        this.roomData = room;
        this.render();
    }

    private render() {
        if (!this.roomData) return;
        
        this.innerHTML = this.compiledTemplate({
            id: this.roomData.id,
            roomNumber: this.roomData.roomNumber,
            roomType: this.roomData.roomType,
            price: this.roomData.price,
            capacity: this.roomData.capacity,
            occupied: this.roomData.occupied,
            statusText: this.roomData.occupied ? 'Occupied' : 'Available',
            statusClass: this.roomData.occupied ? 'room-card__status--occupied' : 'room-card__status--available'
        });
    }

    connectedCallback() {
        const roomNumber = this.getAttribute('data-room-number');
        if (roomNumber) {
            this.loadRoomData(roomNumber);
        }
    }

    private async loadRoomData(roomNumber: string) {
        const { roomApi } = await import('../../api/room-api');
        try {
            const room = await roomApi.getRoomByNumber(roomNumber);
            if (room) {
                this.data = room;
            }
        } catch (error) {
            console.error('Error loading room:', error);
        }
    }
}

customElements.define("room-card", RoomCard);