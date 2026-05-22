using CinemaBookingApp2.Exceptions.ScreeningExceptions;
using System.ComponentModel.DataAnnotations;
using System.Xml.Linq;

namespace CinemaBookingApp2.Models
{
    public class Screening
    {
        public Guid Id { get; private set; } = Guid.NewGuid();
        public string MovieTitle { get; private set; } = string.Empty;
        public string Description { get; private set; } = string.Empty;
        public int Duration { get; private set; }
        public string? ImageUrl { get; set; }
        public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();


        public Screening(Guid id,string movieTitle, string description, int duration)
        {
            Id = id == Guid.Empty ? Guid.NewGuid() : id;
            UpdateScreening(movieTitle, description, duration);   
        }

        public void UpdateScreening(string movieTitle, string description, int duration)
        {
            if (string.IsNullOrWhiteSpace(movieTitle))
            {
                throw new EmptyMovieTitleException();
            }

            if (string.IsNullOrWhiteSpace(description))
            {
                throw new EmptyDescriptionException();
            }
            if (duration <= 0 || duration >= 240)
            {
                throw new DurationRangeException();
            }

            MovieTitle = movieTitle;
            Description = description;
            Duration = duration;
        }

        public static Screening CreateScreening(Guid id, string movieTitle, string description, int duration)
        {
            return new Screening(id, movieTitle, description, duration);
        }

    }
}
