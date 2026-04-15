using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace rec_be.Models
{
    public class RoomType
    {
        public int Id { get; set; }
        public string TypeName { get; set; } = "";
        public decimal Price { get; set; }
        public int Capacity { get; set; }

        // Navegación
        public ICollection<Room> Rooms { get; set; } = [];
    }
}