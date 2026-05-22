namespace CinemaBookingApp2.Exceptions.ScreeningExceptions
{
    public sealed class EmptyDescriptionException: CustomException
    {
        public EmptyDescriptionException(): base("Należy wpisać opis filmu")
        {
            
        }
    }
}
