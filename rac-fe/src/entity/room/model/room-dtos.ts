export interface RoomResponseDTO {
  id: number;
  roomNumber: string;
  roomType: string;
  price: number;
  capacity: number;
  occupied: boolean;
}

export interface RoomRequestDTO {
  roomNumber: string;
  roomType: string;
  price: number;
  capacity: number;
  occupied: boolean;
}