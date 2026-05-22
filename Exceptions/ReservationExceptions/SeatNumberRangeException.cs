namespace CinemaBookingApp2.Exceptions.ReservationExceptions
{
    public sealed class SeatNumberRangeException:CustomException
    {
        public SeatNumberRangeException(): base("Wybrane miejsce nie istnieje, wskaż miejsce z przedziału 1-10")
        {
            
        }
    }
}
