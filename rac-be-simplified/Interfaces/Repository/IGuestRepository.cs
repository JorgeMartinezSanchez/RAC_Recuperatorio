using rec_be.DTOs.GuestDTOs;
using rec_be.Models;

namespace rec_be.Interfaces.Repository
{
    public interface IGuestRepository
    {
        Task<List<Guest>> CreateGuests(List<Guest> guests);
        Task<Guest> CreateSingleGuest(Guest guest);
        Task<List<Guest>> GetAllGuests();
        Task<Guest> GetGuest(Guest guest);
        Task<List<Guest>> GetGuestsByBookingId(int BookingId);
        Task UpdateGuestData(Guest GuestNewData);
        Task DeleteGuestFromRoom(int GuestId, int BookingId);
        Task AddGuestToRoom(int _GuestId, int _BookingId);
        Task DeleteGuestFromDatabase(int GuestId);
        Task<bool> GuestExists(Guest guest);
    }
}