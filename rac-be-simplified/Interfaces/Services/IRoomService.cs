using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using rec_be.DTOs.RoomDTOs;

namespace rec_be.Interfaces.Services
{
    public interface IRoomService
    {
        Task<List<RoomResponseDTO>> GetAllRooms();
        Task<RoomResponseDTO> GetRoomByRoomNumber(string RoomNumber);
        Task<List<RoomResponseDTO>> GetAllRoomsFromRoomType(string RoomType);
        Task ChangeOccupation(int RoomId, bool Occupation);
    }
}