using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace rec_be.DTOs.GuestDTOs
{
    public class GuestRequestDTO
    {
        [Required]
        public string FirstName { get; init; } = "";
        public string SecondName { get; init; } = "";
        [Required]
        public string LastName { get; init; } = "";
        [Required]
        public string IDCard { get; init; } = "";
        [Required]
        public string PhoneNumber { get; init; } = "";
        [Required]
        public string Email { get; init; } = "";
    }
}