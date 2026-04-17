// rec_be/Repository/PostgreSQLRoomRepository.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using rec_be.Data;
using rec_be.DTOs.RoomDTOs;
using rec_be.Interfaces.Repository;
using rec_be.Models;

namespace rec_be.Repository
{
    public class PostgreSQLRoomRepository : IRoomRepository
    {
        protected RACPostgreSQLDbContext dbContext;
 
        public PostgreSQLRoomRepository(RACPostgreSQLDbContext _dbContext)
        {
            dbContext = _dbContext;
        }
        
        public async Task<List<Room>> GetAllRooms()
        {
            return await dbContext.Rooms.Include(r => r.RoomType).ToListAsync();
        }
        
        public async Task<List<RoomType>> GetAllRoomTypes()
        {
            return await dbContext.RoomTypes.ToListAsync();
        }
        
        // ✅ CORREGIDO: Incluir RoomType
        public async Task<Room> GetRoomByRoomNumber(string RoomNumber)
        {
            var room = await dbContext.Rooms
                .Include(r => r.RoomType)  // ← Agregar esta línea
                .FirstOrDefaultAsync(room => room.RoomNumber == RoomNumber);
                
            if(room == null)
            {
                throw new Exception($"The {RoomNumber} Room was not found or doesn't exist.");
            }
            else
            {
                return room;
            }
        }
        
        public async Task<List<Room>> GetAllRoomsFromRoomType(string RoomType)
        {
            return await dbContext.Rooms
                        .Include(r => r.RoomType)
                        .Where(r => r.RoomType.TypeName == RoomType)
                        .ToListAsync();
        }
        
        public async Task SetRoomOccupation(Room TargetRoom)
        {
            dbContext.Rooms.Update(TargetRoom);
            await dbContext.SaveChangesAsync();
        }
        
        public async Task<Room> GetRoomById(int RoomId)
        {
            var result = await dbContext.Rooms
                .Include(r => r.RoomType)  // ← Agregar para consistencia
                .FirstOrDefaultAsync(r => r.Id == RoomId);
            if(result == null) throw new Exception($"ROOM REPOSITORY ERROR: No room with {RoomId} id was found in room table.");
            return result;
        }
        
        public async Task<RoomType> GetRoomType(int RoomdId)
        {
            var result = await dbContext.RoomTypes
                        .Include(rt => rt.Rooms)
                        .FirstOrDefaultAsync(r => r.Id == RoomdId);
            if (result == null) throw new Exception("ROOM REPOSITORY ERROR: No room type was found with this room.");
            return result;
        }
        
        public async Task<Room> GetRoomWithTypeById(int RoomId)
        {
            var result = await dbContext.Rooms
                .Include(r => r.RoomType)
                .FirstOrDefaultAsync(r => r.Id == RoomId);
            if (result == null) throw new Exception($"ROOM REPOSITORY ERROR: No room with id {RoomId} found.");
            return result;
        }
    }
}