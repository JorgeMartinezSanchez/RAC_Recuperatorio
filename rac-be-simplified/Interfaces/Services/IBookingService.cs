using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using rec_be.DTOs.BookingDTOs;
using rec_be.DTOs.GuestDTOs;
using rec_be.Interfaces.Strategy;
using rec_be.Models;

namespace rec_be.Interfaces.Services
{
    public interface IBookingService
    {
        Task<BookingResponseDTO> CreateBooking(BookingRequestDTO bookingRequest, List<int> guestIds);
        bool ValidateGuestAmount(int amount, IRoomStrategy room);
        Task<BookingResponseDTO> CheckIn(int bookingId);
        Task<BookingResponseDTO> CheckOut(int bookingId);
        Task<BookingResponseDTO> Cancel(int bookingId);
        bool ValidateDate(DateOnly StartDate, DateOnly EndDate);
        Task<List<BookingResponseDTO>> GetAllBookings();
        Task<bool> Overlaps(BookingRequestDTO bookingRequest);
    }
}