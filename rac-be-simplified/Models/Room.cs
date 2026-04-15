using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace rec_be.Models
{
    public class Room
    {
        public int Id { get; set; }
        public int RoomTypeId { get; set; }
        public string RoomNumber { get; set; } = "";
        public bool Occupied { get; set; }

        // Navegación
        public RoomType RoomType { get; set; } = null!;
        public ICollection<Booking> Bookings { get; set; } = [];
    }
}