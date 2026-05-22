using System.ComponentModel.DataAnnotations;

namespace CinemaBookingApp2.DTOs.ScreeningDTOs
{
    public class CreateScreeningDto
    {
        [Required]
        public Guid MovieId { get; set; }
        
        [Required]
        public DateTime ScreeningTime { get; set; }
    }
}
