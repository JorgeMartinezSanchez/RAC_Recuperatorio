using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using rec_be.DTOs.GuestDTOs;

namespace rec_be.Interfaces.Services
{
    public interface IGuestService
    {
        Task<List<GuestResponseDTO>> AddGuestList(List<GuestRequestDTO> guests);
        Task<GuestResponseDTO> AddGuest(GuestRequestDTO guest);
        Task<List<GuestResponseDTO>> GetGuestsFromBookingId(int BookingId);
    }
}