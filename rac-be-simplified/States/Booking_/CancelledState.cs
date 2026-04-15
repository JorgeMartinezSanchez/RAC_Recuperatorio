using rec_be.Interfaces.States;
using rec_be.Models;

namespace rec_be.States.Booking_
{
    public class CancelledState : IBookingState
    {
        public void CheckIn(Booking booking)
        {
            throw new Exception("ERROR BOOKING STATE: Check-In cannot be done because it's cancelled.");
        }
        public void CheckOut(Booking booking)
        {
            throw new Exception("ERROR BOOKING STATE: Check-Out cannot be done because it's cancelled.");
        }
        public void Cancel(Booking booking)
        {
            throw new Exception("ERROR BOOKING STATE: This booking has been cancelled already.");
        }
    }
}