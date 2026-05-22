using System.ComponentModel.DataAnnotations;

namespace CinemaBookingApp2.DTOs.ScreeningDTOs
{
    public class GetScreeningDto
    {
        public Guid Id { get; set; }
        public Guid MovieId { get; set; }
        public string MovieTitle { get; set; } = string.Empty; // Added for convenience in UI
        public DateTime ScreeningTime { get; set; }
    }
}
