using System.ComponentModel.DataAnnotations;

namespace CinemaBookingApp2.DTOs.ScreeningDTOs
{
    public class GetScreeningDto
    {
        public Guid Id { get; set; }
        [Required]
        [MinLength(1), MaxLength(100)]
        public string MovieTitle { get; set; } = string.Empty;
        [Required]
        [MinLength(10), MaxLength(100)]
        public string Description { get; set; } = string.Empty;
        [Required]
        public int Duration { get; set; }
        public string? ImageUrl { get; set; }
    }
}
