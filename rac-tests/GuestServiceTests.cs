using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Moq;
using rec_be.DTOs.GuestDTOs;
using rec_be.Interfaces.Repository;
using rec_be.Models;
using rec_be.Services;
using Xunit;

namespace rec_be.Tests.Services
{
    public class GuestServiceTests
    {
        private readonly Mock<IGuestRepository> _mockGuestRepo;
        private readonly GuestService _service;

        public GuestServiceTests()
        {
            _mockGuestRepo = new Mock<IGuestRepository>();
            _service = new GuestService(_mockGuestRepo.Object);
        }

        // PRUEBA 8: Agregar huésped nuevo
        [Fact]
        public async Task AddGuest_NewGuest_CreatesAndReturnsGuest()
        {
            // Arrange
            var request = new GuestRequestDTO
            {
                FirstName = "Juan",
                SecondName = "Carlos",
                LastName = "Perez",
                IDCard = "12345678",
                PhoneNumber = "77712345",
                Email = "juan@test.com"
            };

            var expectedGuest = new Guest
            {
                Id = 1,
                FirstName = "Juan",
                SecondName = "Carlos",
                LastName = "Perez",
                IdCard = "12345678",
                PhoneNumber = "77712345",
                Email = "juan@test.com"
            };

            _mockGuestRepo.Setup(r => r.GuestExists(It.IsAny<Guest>()))
                .ReturnsAsync(false);
            _mockGuestRepo.Setup(r => r.CreateSingleGuest(It.IsAny<Guest>()))
                .ReturnsAsync(expectedGuest);

            // Act
            var result = await _service.AddGuest(request);

            // Assert
            Assert.Equal("Juan", result.FirstName);
            Assert.Equal("Perez", result.LastName);
            Assert.Equal("12345678", result.IDCard);
        }

        // PRUEBA 9: No agregar huésped duplicado
        [Fact]
        public async Task AddGuest_DuplicateGuest_ThrowsException()
        {
            var request = new GuestRequestDTO
            {
                FirstName = "Juan",
                LastName = "Perez",
                IDCard = "12345678",
                PhoneNumber = "77712345",
                Email = "juan@test.com"
            };

            _mockGuestRepo.Setup(r => r.GuestExists(It.IsAny<Guest>()))
                .ReturnsAsync(true);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(
                () => _service.AddGuest(request));
            
            Assert.Contains("already exists", exception.Message);
        }

        // PRUEBA 10: Obtener huéspedes por BookingId
        [Fact]
        public async Task GetGuestsFromBookingId_ReturnsGuests()
        {
            // Arrange
            int bookingId = 1;
            var expectedGuests = new List<Guest>
            {
                new Guest { Id = 1, FirstName = "Juan", LastName = "Perez", IdCard = "12345678" },
                new Guest { Id = 2, FirstName = "Maria", LastName = "Lopez", IdCard = "87654321" }
            };

            _mockGuestRepo.Setup(r => r.GetGuestsByBookingId(bookingId))
                .ReturnsAsync(expectedGuests);

            // Act
            var result = await _service.GetGuestsFromBookingId(bookingId);

            // Assert
            Assert.Equal(2, result.Count);
            Assert.Equal("Juan", result[0].FirstName);
            Assert.Equal("Maria", result[1].FirstName);
        }
    }
}