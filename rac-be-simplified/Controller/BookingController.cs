using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using rec_be.DTOs.BookingDTOs;
using rec_be.Interfaces.Services;

namespace rec_be.Controller
{
    [ApiController]
    [Route("[controller]")]
    public class BookingController : ControllerBase
    {
        private readonly IBookingService bookingService;

        public BookingController(IBookingService _bookingService)
        {
            bookingService = _bookingService;
        }
        
        [HttpPost("Create")]  // ← Añade el parámetro a la ruta
        public async Task<IActionResult> CreateBooking([FromBody] BookingRequestDTO bookingRequest)
        {
            try
            {
                if (bookingRequest == null)
                {
                    return BadRequest("Booking request cannot be null.");
                }
                
                if (bookingRequest.GuestIds == null || !bookingRequest.GuestIds.Any())
                    return BadRequest("At least one guest must be selected for the booking.");
                
                var booking = await bookingService.CreateBooking(bookingRequest, bookingRequest.GuestIds);
                return Ok(booking);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("All")]
        public async Task<IActionResult> GetAllBookings()
        {
            var bookings = await bookingService.GetAllBookings();
            return Ok(bookings);
        }

        [HttpPut("checkin/{BookingId}")]
        public async Task<IActionResult> CheckIn(int BookingId)
        {
            var booking = await bookingService.CheckIn(BookingId);
            return Ok(booking);
        }

        [HttpPut("checkout/{BookingId}")]
        public async Task<IActionResult> CheckOut(int BookingId)
        {
            var booking = await bookingService.CheckOut(BookingId);
            return Ok(booking);
        }

        [HttpPut("cancel/{BookingId}")]
        public async Task<IActionResult> Cancel(int BookingId)
        {
            var booking = await bookingService.Cancel(BookingId);
            return Ok(booking);
        }
        [HttpPost("test")]
        public async Task<IActionResult> Test([FromBody] BookingRequestDTO testRequest)
        {
            Console.WriteLine($"Test received: {System.Text.Json.JsonSerializer.Serialize(testRequest)}");
            return Ok(new { message = "Endpoint works!", data = testRequest });
        }
    }
}