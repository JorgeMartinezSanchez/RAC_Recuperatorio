import { apiClient } from '../../../shared/api/http-client';
import type { RoomRequestDTO, RoomResponseDTO } from '../model/room-dtos';

export const roomApi = {
  getAllRooms: () =>
    apiClient.get<RoomResponseDTO[]>('/Room/All'),

  getRoomByNumber: (roomNumber: string) =>
    apiClient.get<RoomResponseDTO>(`/Room/${roomNumber}`),

  createRoom: (roomData: RoomRequestDTO) =>
    apiClient.post<RoomResponseDTO>('/Room/Create', roomData), // Si tienes este endpoint

  updateRoom: (roomId: number, roomData: RoomRequestDTO) =>
    apiClient.put<RoomResponseDTO>(`/Room/Update/${roomId}`, roomData), // Si tienes este endpoint

  setOccupation: (roomId: number, newOccupation: boolean) =>
    apiClient.put(`/Room/occupation/id/${roomId}/${newOccupation}`),

  getAllRoomsByType: (roomType: string) =>
    apiClient.get<RoomResponseDTO[]>(`/Room/All/Type/${roomType}`)
};