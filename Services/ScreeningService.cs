using AutoMapper;
using CinemaBookingApp2.Db;
using CinemaBookingApp2.DTOs.ScreeningDTOs;
using CinemaBookingApp2.Interfaces;
using CinemaBookingApp2.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using System.Text.Json;

namespace CinemaBookingApp2.Services
{
    public class ScreeningService : IScreeningService
    {
        private readonly ReservationContext _context;
        private readonly IMapper _mapper;
        private readonly IServiceBusService _serviceBusService;
        private readonly IDistributedCache _cache;
        private const string CacheKey = "all_screenings";

        public ScreeningService(ReservationContext context, IMapper mapper, IServiceBusService serviceBusService, IDistributedCache cache)
        {
            _context = context;
            _mapper = mapper;
            _serviceBusService = serviceBusService;
            _cache = cache;
        }

        public async Task<IEnumerable<GetScreeningDto>> GetScreenings()
        {
            try
            {
                var cachedData = await _cache.GetStringAsync(CacheKey);
                if (!string.IsNullOrEmpty(cachedData))
                {
                    return JsonSerializer.Deserialize<IEnumerable<GetScreeningDto>>(cachedData) ?? new List<GetScreeningDto>();
                }
            }
            catch (Exception ex)
            {
                // W razie problemów z połączeniem z Redisem, logujemy błąd i pobieramy dane bezpośrednio z SQL (odporność na awarie)
                Console.WriteLine($"[Redis Error] Błąd pobierania z cache: {ex.Message}");
            }

            var screenings = await _context.Screenings.ToListAsync();
            if (screenings is null)
            {
                return null;
            }

            var dtos = _mapper.Map<IEnumerable<GetScreeningDto>>(screenings);

            try
            {
                var cacheOptions = new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5)
                };
                await _cache.SetStringAsync(CacheKey, JsonSerializer.Serialize(dtos), cacheOptions);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Redis Error] Błąd zapisu do cache: {ex.Message}");
            }

            return dtos;
        }

        public async Task<GetScreeningDto> GetScreeningById(Guid id)
        {
            var screening = await _context.Screenings.SingleOrDefaultAsync(s => s.Id == id);
            if (screening is null)
            {
                return null;
            }
            return _mapper.Map<GetScreeningDto>(screening);
        }

        public async Task<GetScreeningWithReservDto> GetScreeningByIdWthReserv(Guid id)
        {
            var screening = await _context.Screenings.Include(s => s.Reservations).SingleOrDefaultAsync(s => s.Id == id);
            if (screening is null)
            {
                return null;
            }
            return _mapper.Map<GetScreeningWithReservDto>(screening);
        }

        public async Task<Guid?> CreateScreeningId(CreateScreeningDto dto)
        {
            var screeningExitst = await _context.Screenings.AnyAsync(
                s => s.MovieTitle == dto.MovieTitle &&
                s.Description == dto.Description &&
                s.Duration == dto.Duration);

            if (screeningExitst)
            {
                return null;
            }

            var screening = Screening.CreateScreening(Guid.NewGuid(), dto.MovieTitle, dto.Description, dto.Duration);
            await _context.Screenings.AddAsync(screening);
            await _context.SaveChangesAsync();

            // Czyszczenie cache po dodaniu nowego seansu
            await ClearCacheAsync();

            var message = new CinemaBookingApp2.DTOs.ServiceBusDTOs.ScreeningCreatedMessageDto
            {
                ScreeningId = screening.Id,
                MovieTitle = screening.MovieTitle,
                Duration = screening.Duration
            };
            await _serviceBusService.SendMessageAsync(message, "screening-events");

            return screening.Id;
        }

        public async Task<bool> UpdateScreeningById(Guid id, UpdateScreeningDto dto)
        {
            var screeningExist = await _context.Screenings.SingleOrDefaultAsync(s => s.Id == id);
         
            if (screeningExist == null)
            { 
                return false;
            }

            screeningExist.UpdateScreening(dto.MovieTitle, dto.Description, dto.Duration);
            await _context.SaveChangesAsync();

            // Czyszczenie cache po edycji
            await ClearCacheAsync();

            return true;
        }

        public async Task<bool> UpdatePosterUrl(Guid id, string imageUrl)
        {
            var screeningExist = await _context.Screenings.SingleOrDefaultAsync(s => s.Id == id);
         
            if (screeningExist == null)
            { 
                return false;
            }

            screeningExist.ImageUrl = imageUrl;
            await _context.SaveChangesAsync();

            // Czyszczenie cache po zmianie plakatu
            await ClearCacheAsync();

            return true;
        }

        public async Task<bool> DeleteScreeningById(Guid id)
        { 
            var screening = _context.Screenings.SingleOrDefault(s => s.Id == id);
            if (screening is null)
            {
                return false;
            }

             _context.Screenings.Remove(screening);
             await _context.SaveChangesAsync();

             // Czyszczenie cache po usunięciu seansu
             await ClearCacheAsync();

             return true;
        }

        private async Task ClearCacheAsync()
        {
            try
            {
                await _cache.RemoveAsync(CacheKey);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Redis Error] Błąd czyszczenia cache: {ex.Message}");
            }
        }
    }
}
