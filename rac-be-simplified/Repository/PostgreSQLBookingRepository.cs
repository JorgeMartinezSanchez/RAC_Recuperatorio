using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using rec_be.Data;
using rec_be.DTOs.BookingDTOs;
using rec_be.Interfaces.Repository;
using rec_be.Interfaces.Strategy;
using rec_be.Models;

namespace rec_be.Repository
{
    public class PostgreSQLBookingRepository : IBookingRepository
    {
        protected RACPostgreSQLDbContext dbContext;
        public PostgreSQLBookingRepository(RACPostgreSQLDbContext _dbContext)
        {
            dbContext = _dbContext;
        }
        public async Task<Booking> CreateBooking(Booking NewBooking)
        {
            try
            {
                // Verify the room exists before trying to insert
                var roomExists = await dbContext.Rooms.AnyAsync(r => r.Id == NewBooking.RoomId);
                if (!roomExists)
                {
                    throw new Exception($"Room with ID {NewBooking.RoomId} does not exist in the database.");
                }
                
                await dbContext.Bookings.AddAsync(NewBooking);
                await dbContext.SaveChangesAsync();
                return NewBooking;
            }
            catch (DbUpdateException ex)
            {
                // Log the inner exception details
                var innerMessage = ex.InnerException?.Message ?? ex.Message;
                throw new Exception($"Failed to create booking: {innerMessage}");
            }
        }
        public async Task<List<Booking>> GetAllBookings()
        {
            return await dbContext.Bookings.ToListAsync();
        }
        public async Task<Booking> GetBooking(int BookingId)
        {
            var booking = await dbContext.Bookings.FirstOrDefaultAsync(booking => booking.Id == BookingId);
            if(booking == null)
            {
                throw new Exception("No booking was found.");
            } else
            {
                return booking;
            }
        }
        public async Task<Booking> GetBooking(BookingRequestDTO BookingRequestDto)
        {
            var booking = await dbContext.Bookings.FirstOrDefaultAsync(booking => (booking.RoomId == BookingRequestDto.RoomId)
                                                                                &&(booking.StartDate == BookingRequestDto.StartDate)
                                                                                &&(booking.EndDate == BookingRequestDto.EndDate));
            if(booking == null)
            {
                throw new Exception("No booking was found.");
            } else
            {
                return booking;
            }
        }
        public async Task<Booking> ChangeBookingStatus(Booking NewBookingState)
        {
            dbContext.Bookings.Update(NewBookingState);
            await dbContext.SaveChangesAsync();
            return NewBookingState;
        }

        public async Task AssignGuestsToBooking(int bookingId, List<int> guestIds)
        {
            var roomGuests = guestIds.Select(guestId => new RoomGuest
            {
                BookingId = bookingId,
                GuestId = guestId
            });
            
            await dbContext.RoomGuests.AddRangeAsync(roomGuests);
            await dbContext.SaveChangesAsync();
        }
    }
}