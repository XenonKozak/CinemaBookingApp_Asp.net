using CinemaBookingApp2.DTOs.ReservationDto;
using CinemaBookingApp2.DTOs.MovieDTOs;
using System.ComponentModel.DataAnnotations;

namespace CinemaBookingApp2.DTOs.ScreeningDTOs
{
    public class GetScreeningWithReservDto
    {
        public Guid Id { get; set; }
        public Guid MovieId { get; set; }
        public string MovieTitle { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int Duration { get; set; }
        public string? ImageUrl { get; set; }
        public GetMovieDto Movie { get; set; } = null!;
        public DateTime ScreeningTime { get; set; }
        public List<GetReservationDto> Reservations { get; set; } = new List<GetReservationDto>();
    }
}
