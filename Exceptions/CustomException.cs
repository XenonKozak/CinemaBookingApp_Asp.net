namespace CinemaBookingApp2.Exceptions
{
    public abstract class CustomException: Exception
    {
        protected CustomException(string message) : base(message) { }
    }
}
