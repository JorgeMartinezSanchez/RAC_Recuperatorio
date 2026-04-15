using rec_be.Interfaces.States;
using rec_be.Models;

namespace rec_be.States.Booking_
{
    public class FinishedState : IBookingState
    {
        public void CheckIn(Booking booking)
        {
            throw new Exception("ERROR BOOKING STATE: Check-In cannot be done because it finished it's cycle.");
        }
        public void CheckOut(Booking booking)
        {
            throw new Exception("ERROR BOOKING STATE: Check-Out cannot be done because it finished it's cycle.");
        }
        public void Cancel(Booking booking)
        {
            throw new Exception("ERROR BOOKING STATE: Cannot be cancelled because it finished it's cycle.");
        }
    }
}