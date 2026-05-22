using System.ComponentModel.DataAnnotations;

namespace CinemaBookingApp2.DTOs.ScreeningDTOs
{
    public class UpdateScreeningDto
    {
        [Required]
        [MinLength(1), MaxLength(100)]
        public string MovieTitle { get; set; } = string.Empty;
        [Required]
        [MinLength(10), MaxLength(100)]
        public string Description { get; set; } = string.Empty;
        [Required]
        public int Duration { get; set; }
    }
}
