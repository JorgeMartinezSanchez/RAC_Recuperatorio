using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace rec_be.Models
{
    public class RoomGuest
    {
        public int BookingId { get; set; }
        public int GuestId { get; set; }

        // Navegación
        public Booking Booking { get; set; } = null!;
        public Guest Guest { get; set; } = null!;
    }
}