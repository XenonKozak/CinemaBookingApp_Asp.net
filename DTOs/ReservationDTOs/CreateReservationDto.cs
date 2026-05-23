using System.ComponentModel.DataAnnotations;

namespace CinemaBookingApp2.DTOs.ReservationDto
{
    public class CreateReservationDto
    {
        [Required]
        [MinLength(1, ErrorMessage = "Musisz wybrać co najmniej jedno miejsce.")]
        public List<SeatRequestDto> Seats { get; set; } = new List<SeatRequestDto>();
        public DateTime ReservationDate { get; set; }
        [Required]
        public Guid ScreeningId { get; set; }
    }
}
