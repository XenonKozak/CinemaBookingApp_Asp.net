using System.Threading.Tasks;
using CinemaBookingApp2.DTOs.AuthDTOs;
using CinemaBookingApp2.Models;

namespace CinemaBookingApp2.Interfaces
{
    public interface IAuthService
    {
        Task Register(RegisterUserDto request);
        Task<IEnumerable<GetUsersDto>> GetAllUsers();
        Task<GetUsersDto> GetUserById(Guid id);
        Task<string> Login(LoginUserDto request);
        Task<IEnumerable<ActivityLogEntity>> GetActivityLogsAsync();
    }
}
