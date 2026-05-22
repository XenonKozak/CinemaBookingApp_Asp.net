using CinemaBookingApp2.DTOs.ScreeningDTOs;
using System.ComponentModel.DataAnnotations;

namespace CinemaBookingApp2.DTOs.MovieDTOs
{
    public class GetMovieWithScreeningsDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int Duration { get; set; }
        public string? ImageUrl { get; set; }
        public List<GetScreeningDto> Screenings { get; set; } = new List<GetScreeningDto>();
    }
}
