using System.ComponentModel.DataAnnotations;

namespace CinemaBookingApp2.Models
{
    public class Movie
    {
        public Guid Id { get; private set; } = Guid.NewGuid();
        public string Title { get; private set; } = string.Empty;
        public string Description { get; private set; } = string.Empty;
        public int Duration { get; private set; }
        public string? ImageUrl { get; set; }
        public ICollection<Screening> Screenings { get; set; } = new List<Screening>();

        public Movie(Guid id, string title, string description, int duration)
        {
            Id = id == Guid.Empty ? Guid.NewGuid() : id;
            UpdateMovie(title, description, duration);
        }

        public void UpdateMovie(string title, string description, int duration)
        {
            if (string.IsNullOrWhiteSpace(title)) throw new ArgumentException("Title cannot be empty");
            if (string.IsNullOrWhiteSpace(description)) throw new ArgumentException("Description cannot be empty");
            if (duration <= 0 || duration >= 300) throw new ArgumentException("Invalid duration");

            Title = title;
            Description = description;
            Duration = duration;
        }

        public static Movie CreateMovie(Guid id, string title, string description, int duration)
        {
            return new Movie(id, title, description, duration);
        }
    }
}
