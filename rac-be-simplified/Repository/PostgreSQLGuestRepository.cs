using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using rec_be.Data;
using rec_be.DTOs.GuestDTOs;
using rec_be.Interfaces.Repository;
using rec_be.Models;

namespace rec_be.Repository
{
    public class PostgreSQLGuestRepository : IGuestRepository
    {
        protected RACPostgreSQLDbContext dbContext;

        public PostgreSQLGuestRepository(RACPostgreSQLDbContext _dbContext)
        {
            dbContext = _dbContext;
        }

        public async Task<List<Guest>> CreateGuests(List<Guest> guests)
        {   
            await dbContext.Guests.AddRangeAsync(guests);
            await dbContext.SaveChangesAsync();
            return guests;
        }
        public async Task<Guest> CreateSingleGuest(Guest guest)
        {
            await dbContext.Guests.AddAsync(guest);
            await dbContext.SaveChangesAsync();
            return guest;
        }
        public async Task UpdateGuestData(Guest GuestNewData)
        {
            dbContext.Guests.Update(GuestNewData);
            await dbContext.SaveChangesAsync();
        }
        public async Task<List<Guest>> GetAllGuests()
        {
            return await dbContext.Guests.ToListAsync();
        }
        public async Task<List<Guest>> GetGuestsByBookingId(int BookingId)
        {
            return await dbContext.Guests
                .Include(g => g.RoomGuests)
                    .ThenInclude(rg => rg.Booking)
                .Where(g => g.RoomGuests.Any(rg => rg.BookingId == BookingId))
                .ToListAsync();
        }
        public async Task DeleteGuestFromRoom(int _GuestId, int _BookingId)
        {
            var rgEntity = await dbContext.RoomGuests.FirstOrDefaultAsync(rg => (rg.GuestId == _GuestId) && (rg.BookingId == _BookingId));

            if(rgEntity != null)
            {
                dbContext.RoomGuests.Remove(rgEntity);
                await dbContext.SaveChangesAsync();
            } else
            {
                throw new Exception("GUEST REPOSITORY ERROR: Either GuestId or BookingId doesn't exists in room_guest table");
            }
        }
        public async Task AddGuestToRoom(int _GuestId, int _BookingId)
        {
            var rgEntity = await dbContext.RoomGuests.FirstOrDefaultAsync(rg => (rg.GuestId == _GuestId) && (rg.BookingId == _BookingId));

            if(rgEntity != null)
            {
                dbContext.RoomGuests.Update(rgEntity);
                await dbContext.SaveChangesAsync();
            } else
            {
                throw new Exception("GUEST REPOSITORY ERROR: Either GuestId or BookingId doesn't exists in room_guest table");
            }
        }

        public async Task DeleteGuestFromDatabase(int GuestId)
        {
            var TargetGuest = await dbContext.Guests.FindAsync(GuestId);
            if (TargetGuest != null)
            {
                dbContext.Guests.Remove(TargetGuest);
                await dbContext.SaveChangesAsync();
            } else
            {
                throw new Exception("GUEST REPOSITORY ERROR: Guest doesn't exist in guest table.");
            }
        }
        public async Task<bool> GuestExists(Guest guest)
        {
            return await dbContext.Guests.AnyAsync(g => g == guest);
        }
        public async Task<Guest> GetGuest(Guest guest)
        {
            var result = await dbContext.Guests.FirstOrDefaultAsync(g => (g.FirstName == guest.FirstName) 
                                                                      && (g.SecondName == guest.SecondName)
                                                                      && (g.LastName == guest.LastName)
                                                                      && (g.IdCard == guest.IdCard)
                                                                      && (g.PhoneNumber == guest.PhoneNumber)
                                                                      && (g.Email == guest.Email));
            if (result == null) throw new Exception("GUEST REPOSITORY ERROR: Guest doesn't exist in guest table.");
            return result;
        }
    }
}