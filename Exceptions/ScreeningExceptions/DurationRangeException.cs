namespace CinemaBookingApp2.Exceptions.ScreeningExceptions
{
    public sealed class DurationRangeException: CustomException
    {
        public DurationRangeException(): base("Należy podać przedział czasowy od 1 do 240 min")
        {
            
        }
    }
}
