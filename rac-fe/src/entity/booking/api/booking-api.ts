import { apiClient } from '../../../shared/api/http-client';
import type { BookingResponseDTO, BookingRequestDTO } from '../model/booking-dtos';

export const bookingApi = {
  getAllBookings: () => 
    apiClient.get<BookingResponseDTO[]>('/Booking/All'),

  createBooking: (bookingData: BookingRequestDTO) => 
    apiClient.post<BookingResponseDTO>('/Booking/Create', bookingData),

  checkIn: (bookingId: number) => 
    apiClient.put<BookingResponseDTO>(`/Booking/checkin/${bookingId}`),

  checkOut: (bookingId: number) => 
    apiClient.put<BookingResponseDTO>(`/Booking/checkout/${bookingId}`),

  cancel: (bookingId: number) => 
    apiClient.put<BookingResponseDTO>(`/Booking/cancel/${bookingId}`),

  testEndpoint: (testData: BookingRequestDTO) => 
    apiClient.post('/Booking/test', testData)
};