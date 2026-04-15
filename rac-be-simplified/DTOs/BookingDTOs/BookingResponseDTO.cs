namespace rec_be.DTOs.BookingDTOs
{
    public class BookingResponseDTO
    {
        public int Id { get; init; }
        public string RoomNumber { get; init; } = "";
        public string RoomTypeName { get; init; } = ""; 
        public DateOnly StartDate { get; init; }
        public DateOnly EndDate { get; init; }
        public string Status { get; init; } = "";
        public decimal Total { get; init; }
    }
}