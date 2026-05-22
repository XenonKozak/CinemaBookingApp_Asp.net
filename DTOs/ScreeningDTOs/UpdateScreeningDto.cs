using System.ComponentModel.DataAnnotations;

namespace CinemaBookingApp2.DTOs.ScreeningDTOs
{
    public class UpdateScreeningDto
    {
        [Required]
        public DateTime ScreeningTime { get; set; }
    }
}
