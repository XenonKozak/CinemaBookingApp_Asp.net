using AutoMapper;
using CinemaBookingApp2.Db;
using CinemaBookingApp2.DTOs.ScreeningDTOs;
using CinemaBookingApp2.Interfaces;
using CinemaBookingApp2.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace CinemaBookingApp2.Services
{
    public class ScreeningService : IScreeningService
    {
        private readonly ReservationContext _context;
        private readonly IMapper _mapper;
        private readonly IServiceBusService _serviceBusService;

        public ScreeningService(ReservationContext context, IMapper mapper, IServiceBusService serviceBusService)
        {
            _context = context;
            _mapper = mapper;
            _serviceBusService = serviceBusService;
        }

        public async Task<IEnumerable<GetScreeningDto>> GetScreenings()
        {
            var screenings = await _context.Screenings.Include(s => s.Movie).ToListAsync();
            return _mapper.Map<IEnumerable<GetScreeningDto>>(screenings);
        }

        public async Task<GetScreeningDto> GetScreeningById(Guid id)
        {
            var screening = await _context.Screenings.Include(s => s.Movie).SingleOrDefaultAsync(s => s.Id == id);
            if (screening == null) return null;
            return _mapper.Map<GetScreeningDto>(screening);
        }

        public async Task<GetScreeningWithReservDto> GetScreeningByIdWthReserv(Guid id)
        {
            var screening = await _context.Screenings.Include(s => s.Movie).Include(s => s.Reservations).SingleOrDefaultAsync(s => s.Id == id);
            if (screening == null) return null;
            return _mapper.Map<GetScreeningWithReservDto>(screening);
        }

        public async Task<Guid?> CreateScreeningId(CreateScreeningDto dto)
        {
            var movie = await _context.Movies.FindAsync(dto.MovieId);
            if (movie == null) return null;

            var screeningExist = await _context.Screenings.AnyAsync(s => s.MovieId == dto.MovieId && s.ScreeningTime == dto.ScreeningTime);
            if (screeningExist) return null;

            var screening = Screening.CreateScreening(Guid.NewGuid(), dto.MovieId, dto.ScreeningTime);
            await _context.Screenings.AddAsync(screening);
            await _context.SaveChangesAsync();

            var message = new CinemaBookingApp2.DTOs.ServiceBusDTOs.ScreeningCreatedMessageDto
            {
                ScreeningId = screening.Id,
                MovieTitle = movie.Title,
                Duration = movie.Duration
            };
            await _serviceBusService.SendMessageAsync(message, "screening-events");

            return screening.Id;
        }

        public async Task<bool> UpdateScreeningById(Guid id, UpdateScreeningDto dto)
        {
            var screening = await _context.Screenings.SingleOrDefaultAsync(s => s.Id == id);
            if (screening == null) return false;

            screening.UpdateScreening(dto.ScreeningTime);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteScreeningById(Guid id)
        {
            var screening = await _context.Screenings.SingleOrDefaultAsync(s => s.Id == id);
            if (screening == null) return false;

            _context.Screenings.Remove(screening);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
