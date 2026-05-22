using System.ComponentModel.DataAnnotations;

namespace CinemaBookingApp2.DTOs.MovieDTOs
{
    public class GetMovieDto
    {
        public Guid Id { get; set; }
        
        public string Title { get; set; } = string.Empty;
        
        public string Description { get; set; } = string.Empty;
        
        public int Duration { get; set; }
        
        public string? ImageUrl { get; set; }
    }
}
