using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using rec_be.DTOs.GuestDTOs;
using rec_be.Interfaces.Strategy;
using rec_be.Models;

namespace rec_be.RoomStrategy
{
    public class SimpleRoomStrategy : BaseRoomStrategy
    {
        public SimpleRoomStrategy(Room room) 
            : base(room) { }
        
        public override string GetDescription() => 
            "Cheapest Room, good for travelers.";
        
        public override bool ValidateGuestCount(int guestCount) =>
            guestCount == 1 && guestCount <= GetMaxCapacity();
    }
}