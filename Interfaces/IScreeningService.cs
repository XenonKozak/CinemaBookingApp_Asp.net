using CinemaBookingApp2.DTOs.ScreeningDTOs;

namespace CinemaBookingApp2.Interfaces
{
    public interface IScreeningService
    {
        Task<IEnumerable<GetScreeningDto>> GetScreenings();
        Task<GetScreeningDto> GetScreeningById(Guid id);
        Task<GetScreeningWithReservDto> GetScreeningByIdWthReserv(Guid id);
        Task<Guid?> CreateScreeningId(CreateScreeningDto dto);
        Task<bool> UpdateScreeningById(Guid id, UpdateScreeningDto dto);
        Task<bool> DeleteScreeningById(Guid id);
    }
}
