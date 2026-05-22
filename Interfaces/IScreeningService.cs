using CinemaBookingApp2.DTOs.ScreeningDTOs;
using CinemaBookingApp2.Models;

namespace CinemaBookingApp2.Interfaces
{
    public interface IScreeningService
    {
        Task<IEnumerable<GetScreeningDto>> GetScreenings();
        Task<GetScreeningDto> GetScreeningById(Guid id);
        Task<GetScreeningWithReservDto> GetScreeningByIdWthReserv(Guid id);
        Task<Guid?> CreateScreeningId(CreateScreeningDto dto);
        Task<bool> UpdateScreeningById(Guid id, UpdateScreeningDto dto);
        Task<bool> UpdatePosterUrl(Guid id, string imageUrl);
        Task<bool> DeleteScreeningById(Guid id);
    }
}
