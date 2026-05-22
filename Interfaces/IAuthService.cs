using CinemaBookingApp2.DTOs.AuthDTOs;

namespace CinemaBookingApp2.Interfaces
{
    public interface IAuthService
    {
        Task Register(RegisterUserDto request);
        Task<IEnumerable<GetUsersDto>> GetAllUsers();
        Task<GetUsersDto> GetUserById(Guid id);
        public string Login(LoginUserDto request);
    }
}
