namespace CinemaBookingApp2.Exceptions.AuthExceptions
{
    public sealed class EmptyRecordsException: CustomException
    {
        public EmptyRecordsException():base("Uzuepłnij dane w rubrykach")
        {
            
        }
    }
}
