using AutoMapper;
using CinemaBookingApp2.Db;
using CinemaBookingApp2.DTOs.AuthDTOs;
using CinemaBookingApp2.Interfaces;
using CinemaBookingApp2.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace CinemaBookingApp2.Services
{
    public class AuthService : IAuthService
    {
        private readonly ReservationContext _context;
        private readonly IPasswordHasher<User> _passwordHasher;
        private readonly IConfiguration _configuration;
        private readonly IMapper _mapper;
        private readonly IServiceBusService _serviceBusService;

        public AuthService(ReservationContext context, IPasswordHasher<User> hasher, IConfiguration configuration, IMapper mapper, IServiceBusService serviceBusService)
        {
            _context = context;
            _passwordHasher = hasher;
            _configuration = configuration;
            _mapper = mapper;
            _serviceBusService = serviceBusService;
        }

        public async Task Register(RegisterUserDto request)
        {
            var user = User.CreateUser(Guid.NewGuid(), request.UserName, request.Password, request.Email);

            user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var message = new CinemaBookingApp2.DTOs.ServiceBusDTOs.UserCreatedMessageDto
            {
                UserId = user.Id,
                UserName = user.UserName,
                Email = user.Email,
                Role = user.Role
            };
            await _serviceBusService.SendMessageAsync(message, "user-events");
        }

        public string Login(LoginUserDto request)
        {
            var user = _context.Users.FirstOrDefault(u => u.Email == request.Email || u.UserName == request.UserName);
            if (user is null || _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password) == PasswordVerificationResult.Failed)
            {
                return null;
            }

            return GenerateToken(user);

        }

        public async Task<IEnumerable<GetUsersDto>> GetAllUsers()
        { 
            var users = await _context.Users.ToListAsync();
            if (users is null)
            {
                return null;
            }
            return _mapper.Map<IEnumerable<GetUsersDto>>(users);
        }

        public async Task<GetUsersDto> GetUserById(Guid id)
        {
            var user = await _context.Users.SingleOrDefaultAsync(u => u.Id == id);
            if (user is null)
            {
                return null;
            }

            return _mapper.Map<GetUsersDto>(user);
        }

        private string GenerateToken(User user)
        {
            var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.UserName),
            new Claim(ClaimTypes.Role, user.Role)
        };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

    }
}
