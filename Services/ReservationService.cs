using System.ComponentModel;
using System.Diagnostics;
using AutoMapper;
using CinemaBookingApp2.Db;
using CinemaBookingApp2.DTOs.ReservationDto;
using CinemaBookingApp2.Interfaces;
using CinemaBookingApp2.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CinemaBookingApp2.Services
{
    public class ReservationService : IReservationService
    {
        
        private readonly ReservationContext _context;
        private readonly IMapper _mapper;
        private readonly IServiceBusService _serviceBusService;
        private readonly List<String> _rows = new()
        {
            "A", "B", "C", "D","E","F"
        };

        public ReservationService(ReservationContext context, IMapper mapper, IServiceBusService serviceBusService)
        {
            _context = context;
            _mapper = mapper;
            _serviceBusService = serviceBusService;
        }

        public async Task<IEnumerable<GetReservationDto>> GetAll()
        {
            var reservation = await _context.Reservations
                .Include(r => r.Screening)
                    .ThenInclude(s => s.Movie)
                .ToListAsync();
            if (reservation is null)
            {
                return null;
            }

            return _mapper.Map<IEnumerable<GetReservationDto>>(reservation);
        }

        public async Task<IEnumerable<GetReservationDto>> GetByUserId(Guid userId)
        {
            var reservations = await _context.Reservations
                .Include(r => r.Screening)
                    .ThenInclude(s => s.Movie)
                .Where(r => r.UserId == userId)
                .ToListAsync();
            
            return _mapper.Map<IEnumerable<GetReservationDto>>(reservations);
        }

        public async Task<GetReservationDto> GetById(Guid id)
        { 
            var reservation = await _context.Reservations
                .Include(r => r.Screening)
                    .ThenInclude(s => s.Movie)
                .SingleOrDefaultAsync(r => r.Id == id);
            if (reservation is null)
            {
                return null;
            }

            return _mapper.Map<GetReservationDto>(reservation);
        }

        public async Task<Guid?>Create(CreateReservationDto dto, Guid userId)
        {
            if (dto.Seats == null || !dto.Seats.Any())
            {
                return null;
            }

            foreach (var seat in dto.Seats)
            {
                if (!_rows.Contains(seat.Row))
                {
                    return null;
                }

                var alreadyExist = await _context.Reservations.AnyAsync(r =>
                    r.SeatNumber == seat.SeatNumber &&
                    r.Row == seat.Row &&
                    r.ReservationDate == dto.ReservationDate &&
                    r.ScreeningId == dto.ScreeningId);

                if (alreadyExist)
                {
                    return null; // Zwracamy null jeśli JAKIEKOLWIEK wybrane miejsce jest już zajęte
                }
            }

            var bookingId = Guid.NewGuid();
            var message = new CinemaBookingApp2.DTOs.ServiceBusDTOs.TicketMessageDto
            {
                BookingId = bookingId,
                ScreeningId = dto.ScreeningId,
                UserId = userId,
                ReservationDate = dto.ReservationDate,
                Seats = new List<CinemaBookingApp2.DTOs.ServiceBusDTOs.SeatInfo>()
            };

            foreach (var seat in dto.Seats)
            {
                var reservation = Reservation.CreateReservation(Guid.NewGuid(), seat.SeatNumber, seat.Row, dto.ReservationDate, dto.ScreeningId, userId, bookingId);
                _context.Reservations.Add(reservation);
                
                message.Seats.Add(new CinemaBookingApp2.DTOs.ServiceBusDTOs.SeatInfo
                {
                    SeatNumber = seat.SeatNumber,
                    Row = seat.Row
                });
            }

            await _context.SaveChangesAsync();
            await _serviceBusService.SendMessageAsync(message, "ticket-queue");

            return bookingId;
        }

        public async Task<bool> Update(Guid id, UpdateReservationDto dto)
        {
            var reservationExist = await _context.Reservations.SingleOrDefaultAsync(r => r.Id == id);
            if (reservationExist == null)
            {
                return false;
            }

            reservationExist.UpdateReservation(
                 dto.SeatNumber,dto.Row);

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> Delete(Guid bookingId, Guid userId, string role)
        {
            var reservations = await _context.Reservations.Where(r => r.BookingId == bookingId).ToListAsync();
            if (reservations == null || !reservations.Any())
            {
                // Fallback na wypadek starego Id
                var singleRes = await _context.Reservations.SingleOrDefaultAsync(r => r.Id == bookingId);
                if (singleRes != null)
                {
                    reservations = new List<Reservation> { singleRes };
                }
                else
                {
                    return false;
                }
            }

            // Sprawdzamy czy użytkownik ma prawo (wystarczy sprawdzić pierwszy z brzegu)
            if (reservations.First().UserId != userId && role != "Admin")
            {
                return false;
            }

            _context.Reservations.RemoveRange(reservations);
            await _context.SaveChangesAsync();

            var first = reservations.First();
            var message = new CinemaBookingApp2.DTOs.ServiceBusDTOs.TicketMessageDto
            {
                BookingId = first.BookingId,
                ScreeningId = first.ScreeningId,
                UserId = first.UserId,
                ReservationDate = first.ReservationDate,
                IsCancellation = true,
                Seats = reservations.Select(r => new CinemaBookingApp2.DTOs.ServiceBusDTOs.SeatInfo { SeatNumber = r.SeatNumber, Row = r.Row }).ToList()
            };
            await _serviceBusService.SendMessageAsync(message, "ticket-queue");

            return true;
        }
    }
}
