using Microsoft.AspNetCore.Mvc;
using rec_be.DTOs.GuestDTOs;
using rec_be.Interfaces.Services;

namespace rec_be.Controller
{
    [ApiController]
    [Route("[controller]")]
    public class GuestController : ControllerBase
    {
        private IGuestService guestService;

        public GuestController(IGuestService _guestService)
        {
            guestService = _guestService;
        }

        [HttpPost("new/{newGuest}")]
        public async Task<IActionResult> NewGuest([FromBody] GuestRequestDTO newGuest)
        {
            var guest = await guestService.AddGuest(newGuest);
            return Ok(guest);
        }

        [HttpPost("new/many/{newGuestList}")]
        public async Task<IActionResult> NewGuestList([FromBody] List<GuestRequestDTO> newguestList)
        {
            var guestList = await guestService.AddGuestList(newguestList);
            return Ok(guestList);
        }

        [HttpGet("from/{BookingId}")]
        public async Task<IActionResult> GetGuestsFromBookingId(int BookingId)
        {
            var allGuests = await guestService.GetGuestsFromBookingId(BookingId);
            return Ok(allGuests);
        }
    }
}