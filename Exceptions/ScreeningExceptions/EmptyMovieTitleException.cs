namespace CinemaBookingApp2.Exceptions.ScreeningExceptions
{
    public sealed class EmptyMovieTitleException : CustomException
    {
        public EmptyMovieTitleException() : base("Należy wpisać tytuł filmu")
        {

        }
    }
}
