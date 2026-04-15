using Microsoft.EntityFrameworkCore;
using rec_be.Models;
using Microsoft.EntityFrameworkCore.Infrastructure.Internal;

namespace rec_be.Data
{
    public class RACPostgreSQLDbContext : DbContext
    {
        public RACPostgreSQLDbContext(DbContextOptions<RACPostgreSQLDbContext> options) : base(options){ }
        public DbSet<Guest> Guests { get; set; }
        public DbSet<RoomType> RoomTypes { get; set; }
        public DbSet<Room> Rooms { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<RoomGuest> RoomGuests { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Room>().ToTable("room");
            modelBuilder.Entity<Guest>().ToTable("guest");
            modelBuilder.Entity<RoomType>().ToTable("room_type");
            modelBuilder.Entity<Booking>().ToTable("booking");
            modelBuilder.Entity<RoomGuest>().ToTable("room_guest");

            // PK compuesta
            modelBuilder.Entity<RoomGuest>()
                .HasKey(rg => new { rg.BookingId, rg.GuestId });
        }
    }
}