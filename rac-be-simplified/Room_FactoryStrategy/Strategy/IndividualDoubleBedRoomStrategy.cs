using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using rec_be.DTOs.GuestDTOs;
using rec_be.Interfaces.Strategy;
using rec_be.Models;

namespace rec_be.RoomStrategy
{
    public class IndividualDoubleBedRoomStrategy : BaseRoomStrategy
    {
        public IndividualDoubleBedRoomStrategy(Room room) 
            : base(room) { }
        
        public override string GetDescription() => 
            "Room with 2 individual beds, ideal for family or friends.";
        
        public override bool ValidateGuestCount(int guestCount) =>
            guestCount >= 1 && guestCount <= GetMaxCapacity();
    }
}