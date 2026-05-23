using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using CinemaBookingApp2.Db;
using CinemaBookingApp2.DTOs.AuthDTOs;
using CinemaBookingApp2.Interfaces;
using CinemaBookingApp2.Models;
using CinemaBookingApp2.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace CinemaBookingApp2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
      
        public AuthController(IAuthService service)
        {
            _authService = service;
        }

        [HttpPost("Register")]
        public async Task<IActionResult>Register(RegisterUserDto request)
        {
            await _authService.Register(request);
            return Ok();
        }

        [HttpPost("Login")]
        public async Task<ActionResult<string>> Login(LoginUserDto request)
        {
           var token  = await _authService.Login(request);
           if (token == null) return BadRequest();
            
            return Ok(token);
        }

        [Authorize(Roles ="Admin")]
        [HttpGet]
        public async Task<ActionResult<GetUsersDto>>GetUsers()
        {
            var users = await _authService.GetAllUsers();
            if (users == null)
            {
                return NotFound();
            }

            return Ok(users);
        }

        [Authorize(Roles ="Admin")]
        [HttpGet("{id:guid}")]
        public async Task<ActionResult<GetUsersDto>> GetUser(Guid id)
        { 
            var user = await _authService.GetUserById(id);
            if (user == null)
            {
                return NotFound();
            }

            return Ok(user);
        }

        [Authorize(Roles ="Admin")]
        [HttpGet("Logs")]
        public async Task<ActionResult<IEnumerable<ActivityLogEntity>>> GetLogs()
        {
            var logs = await _authService.GetActivityLogsAsync();
            return Ok(logs);
        }
    }
}
