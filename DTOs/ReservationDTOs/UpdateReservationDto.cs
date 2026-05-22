using System.ComponentModel.DataAnnotations;

namespace CinemaBookingApp2.DTOs.ReservationDto
{
    public class UpdateReservationDto
    { 
        [Required]
        [Range(1, 10)]
        public int SeatNumber { get; set; }
        [Required]
        public string Row { get; set; } = string.Empty;
    }
}
