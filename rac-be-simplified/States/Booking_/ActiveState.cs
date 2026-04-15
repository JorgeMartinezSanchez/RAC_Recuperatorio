using rec_be.Interfaces.States;
using rec_be.Models;

namespace rec_be.States.Booking_
{
    public class ActiveState : IBookingState
    {
        public void CheckIn(Booking booking)
        {
            throw new Exception("BOOKING STATE ERROR: Check-In cannot be done because this booking is already active.");
        }
        public void CheckOut(Booking booking)
        {
            booking.Status = "finished";
        }
        public void Cancel(Booking booking)
        {
            booking.Status = "cancelled";
        }
    }
}