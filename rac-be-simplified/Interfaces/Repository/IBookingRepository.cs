using rec_be.DTOs.BookingDTOs;
using rec_be.Interfaces.Strategy;
using rec_be.Models;

namespace rec_be.Interfaces.Repository
{
    public interface IBookingRepository
    {
        Task<Booking> CreateBooking(Booking NewBooking);
        Task<List<Booking>> GetAllBookings();
        Task<Booking> GetBooking(int BookingId);
        Task<Booking> GetBooking(BookingRequestDTO BookingRequestDto);
        Task<Booking> ChangeBookingStatus(Booking NewBookingState);
        Task AssignGuestsToBooking(int bookingId, List<int> guestIds);
    }
}