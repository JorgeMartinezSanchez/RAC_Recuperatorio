using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Moq;
using rec_be.DTOs.BookingDTOs;
using rec_be.Interfaces.Factory;
using rec_be.Interfaces.Repository;
using rec_be.Interfaces.Strategy;
using rec_be.Models;
using rec_be.Services;
using rec_be.RoomStrategy;
using Xunit;

namespace rec_be.Tests.Services
{
    public class BookingServiceTests
    {
        private readonly Mock<IBookingRepository> _mockBookingRepo;
        private readonly Mock<IRoomRepository> _mockRoomRepo;
        private readonly Mock<IRoomStrategyFactory> _mockStrategyFactory;
        private readonly BookingService _service;

        public BookingServiceTests()
        {
            _mockBookingRepo = new Mock<IBookingRepository>();
            _mockRoomRepo = new Mock<IRoomRepository>();
            _mockStrategyFactory = new Mock<IRoomStrategyFactory>();
            _service = new BookingService(
                _mockBookingRepo.Object,
                _mockRoomRepo.Object,
                _mockStrategyFactory.Object);
        }

        // PRUEBA 1: Validación de fechas
        [Fact]
        public void ValidateDate_EndDateAfterStartDate_ReturnsTrue()
        {
            // Arrange
            var startDate = new DateOnly(2025, 6, 1);
            var endDate = new DateOnly(2025, 6, 5);

            // Act
            var result = _service.ValidateDate(startDate, endDate);

            // Assert
            Assert.True(result);
        }

        [Fact]
        public void ValidateDate_EndDateBeforeStartDate_ReturnsFalse()
        {
            // Arrange
            var startDate = new DateOnly(2025, 6, 5);
            var endDate = new DateOnly(2025, 6, 1);

            // Act
            var result = _service.ValidateDate(startDate, endDate);

            // Assert
            Assert.False(result);
        }

        // PRUEBA 2: CreateBooking lanza excepción con fechas inválidas
        [Fact]
        public async Task CreateBooking_WithInvalidDates_ThrowsException()
        {
            // Arrange
            var request = new BookingRequestDTO
            {
                RoomId = 1,
                StartDate = new DateOnly(2025, 6, 5),
                EndDate = new DateOnly(2025, 6, 1), // End before start
                GuestIds = new List<int> { 1, 2 }
            };

            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(
                () => _service.CreateBooking(request, request.GuestIds));
            
            Assert.Contains("End date must be after start date", exception.Message);
        }

        // PRUEBA 3: No se puede reservar habitación ocupada
        [Fact]
        public async Task CreateBooking_WithOccupiedRoom_ThrowsException()
        {
            // Arrange
            var request = new BookingRequestDTO
            {
                RoomId = 1,
                StartDate = new DateOnly(2025, 6, 1),
                EndDate = new DateOnly(2025, 6, 5),
                GuestIds = new List<int> { 1 }
            };

            var occupiedRoom = new Room
            {
                Id = 1,
                RoomNumber = "101",
                Occupied = true,
                RoomType = new RoomType { TypeName = "Simple", Price = 100, Capacity = 1 }
            };

            _mockRoomRepo.Setup(r => r.GetRoomWithTypeById(1))
                .ReturnsAsync(occupiedRoom);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(
                () => _service.CreateBooking(request, request.GuestIds));
            
            Assert.Contains("Room is currently occupied", exception.Message);
        }

        // PRUEBA 4: Validación de cantidad de huéspedes
        [Theory]
        [InlineData(1, 1, true)]   // 1 huésped en habitación Simple (capacidad 1) -> Válido
        [InlineData(2, 1, false)]  // 2 huéspedes en habitación Simple -> Inválido
        [InlineData(2, 2, true)]   // 2 huéspedes en habitación Doble (capacidad 2) -> Válido
        [InlineData(4, 3, false)]  // 4 huéspedes en habitación Triple (capacidad 3) -> Inválido
        public void ValidateGuestAmount_ReturnsExpectedResult(int guestCount, int capacity, bool expected)
        {
            // Arrange
            var room = new Room
            {
                Id = 1,
                RoomType = new RoomType { Capacity = capacity }
            };
            
            IRoomStrategy strategy = room.RoomType.TypeName switch
            {
                "Simple" => new SimpleRoomStrategy(room),
                _ => new GroupalForThreePeopleRoomStrategy(room)
            };
            
            if (capacity == 2)
            {
                strategy = new MatrimonialDoubleRoomStrategy(room);
            }
            else if (capacity == 3)
            {
                strategy = new GroupalForThreePeopleRoomStrategy(room);
            }

            // Act
            var result = _service.ValidateGuestAmount(guestCount, strategy);

            // Assert
            Assert.Equal(expected, result);
        }

        // PRUEBA 5: CheckIn cambia estado a "active"
        [Fact]
        public async Task CheckIn_WithPendingBooking_ChangesStatusToActive()
        {
            // Arrange
            var booking = new Booking
            {
                Id = 1,
                RoomId = 1,
                Status = "pending",
                StartDate = new DateOnly(2025, 6, 1),
                EndDate = new DateOnly(2025, 6, 5)
            };

            var room = new Room
            {
                Id = 1,
                RoomNumber = "101",
                Occupied = false,
                RoomType = new RoomType { TypeName = "Simple", Price = 100, Capacity = 1 }
            };

            _mockBookingRepo.Setup(r => r.GetBooking(1))
                .ReturnsAsync(booking);
            _mockRoomRepo.Setup(r => r.GetRoomWithTypeById(1))
                .ReturnsAsync(room);
            _mockBookingRepo.Setup(r => r.ChangeBookingStatus(It.IsAny<Booking>()))
                .ReturnsAsync((Booking b) => b);
            _mockRoomRepo.Setup(r => r.SetRoomOccupation(It.IsAny<Room>()))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _service.CheckIn(1);

            // Assert
            Assert.Equal("active", booking.Status);
            Assert.NotNull(booking.CheckInDate);
            Assert.True(room.Occupied);
        }

        // PRUEBA 6: CheckOut cambia estado a "finished"
        [Fact]
        public async Task CheckOut_WithActiveBooking_ChangesStatusToFinished()
        {
            // Arrange
            var booking = new Booking
            {
                Id = 1,
                RoomId = 1,
                Status = "active",
                StartDate = new DateOnly(2025, 6, 1),
                EndDate = new DateOnly(2025, 6, 5)
            };

            var room = new Room
            {
                Id = 1,
                RoomNumber = "101",
                Occupied = true,
                RoomType = new RoomType { TypeName = "Simple", Price = 100, Capacity = 1 }
            };

            _mockBookingRepo.Setup(r => r.GetBooking(1))
                .ReturnsAsync(booking);
            _mockRoomRepo.Setup(r => r.GetRoomWithTypeById(1))
                .ReturnsAsync(room);
            _mockBookingRepo.Setup(r => r.ChangeBookingStatus(It.IsAny<Booking>()))
                .ReturnsAsync((Booking b) => b);
            _mockRoomRepo.Setup(r => r.SetRoomOccupation(It.IsAny<Room>()))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _service.CheckOut(1);

            // Assert
            Assert.Equal("finished", booking.Status);
            Assert.NotNull(booking.CheckOutDate);
            Assert.False(room.Occupied);
        }

        // =========================================================
        // PRUEBA 7: Cancel cambia estado a "cancelled"
        // =========================================================
        [Fact]
        public async Task Cancel_WithPendingBooking_ChangesStatusToCancelled()
        {
            // Arrange
            var booking = new Booking
            {
                Id = 1,
                RoomId = 1,
                Status = "pending",
                StartDate = new DateOnly(2025, 6, 1),
                EndDate = new DateOnly(2025, 6, 5)
            };

            var room = new Room
            {
                Id = 1,
                RoomNumber = "101",
                Occupied = false,
                RoomType = new RoomType { TypeName = "Simple", Price = 100, Capacity = 1 }
            };

            _mockBookingRepo.Setup(r => r.GetBooking(1))
                .ReturnsAsync(booking);
            _mockRoomRepo.Setup(r => r.GetRoomWithTypeById(1))
                .ReturnsAsync(room);
            _mockBookingRepo.Setup(r => r.ChangeBookingStatus(It.IsAny<Booking>()))
                .ReturnsAsync((Booking b) => b);

            // Act
            var result = await _service.Cancel(1);

            // Assert
            Assert.Equal("cancelled", booking.Status);
        }

        [Fact]
        public async Task CreateBooking_WithEmptyGuestList_ThrowsExceptionDueToGuestCount()
        {
            // Arrange
            var request = new BookingRequestDTO
            {
                RoomId = 1,
                StartDate = new DateOnly(2025, 6, 1),
                EndDate = new DateOnly(2025, 6, 5),
                GuestIds = new List<int> { } // vacía
            };

            var room = new Room
            {
                Id = 1,
                RoomNumber = "101",
                Occupied = false,
                RoomType = new RoomType { TypeName = "Simple", Price = 100, Capacity = 1 }
            };

            var strategy = new SimpleRoomStrategy(room);

            _mockRoomRepo.Setup(r => r.GetRoomWithTypeById(1))
                .ReturnsAsync(room);
            _mockStrategyFactory.Setup(f => f.CreateStrategy(room))
                .Returns(strategy);

            // Act & Assert — 0 guests no pasa la validación de capacidad
            await Assert.ThrowsAsync<Exception>(
                () => _service.CreateBooking(request, request.GuestIds));
        }
    }
}