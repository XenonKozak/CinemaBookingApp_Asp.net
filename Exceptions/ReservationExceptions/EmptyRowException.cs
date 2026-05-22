namespace CinemaBookingApp2.Exceptions.ReservationExceptions
{
    public sealed class EmptyRowException:CustomException
    {
        public EmptyRowException(): base("Należy wybrać rząd")
        {
            
        }
    }
}
