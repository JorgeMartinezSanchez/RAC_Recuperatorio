using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace rec_be.DTOs.GuestDTOs
{
    public class GuestResponseDTO
    {
        public int Id { get; init; }
        public string FirstName { get; init; } = "";
        public string SecondName { get; init; } = "";
        public string LastName { get; init; } = "";
        public string IDCard { get; init; } = "";
        public string PhoneNumber { get; init; } = "";
        public string Email { get; init; } = "";
    }
}