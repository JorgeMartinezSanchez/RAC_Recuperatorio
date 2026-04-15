using rec_be.DTOs.RoomDTOs;
using rec_be.Models;

namespace rec_be.Interfaces.Repository
{
    public interface IRoomRepository
    {
        Task<List<Room>> GetAllRooms();
        Task<List<RoomType>> GetAllRoomTypes();
        Task<Room> GetRoomByRoomNumber(string RoomNumber);
        Task<List<Room>> GetAllRoomsFromRoomType(string RoomType);
        Task<Room> GetRoomById(int RoomId);
        Task<Room> GetRoomWithTypeById(int RoomId);
        Task SetRoomOccupation(Room TargetRoom);
        Task<RoomType> GetRoomType(int RoomdId);
    }
}