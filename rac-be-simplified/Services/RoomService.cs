using rec_be.DTOs.RoomDTOs;
using rec_be.Interfaces.Repository;
using rec_be.Interfaces.Services;
using rec_be.Models;

namespace rec_be.Services
{
    public class RoomService : IRoomService
    {
        protected IRoomRepository roomRepository;
 
        public RoomService(IRoomRepository _roomRepository)
        {
            roomRepository = _roomRepository;
        }
 
        // ── Shared mapper ─────────────────────────────────────────────
        private static RoomResponseDTO MapToDTO(Room r) =>
            new RoomResponseDTO
            {
                Id         = r.Id,
                RoomNumber = r.RoomNumber,
                RoomType   = r.RoomType?.TypeName ?? "",
                Capacity   = r.RoomType?.Capacity ?? 0,
                Price      = r.RoomType?.Price    ?? 0,
                Occupied   = r.Occupied
            };
 
        // ── HU-03 / general: list all rooms ───────────────────────────
        public async Task<List<RoomResponseDTO>> GetAllRooms()
        {
            var rooms = await roomRepository.GetAllRooms(); // now includes RoomType
            if (rooms == null || rooms.Count == 0)
                throw new Exception("ROOM SERVICE ERROR: No rooms found.");
 
            return rooms.Select(MapToDTO).ToList();
        }
 
        // ── Get single room by number ─────────────────────────────────
        public async Task<RoomResponseDTO> GetRoomByRoomNumber(string RoomNumber)
        {
            var room = await roomRepository.GetRoomByRoomNumber(RoomNumber);
            return MapToDTO(room);
        }
 
        // ── HU-05: list rooms filtered by type ───────────────────────
        public async Task<List<RoomResponseDTO>> GetAllRoomsFromRoomType(string RoomType)
        {
            var rooms = await roomRepository.GetAllRoomsFromRoomType(RoomType);
            if (rooms == null || rooms.Count == 0)
                throw new Exception($"ROOM SERVICE ERROR: No rooms of type '{RoomType}' found.");
 
            return rooms.Select(MapToDTO).ToList();
        }
 
        // ── Set room occupied / free ──────────────────────────────────
        public async Task ChangeOccupation(int RoomId, bool Occupation)
        {
            var room = await roomRepository.GetRoomWithTypeById(RoomId);
            room.Occupied = Occupation;
            await roomRepository.SetRoomOccupation(room);
        }
    }
}