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
          var reservation = await _context.Reservations.ToListAsync();
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
                .Where(r => r.UserId == userId)
                .ToListAsync();
            
            return _mapper.Map<IEnumerable<GetReservationDto>>(reservations);
        }

        public async Task<GetReservationDto> GetById(Guid id)
        { 
          var reservation = await _context.Reservations.SingleOrDefaultAsync(
          r => r.Id == id);
            if (reservation is null)
            {
                return null;
            }

            return _mapper.Map<GetReservationDto>(reservation);
        }

        public async Task<Guid?>Create(CreateReservationDto dto, Guid userId)
        {
            if (!_rows.Contains(dto.Row))
            {
                return null;
            }

            var alreadyExist = await _context.Reservations.AnyAsync(r =>
            r.SeatNumber == dto.SeatNumber &&
            r.Row == dto.Row &&
            r.ReservationDate == dto.ReservationDate &&
            r.ScreeningId == dto.ScreeningId);

            if (alreadyExist)
            {
                return null;
            }

            var reservation = Reservation.CreateReservation(Guid.NewGuid(), dto.SeatNumber, dto.Row, dto.ReservationDate, dto.ScreeningId, userId);
            _context.Reservations.Add(reservation);
            await _context.SaveChangesAsync();

            var message = new CinemaBookingApp2.DTOs.ServiceBusDTOs.TicketMessageDto
            {
                ReservationId = reservation.Id,
                SeatNumber = reservation.SeatNumber,
                Row = reservation.Row,
                ScreeningId = reservation.ScreeningId,
                UserId = reservation.UserId,
                ReservationDate = reservation.ReservationDate
            };
            await _serviceBusService.SendMessageAsync(message, "ticket-queue");

            return reservation.Id;
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

        public async Task<bool> Delete(Guid id, Guid userId, string role)
        {
            var reservation = await _context.Reservations.SingleOrDefaultAsync(r => r.Id == id);
            if (reservation == null)
            {
                return false;
            }

            if (reservation.UserId != userId && role != "Admin")
            {
                return false;
            }

            _context.Reservations.Remove(reservation);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
