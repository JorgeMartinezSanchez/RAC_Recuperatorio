using rec_be.Interfaces.States;
using rec_be.Models;

namespace rec_be.States.Booking_
{
    public class PendingState : IBookingState
    {
        public void CheckIn(Booking booking)
        {
            booking.Status = "active";
        }
 
        public void CheckOut(Booking booking)
        {
            throw new Exception("BOOKING STATE ERROR: Check-out cannot be made because it's on pending state.");
        }
 
        public void Cancel(Booking booking)
        {
            booking.Status = "cancelled";
        }
    }
}