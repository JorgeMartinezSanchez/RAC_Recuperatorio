using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Moq;
using rec_be.DTOs.RoomDTOs;
using rec_be.Interfaces.Repository;
using rec_be.Models;
using rec_be.Services;
using Xunit;

namespace rec_be.Tests.Services
{
    public class RoomServiceTests
    {
        private readonly Mock<IRoomRepository> _mockRoomRepo;
        private readonly RoomService _service;

        public RoomServiceTests()
        {
            _mockRoomRepo = new Mock<IRoomRepository>();
            _service = new RoomService(_mockRoomRepo.Object);
        }

        // PRUEBA 11: HU-03 - Obtener todas las habitaciones
        [Fact]
        public async Task GetAllRooms_ReturnsAllRooms()
        {
            var rooms = new List<Room>
            {
                new Room 
                { 
                    Id = 1, 
                    RoomNumber = "101", 
                    Occupied = false,
                    RoomType = new RoomType { TypeName = "Simple", Price = 100, Capacity = 1 }
                },
                new Room 
                { 
                    Id = 2, 
                    RoomNumber = "102", 
                    Occupied = true,
                    RoomType = new RoomType { TypeName = "Suite", Price = 250, Capacity = 2 }
                }
            };

            _mockRoomRepo.Setup(r => r.GetAllRooms())
                .ReturnsAsync(rooms);

            // Act
            var result = await _service.GetAllRooms();

            // Assert
            Assert.Equal(2, result.Count);
            Assert.Equal("101", result[0].RoomNumber);
            Assert.Equal("Simple", result[0].RoomType);
            Assert.Equal("Suite", result[1].RoomType);
        }


        // PRUEBA 12: Filtrar habitaciones por tipo
        [Fact]
        public async Task GetAllRoomsFromRoomType_ReturnsOnlyMatchingRooms()
        {
            var allRooms = new List<Room>
            {
                new Room 
                { 
                    Id = 1, 
                    RoomNumber = "101", 
                    RoomType = new RoomType { TypeName = "Simple", Price = 100, Capacity = 1 }
                },
                new Room 
                { 
                    Id = 2, 
                    RoomNumber = "102", 
                    RoomType = new RoomType { TypeName = "Suite", Price = 250, Capacity = 2 }
                },
                new Room 
                { 
                    Id = 3, 
                    RoomNumber = "103", 
                    RoomType = new RoomType { TypeName = "Simple", Price = 100, Capacity = 1 }
                }
            };

            var simpleRooms = allRooms.Where(r => r.RoomType.TypeName == "Simple").ToList();

            _mockRoomRepo.Setup(r => r.GetAllRoomsFromRoomType("Simple"))
                .ReturnsAsync(simpleRooms);

            // Act
            var result = await _service.GetAllRoomsFromRoomType("Simple");

            // Assert
            Assert.Equal(2, result.Count);
            Assert.All(result, r => Assert.Equal("Simple", r.RoomType));
        }
    }
}