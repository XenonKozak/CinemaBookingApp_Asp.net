using System;

namespace CinemaBookingApp2.DTOs.ServiceBusDTOs
{
    public class UserCreatedMessageDto
    {
        public Guid UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }
}
