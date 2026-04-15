using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace rec_be.DTOs.RoomDTOs
{
    public class RoomRequestDTO
    {
        [Required]
        public string RoomNumber { get; init; } = "";
        [Required]
        public string RoomType { get; init; } = "";
        [Required]
        public decimal Price { get; init; }
        [Required]
        public int Capacity { get; init; }
        [Required]
        public bool Occupied { get; init; }
    }
}