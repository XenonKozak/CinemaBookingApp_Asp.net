using System;

namespace CinemaBookingApp2.DTOs.ServiceBusDTOs
{
    public class TicketMessageDto
    {
        public Guid ReservationId { get; set; }
        public int SeatNumber { get; set; }
        public string Row { get; set; } = string.Empty;
        public Guid ScreeningId { get; set; }
        public Guid UserId { get; set; }
        public DateTime ReservationDate { get; set; }
        public bool IsCancellation { get; set; } = false;
    }
}
