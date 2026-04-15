using rec_be.DTOs.GuestDTOs;
using rec_be.Interfaces.Repository;
using rec_be.Interfaces.Services;
using rec_be.Models;

namespace rec_be.Services
{
    public class GuestService : IGuestService
    {
        protected IGuestRepository guestRepository;

        public GuestService(IGuestRepository _guestRepository)
        {
            guestRepository = _guestRepository;
        }

        // HU-01
        public async Task<GuestResponseDTO> AddGuest(GuestRequestDTO guest)
        {
            Guest newGuest = new Guest
            {
                FirstName   = guest.FirstName,
                SecondName  = guest.SecondName,
                LastName    = guest.LastName,
                IdCard      = guest.IDCard,
                PhoneNumber = guest.PhoneNumber,
                Email       = guest.Email
            };

            bool exists = await guestRepository.GuestExists(newGuest);
            if (exists)
                throw new Exception($"GUEST SERVICE ERROR: A guest with ID card {newGuest.IdCard} already exists.");

            Guest created = await guestRepository.CreateSingleGuest(newGuest);
            return MapToDTO(created);
        }

        // If a guest already exists it is reused, otherwise it is created.
        public async Task<List<GuestResponseDTO>> AddGuestList(List<GuestRequestDTO> guests)
        {
            List<GuestResponseDTO> response = new List<GuestResponseDTO>();

            foreach (GuestRequestDTO g in guests)
            {
                Guest newGuest = new Guest
                {
                    FirstName   = g.FirstName,
                    SecondName  = g.SecondName,
                    LastName    = g.LastName,
                    IdCard      = g.IDCard,
                    PhoneNumber = g.PhoneNumber,
                    Email       = g.Email
                };

                bool exists = await guestRepository.GuestExists(newGuest);

                Guest result = exists
                    ? await guestRepository.GetGuest(newGuest)
                    : await guestRepository.CreateSingleGuest(newGuest);

                response.Add(MapToDTO(result));
            }

            return response;
        }
        public async Task<List<GuestResponseDTO>> GetGuestsFromBookingId(int BookingId)
        {
            var guests = await guestRepository.GetGuestsByBookingId(BookingId);
            if (guests == null || guests.Count == 0)
                throw new Exception("GUEST SERVICE ERROR: No guests found for this booking.");

            return guests.Select(MapToDTO).ToList();
        }

        private static GuestResponseDTO MapToDTO(Guest g) =>
            new GuestResponseDTO
            {
                Id          = g.Id,
                FirstName   = g.FirstName,
                SecondName  = g.SecondName,
                LastName    = g.LastName,
                IDCard      = g.IdCard,
                PhoneNumber = g.PhoneNumber,
                Email       = g.Email
            };
    }
}