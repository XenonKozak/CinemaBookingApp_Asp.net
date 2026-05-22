using CinemaBookingApp2.Models;
using System.ComponentModel.DataAnnotations;

namespace CinemaBookingApp2.DTOs.ReservationDto
{
    public class GetReservationDto
    {
        public Guid Id { get; set; }
        [Required]
        [Range(1, 10)]
        public int SeatNumber { get; set; }
        [Required]
        public string Row { get; set; }
        public DateTime ReservationDate { get; set; }
        public Guid ScreeningId { get; set; }
        public string MovieTitle { get; set; } = string.Empty;
    }
}
