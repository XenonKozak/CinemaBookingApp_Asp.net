using System.ComponentModel.DataAnnotations;

namespace CinemaBookingApp2.Models
{
    public class Screening
    {
        public Guid Id { get; private set; } = Guid.NewGuid();
        public Guid MovieId { get; private set; }
        public Movie Movie { get; set; } = null!;
        public DateTime ScreeningTime { get; private set; }
        public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();

        public Screening(Guid id, Guid movieId, DateTime screeningTime)
        {
            Id = id == Guid.Empty ? Guid.NewGuid() : id;
            MovieId = movieId;
            ScreeningTime = screeningTime;
        }

        public void UpdateScreening(DateTime screeningTime)
        {
            ScreeningTime = screeningTime;
        }

        public static Screening CreateScreening(Guid id, Guid movieId, DateTime screeningTime)
        {
            return new Screening(id, movieId, screeningTime);
        }
    }
}
