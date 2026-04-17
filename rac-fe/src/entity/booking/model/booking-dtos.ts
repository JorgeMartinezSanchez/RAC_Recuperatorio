export interface BookingResponseDTO {
  id: number;
  roomNumber: string;
  roomTypeName: string;
  startDate: string; // DateOnly se serializa como string en formato ISO (YYYY-MM-DD)
  endDate: string;
  status: string;
  total: number;
}

export interface BookingRequestDTO {
  roomId: number;
  startDate: string; // DateOnly se serializa como string YYYY-MM-DD
  endDate: string;   // DateOnly se serializa como string YYYY-MM-DD
  guestIds: number[];
}