import { apiClient } from '../../../shared/api/http-client';
import type { GuestRequestDTO, GuestResponseDTO } from '../model/guest-dtos';

export const guestsApi = {
  getAllGuests: () =>
    apiClient.get<GuestResponseDTO[]>('/Guest/All'),

  createGuest: (newGuest: GuestRequestDTO) =>
    apiClient.post<GuestResponseDTO>('/Guest/new/newGuest', newGuest),

  createMultipleGuests: (newGuestList: GuestRequestDTO[]) =>
    apiClient.post<GuestResponseDTO[]>('/Guest/new/many/newGuestList', newGuestList),

  getGuestsFromBookingId: (bookingId: number) =>
    apiClient.get<GuestResponseDTO[]>(`/Guest/from/${bookingId}`)
};