namespace CinemaBookingApp2.Exceptions.ReservationExceptions
{
    public sealed class EmptyTitleException:CustomException
    {
        public EmptyTitleException() : base("Tytuł nie może być pusty")
        {
            
        }
    }
}
