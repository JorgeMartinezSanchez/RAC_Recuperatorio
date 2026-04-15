using Microsoft.AspNetCore.Mvc;
using rec_be.Interfaces.Services;

namespace rec_be.Controller
{
    [ApiController]
    [Route("[controller]")]
    public class RoomController : ControllerBase
    {
        private IRoomService roomService;

        public RoomController(IRoomService _roomService)
        {
            roomService = _roomService;
        }

        [HttpGet("All")]
        public async Task<IActionResult> GetAllRooms()
        {
            var room = await roomService.GetAllRooms();
            return Ok(room);
        }
        [HttpGet("{RoomNumber}")]
        public async Task<IActionResult> GetRoom(string RoomNumber)
        {
            var room = await roomService.GetRoomByRoomNumber(RoomNumber);
            return Ok(room);
        }
        [HttpPut("occupation/id/{RoomId}/{newOccupation}")]
        public async Task<IActionResult> SetOccupation(int RoomId, bool newOccupation)
        {
            await roomService.ChangeOccupation(RoomId, newOccupation);
            return Ok();
        }
        [HttpGet("All/Type/{RoomType}")]
        public async Task<IActionResult> GetAllRoomFromType(string RoomType)
        {
            var room = await roomService.GetAllRoomsFromRoomType(RoomType);
            return Ok(room);
        }
    }
}