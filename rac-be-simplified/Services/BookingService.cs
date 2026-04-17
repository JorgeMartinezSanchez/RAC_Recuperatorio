// 📁 Services/BookingService.cs
using Microsoft.EntityFrameworkCore;
using rec_be.DTOs.BookingDTOs;
using rec_be.Interfaces.Factory;
using rec_be.Interfaces.Repository;
using rec_be.Interfaces.Services;
using rec_be.Interfaces.States;
using rec_be.Interfaces.Strategy;
using rec_be.Models;
using rec_be.RoomStrategy;
using rec_be.States.Booking_;

namespace rec_be.Services
{
    public class BookingService : IBookingService
    {
        private readonly IBookingRepository      _bookingRepo;
        private readonly IRoomRepository         _roomRepo;
        private readonly IRoomStrategyFactory    _strategyFactory;

        public BookingService(
            IBookingRepository   bookingRepo,
            IRoomRepository      roomRepo,
            IRoomStrategyFactory strategyFactory)
        {
            _bookingRepo         = bookingRepo;
            _roomRepo            = roomRepo;
            _strategyFactory     = strategyFactory;
        }

        // ── State pattern: resuelve el estado correcto en runtime ─────
        private IBookingState ResolveState(string status) => status switch
        {
            "pending"   => new PendingState(),
            "active"    => new ActiveState(),
            "cancelled" => new CancelledState(),
            "finished"  => new FinishedState(),
            _ => throw new Exception($"BOOKING SERVICE ERROR: Unknown booking status '{status}'.")
        };

        // ── DTO mapper ────────────────────────────────────────────────
        private static BookingResponseDTO MapToDTO(Booking booking, Room room) =>
            new BookingResponseDTO
            {
                Id           = booking.Id,
                RoomNumber   = room.RoomNumber,
                RoomTypeName = room.RoomType?.TypeName ?? "",
                StartDate    = booking.StartDate,
                EndDate      = booking.EndDate,
                Status       = booking.Status,
                Total        = booking.Total
            };

        public async Task<BookingResponseDTO> CreateBooking(BookingRequestDTO bookingRequest, List<int> guestIds)
        {
            try
            {
                // CA-2: Validate dates
                if (!ValidateDate(bookingRequest.StartDate, bookingRequest.EndDate))
                    throw new Exception("BOOKING SERVICE ERROR: End date must be after start date.");

                // Log the room ID being requested
                Console.WriteLine($"Attempting to get room with ID: {bookingRequest.RoomId}");
                
                var room = await _roomRepo.GetRoomWithTypeById(bookingRequest.RoomId);

                Console.WriteLine($"Room found: ID={room.Id}, Number={room.RoomNumber}, Type={room.RoomType?.TypeName}");

                // CA-1: Check if room exists and is not occupied
                if (room.Occupied)
                    throw new Exception("BOOKING SERVICE ERROR: Room is currently occupied.");

                // CA-4: Validate guest count against room capacity
                var guestCount = guestIds?.Count ?? 0;
                var strategy = _strategyFactory.CreateStrategy(room);
                
                if (!ValidateGuestAmount(guestCount, strategy))
                    throw new Exception($"BOOKING SERVICE ERROR: Room capacity is {strategy.GetMaxCapacity()} guests, but you're trying to book for {guestCount} guests.");

                // Prevent overlapping reservations

                if (await Overlaps(bookingRequest))
                    throw new Exception("BOOKING SERVICE ERROR: Room is already reserved for that date range.");

                var total = room.RoomType!.Price * (bookingRequest.EndDate.DayNumber - bookingRequest.StartDate.DayNumber);
                Console.WriteLine($"Room Price = {room.RoomType!.Price}, Total Price Calculated = {total}");
                // Create the booking
                var newBooking = new Booking
                {
                    RoomId = bookingRequest.RoomId,
                    StartDate = bookingRequest.StartDate,
                    EndDate = bookingRequest.EndDate,
                    Status = "pending",
                    CheckInDate = default,
                    CheckOutDate = default,
                    Total = total,
                    CreationDate = DateTime.UtcNow
                };

                // Log before saving
                Console.WriteLine($"Creating booking: RoomId={newBooking.RoomId}, StartDate={newBooking.StartDate}, EndDate={newBooking.EndDate}, Total={newBooking.Total}");
                
                var created = await _bookingRepo.CreateBooking(newBooking);

                Console.WriteLine($"Booking created with ID: {created.Id}");

                if (guestIds != null && guestIds.Any())
                {
                    foreach (var guestId in guestIds)
                    {
                        Console.WriteLine($"Checking guest ID: {guestId}");
                    }
                    
                    await _bookingRepo.AssignGuestsToBooking(created.Id, guestIds);
                }
                
                return MapToDTO(created, room);
            }
            catch (DbUpdateException ex)
            {
                throw new Exception($"Database error: {ex.InnerException?.Message ?? ex.Message}");
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        // HU-03
        public async Task<List<BookingResponseDTO>> GetAllBookings()
        {
            var bookings = await _bookingRepo.GetAllBookings();
            var rooms    = await _roomRepo.GetAllRooms();
            var roomMap  = rooms.ToDictionary(r => r.Id);

            return bookings
                .Where(b => b.Status == "pending" || b.Status == "active")
                .OrderBy(b => b.StartDate)
                .Select(b =>
                {
                    roomMap.TryGetValue(b.RoomId, out var room);
                    return MapToDTO(b, room ?? new Room());
                })
                .ToList();
        }

        // HU-04 
        public async Task<BookingResponseDTO> CheckIn(int bookingId)
        {
            var booking = await _bookingRepo.GetBooking(bookingId);
            var room    = await _roomRepo.GetRoomWithTypeById(booking.RoomId);

            IBookingState state = ResolveState(booking.Status);
            state.CheckIn(booking);
            booking.CheckInDate = DateTime.UtcNow;

            room.Occupied = true;
            await _roomRepo.SetRoomOccupation(room);
            await _bookingRepo.ChangeBookingStatus(booking);

            return MapToDTO(booking, room);
        }

        //  HU-08: Check Out con optional late Check-Out
        public async Task<BookingResponseDTO> CheckOut(int bookingId)
        {
            var booking = await _bookingRepo.GetBooking(bookingId);
            var room = await _roomRepo.GetRoomWithTypeById(booking.RoomId);

            IBookingState state = ResolveState(booking.Status);
            state.CheckOut(booking);
            booking.CheckOutDate = DateTime.UtcNow;

            room.Occupied = false;
            await _roomRepo.SetRoomOccupation(room);
            await _bookingRepo.ChangeBookingStatus(booking);

            return MapToDTO(booking, room);
        }

        public async Task<BookingResponseDTO> Cancel(int bookingId)
        {
            var booking = await _bookingRepo.GetBooking(bookingId);
            var room    = await _roomRepo.GetRoomWithTypeById(booking.RoomId);

            IBookingState state = ResolveState(booking.Status);
            state.Cancel(booking);

            if (room.Occupied)
            {
                room.Occupied = false;
                await _roomRepo.SetRoomOccupation(room);
            }

            await _bookingRepo.ChangeBookingStatus(booking);
            return MapToDTO(booking, room);
        }

        // HU-05
        public bool ValidateGuestAmount(int amount, IRoomStrategy room)
            => room.ValidateGuestCount(amount);

        // date validation
        public bool ValidateDate(DateOnly startDate, DateOnly endDate)
            => endDate > startDate;

        public async Task<decimal> RecalculateTotalWithLateCheckOuts(int bookingId)
        {
            var booking = await _bookingRepo.GetBooking(bookingId);
            
            await _bookingRepo.ChangeBookingStatus(booking);
            return booking.Total;
        }
        // Overlaping o Soplamiento
        public async Task<bool> Overlaps(BookingRequestDTO bookingRequest)
        {
            var allBookings = await _bookingRepo.GetAllBookings();
            return allBookings.Any(b =>
                    b.RoomId == bookingRequest.RoomId &&
                    b.Status != "cancelled" &&
                    b.Status != "finished" &&
                    b.StartDate < bookingRequest.EndDate &&
                    b.EndDate > bookingRequest.StartDate);

        }
    }
}