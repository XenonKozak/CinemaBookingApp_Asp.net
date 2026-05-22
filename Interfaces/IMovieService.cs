using CinemaBookingApp2.DTOs.MovieDTOs;

namespace CinemaBookingApp2.Interfaces
{
    public interface IMovieService
    {
        Task<IEnumerable<GetMovieDto>> GetMovies();
        Task<IEnumerable<GetMovieWithScreeningsDto>> GetMoviesWithScreenings();
        Task<GetMovieDto?> GetMovieById(Guid id);
        Task<GetMovieWithScreeningsDto?> GetMovieByIdWithScreenings(Guid id);
        Task<Guid?> CreateMovie(CreateMovieDto dto);
        Task<bool> UpdateMovie(Guid id, UpdateMovieDto dto);
        Task<bool> UpdatePosterUrl(Guid id, string imageUrl);
        Task<bool> DeleteMovie(Guid id);
    }
}
