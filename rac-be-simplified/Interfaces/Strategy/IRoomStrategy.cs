using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using rec_be.DTOs.GuestDTOs;
using rec_be.Models;

namespace rec_be.Interfaces.Strategy
{
    public interface IRoomStrategy
    {

        string GetRoomNumber();
        bool IsOccupied();
        int GetRoomId();
        

        string GetRoomTypeName();
        decimal GetBasePrice();
        int GetMaxCapacity();
        

        string GetDescription();
        bool ValidateGuestCount(int guestCount);
        
        // Método para obtener el Room original si se necesita
        Room GetRoom();
    }
}