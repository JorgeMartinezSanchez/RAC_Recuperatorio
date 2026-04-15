namespace rec_be.DTOs.RoomDTOs
{
    public class RoomResponseDTO
    {
        public int Id { get; init; }
        public string RoomNumber { get; init; } = "";
        public string RoomType { get; init; } = "";
        public decimal Price { get; init; }
        public int Capacity { get; init; }
        public bool Occupied { get; init; }
    }
}