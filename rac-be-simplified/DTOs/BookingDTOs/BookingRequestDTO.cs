using System.ComponentModel.DataAnnotations;

namespace rec_be.DTOs.BookingDTOs
{
    public class BookingRequestDTO
    {
        [Required]
        public int RoomId { get; init; }
        
        [Required] 
        public DateOnly StartDate { get; init; }
        
        [Required]
        public DateOnly EndDate { get; init; }
        
        [Required]
        public List<int> GuestIds { get; init; } = new List<int>();
    }
}