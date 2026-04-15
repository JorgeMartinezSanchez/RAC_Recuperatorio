using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using rec_be.Interfaces.Strategy;
using rec_be.Models;

namespace rec_be.RoomStrategy
{
    public class MatrimonialDoubleRoomStrategy : BaseRoomStrategy
    {
        public MatrimonialDoubleRoomStrategy(Room room) 
            : base(room) { }
        
        public override string GetDescription() => 
            "Matrimonial Room, good for the lovers!.";
        
        public override bool ValidateGuestCount(int guestCount) =>
            guestCount >= 1 && guestCount <= GetMaxCapacity();
    }
}