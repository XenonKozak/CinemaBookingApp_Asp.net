using System;

namespace CinemaBookingApp2.DTOs.ServiceBusDTOs
{
    public class ScreeningCreatedMessageDto
    {
        public Guid ScreeningId { get; set; }
        public string MovieTitle { get; set; } = string.Empty;
        public int Duration { get; set; }
    }
}
