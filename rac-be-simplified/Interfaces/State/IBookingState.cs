using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using rec_be.Models;

namespace rec_be.Interfaces.States
{
    public interface IBookingState
    {
        void CheckIn(Booking booking);
        void CheckOut(Booking booking);
        void Cancel(Booking booking);
    }
}