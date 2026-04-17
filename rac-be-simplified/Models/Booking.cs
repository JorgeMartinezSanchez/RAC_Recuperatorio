using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace rec_be.Models
{
    public class Booking
    {
        public int Id { get; set; }
        public int RoomId { get; set; }
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public string Status { get; set; } = "";
        public DateTime? CheckInDate { get; set; }
        public DateTime? CheckOutDate { get; set; }
        public decimal Total { get; set; }
        public DateTime CreationDate { get; set; }

        // Navegación
        public Room Room { get; set; } = null!;
        public ICollection<RoomGuest> RoomGuests { get; set; } = [];
    }
}