export interface GuestResponseDTO {
  id: number;
  firstName: string;
  secondName: string;
  lastName: string;
  idCard: string;
  phoneNumber: string;
  email: string;
}

export interface GuestRequestDTO {
  firstName: string;
  secondName?: string; // Opcional porque no tiene [Required]
  lastName: string;
  idCard: string;
  phoneNumber: string;
  email: string;
}