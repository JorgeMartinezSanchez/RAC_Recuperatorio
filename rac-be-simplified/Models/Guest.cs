using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace rec_be.Models
{
    public class Guest
    {
        public int Id { get; set; }
        public string FirstName { get; set; } = "";
        public string SecondName { get; set; } = "";
        public string LastName { get; set; } = "";
        public string IdCard { get; set; } = "";
        public string PhoneNumber { get; set; } = "";
        public string Email { get; set; } = "";

        // Navegación
        public ICollection<RoomGuest> RoomGuests { get; set; } = [];
    }
}