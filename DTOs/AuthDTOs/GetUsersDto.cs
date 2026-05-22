using System.ComponentModel.DataAnnotations;

namespace CinemaBookingApp2.DTOs.AuthDTOs
{
    public class GetUsersDto
    {
        public Guid Id { get; set; }
        [Required]
        public string UserName { get; set; } = string.Empty;
        [Required]
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }
}
