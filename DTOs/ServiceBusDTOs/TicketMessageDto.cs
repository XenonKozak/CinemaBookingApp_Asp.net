using System;

namespace CinemaBookingApp2.DTOs.ServiceBusDTOs
{
    public class TicketMessageDto
    {
        public Guid BookingId { get; set; }
        public List<SeatInfo> Seats { get; set; } = new List<SeatInfo>();
        public Guid ScreeningId { get; set; }
        public Guid UserId { get; set; }
        public DateTime ReservationDate { get; set; }
        public bool IsCancellation { get; set; } = false;
    }

    public class SeatInfo
    {
        public int SeatNumber { get; set; }
        public string Row { get; set; } = string.Empty;
    }
}
