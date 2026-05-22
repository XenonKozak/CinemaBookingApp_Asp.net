using System.ComponentModel.DataAnnotations;

namespace CinemaBookingApp2.DTOs.ReservationDto
{
    public class CreateReservationDto
    {
        [Required]
        [Range(1, 10)]
        public int SeatNumber { get; set; }
        [Required]
        public string Row { get; set; } = string.Empty;
        public DateTime ReservationDate { get; set; }
        [Required]
        public Guid ScreeningId { get; set; }
    }
}
